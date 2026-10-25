import {beforeAll,afterAll,describe,expect,it} from 'vitest';
import {createClient} from '@supabase/supabase-js';

/** Execute only against a seeded disposable database. CI unit tests skip unless
    explicitly enabled by a human-operated workflow with protected test secrets. */
const keys=['MAMA_TEST_SUPABASE_URL','MAMA_TEST_SUPABASE_ANON_KEY','MAMA_TEST_USER_A_EMAIL',
 'MAMA_TEST_USER_A_PASSWORD','MAMA_TEST_USER_B_EMAIL','MAMA_TEST_USER_B_PASSWORD','MAMA_TEST_A_JOURNEY_ID'];
const enabled=process.env.MAMA_TEST_CONFIRM_DISPOSABLE==='true'
 &&keys.every(k=>Boolean(process.env[k]));
const env=(k:string)=>process.env[k]??'';
describe.skipIf(!enabled)('v0.7 private care planner two-account integration',()=>{
 const url=env('MAMA_TEST_SUPABASE_URL')||'https://disabled.invalid';
 const key=env('MAMA_TEST_SUPABASE_ANON_KEY')||'disabled-key';
 const a=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const b=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const journeyId=env('MAMA_TEST_A_JOURNEY_ID');
 let id:string|null=null,version=0,ownerId='';
 beforeAll(async()=>{
  const [ua,ub]=await Promise.all([
   a.auth.signInWithPassword({email:env('MAMA_TEST_USER_A_EMAIL'),password:env('MAMA_TEST_USER_A_PASSWORD')}),
   b.auth.signInWithPassword({email:env('MAMA_TEST_USER_B_EMAIL'),password:env('MAMA_TEST_USER_B_PASSWORD')})
  ]);
  if(ua.error||ub.error||!ua.data.user||!ub.data.user)throw new Error('Two test accounts are required');
  ownerId=ua.data.user.id;
  const journey=await a.from('journeys').select('id').eq('id',journeyId).single();
  if(journey.error||!journey.data)throw new Error('Test fixture journey must belong to A');
 });
 afterAll(async()=>{
  if(id)await a.from('care_plan_items').delete().eq('id',id).eq('version',version);
  await Promise.all([a.auth.signOut(),b.auth.signOut()]);
 });
 it('rejects account B insertion into A journey',async()=>{
  const r=await b.from('care_plan_items').insert({
   journey_id:journeyId,owner_id:ownerId,kind:'question',title:'Unauthorized entry',detail:'',
   state:'open',version:1
  });
  expect(r.error).not.toBeNull();
 });
 it('supports versioned edits, rejects stale updates, and isolates audit metadata',async()=>{
  const created=await a.from('care_plan_items').insert({
   journey_id:journeyId,owner_id:ownerId,kind:'question',
   title:'Disposable integration test question',detail:'',state:'open',version:1
  }).select('id,version').single();
  expect(created.error).toBeNull();
  id=created.data?.id??null;version=created.data?.version??0;
  expect(version).toBe(1);
  const hidden=await b.from('care_plan_items').select('id').eq('id',id);
  expect(hidden.error).toBeNull();expect(hidden.data).toEqual([]);
  const updated=await a.from('care_plan_items').update({state:'done',version:2})
   .eq('id',id).eq('version',1).select('id,version,state').single();
  expect(updated.error).toBeNull();expect(updated.data?.state).toBe('done');version=2;
  const replay=await a.from('care_plan_items').update({state:'open',version:2})
   .eq('id',id).eq('version',1).select('id').maybeSingle();
  expect(replay.error).toBeNull();expect(replay.data).toBeNull();
  const disallowed=await b.from('care_plan_items').update({state:'open',version:3})
   .eq('id',id).select('id');
  expect(disallowed.data).toEqual([]);
  const auditA=await a.from('care_plan_events').select('action,from_version,to_version')
   .eq('item_id',id);
  expect(auditA.error).toBeNull();
  expect((auditA.data??[]).map(e=>e.action)).toEqual(expect.arrayContaining(['INSERT','UPDATE']));
  const auditB=await b.from('care_plan_events').select('id').eq('item_id',id);
  expect(auditB.error).toBeNull();expect(auditB.data).toEqual([]);
 });
});
