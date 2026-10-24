import {beforeAll,afterAll,describe,expect,it} from 'vitest';
import {createClient} from '@supabase/supabase-js';

// Run ONLY against a disposable seeded Supabase instance, using two test users.
// CI skips these tests unless an operator supplies the opt-in test secrets.
const enabled=process.env.MAMA_TEST_CONFIRM_DISPOSABLE==='true'&&[
 'MAMA_TEST_SUPABASE_URL','MAMA_TEST_SUPABASE_ANON_KEY',
 'MAMA_TEST_USER_A_EMAIL','MAMA_TEST_USER_A_PASSWORD',
 'MAMA_TEST_USER_B_EMAIL','MAMA_TEST_USER_B_PASSWORD',
 'MAMA_TEST_A_JOURNEY_ID'
].every(name=>Boolean(process.env[name]));
const env=(name:string)=>process.env[name]??'';
describe.skipIf(!enabled)('v0.6 two-account Supabase RLS and optimistic-lock integration',()=>{
 const anon=env('MAMA_TEST_SUPABASE_ANON_KEY'),url=env('MAMA_TEST_SUPABASE_URL');
 const a=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
 const b=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
 const journeyId=env('MAMA_TEST_A_JOURNEY_ID');
 const recordId='v06-integration-'+crypto.randomUUID();
 let inserted=false;
 let latestVersion=0;
 beforeAll(async()=>{
  const [one,two]=await Promise.all([
   a.auth.signInWithPassword({email:env('MAMA_TEST_USER_A_EMAIL'),password:env('MAMA_TEST_USER_A_PASSWORD')}),
   b.auth.signInWithPassword({email:env('MAMA_TEST_USER_B_EMAIL'),password:env('MAMA_TEST_USER_B_PASSWORD')})
  ]);
  if(one.error||two.error)throw new Error('Both dedicated test-user sign-ins must succeed');
  const owns=await a.from('journeys').select('id').eq('id',journeyId).single();
  if(owns.error||!owns.data)throw new Error('Disposable fixture journey must belong to test user A');
 });
 afterAll(async()=>{
  if(inserted){
   await a.rpc('apply_clinical_change',{p_journey_id:journeyId,p_kind:'visit',p_source_id:recordId,p_expected_version:latestVersion,p_payload:{},p_delete:true});
  }
  await Promise.all([a.auth.signOut(),b.auth.signOut()]);
 });
 it('prevents user B reading user A clinical records',async()=>{
  const q=await b.from('journey_visits').select('journey_id').eq('journey_id',journeyId);
  expect(q.error).toBeNull();expect(q.data).toEqual([]);
 });
 it('prevents user B mutating another family journey',async()=>{
  const r=await b.rpc('apply_clinical_change',{p_journey_id:journeyId,p_kind:'visit',p_source_id:recordId,p_expected_version:0,p_payload:{scheduled_on:'2026-11-01',clinic:'Test facility',notes:'',attended:false},p_delete:false});
  expect(r.error?.message).toContain('MM_UNAUTHORIZED');
 });
 it('atomically versions user A clinical writes and rejects stale replay',async()=>{
  const create=await a.rpc('apply_clinical_change',{p_journey_id:journeyId,p_kind:'visit',p_source_id:recordId,p_expected_version:0,p_payload:{scheduled_on:'2026-11-01',clinic:'Integration test facility',notes:'',attended:false},p_delete:false});
  expect(create.error).toBeNull();inserted=true;latestVersion=create.data.version;expect(latestVersion).toBe(1);
  const update=await a.rpc('apply_clinical_change',{p_journey_id:journeyId,p_kind:'visit',p_source_id:recordId,p_expected_version:1,p_payload:{scheduled_on:'2026-11-02',clinic:'Integration test facility',notes:'',attended:true},p_delete:false});
  expect(update.error).toBeNull();latestVersion=update.data.version;expect(latestVersion).toBe(2);
  const stale=await a.rpc('apply_clinical_change',{p_journey_id:journeyId,p_kind:'visit',p_source_id:recordId,p_expected_version:1,p_payload:{scheduled_on:'2026-11-03',clinic:'Stale overwrite',notes:'',attended:false},p_delete:false});
  expect(stale.error?.message).toContain('MM_CONFLICT');
  const after=await a.from('journey_visits').select('version,clinic,attended').eq('journey_id',journeyId).eq('source_id',recordId).single();
  expect(after.data?.version).toBe(2);expect(after.data?.attended).toBe(true);
 });
 it('records only authorized actor metadata in event audit',async()=>{
  const q=await a.from('clinical_record_events').select('action,previous_version,next_version').eq('journey_id',journeyId).eq('source_id',recordId);
  expect(q.error).toBeNull();expect((q.data??[]).map(x=>x.action)).toEqual(expect.arrayContaining(['insert','update']));
  const denied=await b.from('clinical_record_events').select('id').eq('journey_id',journeyId);
  expect(denied.data).toEqual([]);
 });
});
