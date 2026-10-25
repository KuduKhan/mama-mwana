import {beforeAll,afterAll,describe,expect,it} from 'vitest';
import {createClient} from '@supabase/supabase-js';
// Enabled ONLY by protected GitHub environment using a disposable instance.
const names=['MAMA_TEST_SUPABASE_URL','MAMA_TEST_SUPABASE_ANON_KEY','MAMA_TEST_USER_A_EMAIL','MAMA_TEST_USER_A_PASSWORD','MAMA_TEST_USER_B_EMAIL','MAMA_TEST_USER_B_PASSWORD','MAMA_TEST_A_JOURNEY_ID'];
const enabled=process.env.MAMA_TEST_CONFIRM_DISPOSABLE==='true'&&names.every(n=>!!process.env[n]);
const v=(n:string)=>process.env[n]??'';
describe.skipIf(!enabled)('v0.9 two-account family isolation',()=>{
 const url=v('MAMA_TEST_SUPABASE_URL')||'https://disabled.invalid',key=v('MAMA_TEST_SUPABASE_ANON_KEY')||'placeholder';
 const opts={auth:{persistSession:false,autoRefreshToken:false}};
 const a=createClient(url,key,opts),b=createClient(url,key,opts);
 let owner='',childId='',growthId='',vaccineId='',born='',order=1;
 const journeyId=v('MAMA_TEST_A_JOURNEY_ID');
 beforeAll(async()=>{
  const [aa,bb]=await Promise.all([
   a.auth.signInWithPassword({email:v('MAMA_TEST_USER_A_EMAIL'),password:v('MAMA_TEST_USER_A_PASSWORD')}),
   b.auth.signInWithPassword({email:v('MAMA_TEST_USER_B_EMAIL'),password:v('MAMA_TEST_USER_B_PASSWORD')})
  ]);
  if(aa.error||bb.error||!aa.data.user||!bb.data.user)throw new Error('Two disposable accounts are required.');
  owner=aa.data.user.id;
  const j=await a.from('journeys').select('due_date').eq('id',journeyId).single();
  if(j.error||!j.data)throw new Error('User A must own the seeded journey.');
  const due=j.data.due_date as string;
  born=new Date(Math.min(Date.now(),Date.parse(due+'T12:00:00Z'))).toISOString().slice(0,10);
  const c=await a.from('family_children').select('birth_order').eq('journey_id',journeyId);
  if(c.error)throw new Error('Apply v0.9 migration on disposable database first.');
  order=Math.max(0,...(c.data??[]).map(x=>Number(x.birth_order)))+1;
  if(order>8)throw new Error('Use a journey with an available birth order.');
 });
 afterAll(async()=>{
  if(vaccineId)await a.from('family_vaccine_entries').delete().eq('id',vaccineId);
  if(growthId)await a.from('family_growth_entries').delete().eq('id',growthId);
  if(childId)await a.from('family_children').delete().eq('id',childId);
  await Promise.all([a.auth.signOut(),b.auth.signOut()]);
 });
 it('rejects an account B child assigned to A journey',async()=>{
  const x=await b.from('family_children').insert({owner_id:owner,journey_id:journeyId,birth_order:order,display_name:'Unauthorized test',born_on:born,sex:'unknown',version:1});
  expect(x.error).not.toBeNull();
 });
 it('keeps child, measurement, vaccine and audit rows isolated',async()=>{
  const x=await a.from('family_children').insert({owner_id:owner,journey_id:journeyId,birth_order:order,display_name:'Disposable test child',born_on:born,sex:'unknown',version:1}).select('id').single();
  expect(x.error).toBeNull();childId=x.data?.id??'';expect(childId).toBeTruthy();
  const updated=await a.from('family_children').update({display_name:'Updated test child',version:2}).eq('id',childId).eq('version',1).select('version').single();
  expect(updated.error).toBeNull();expect(updated.data?.version).toBe(2);
  const replay=await a.from('family_children').update({display_name:'Stale overwrite',version:2}).eq('id',childId).eq('version',1).select('id');
  expect(replay.data).toEqual([]);
  const growth=await a.from('family_growth_entries').insert({owner_id:owner,child_id:childId,measured_on:born,weight_kg:3.1,version:1}).select('id').single();
  expect(growth.error).toBeNull();growthId=growth.data?.id??'';
  const dose=await a.from('family_vaccine_entries').insert({owner_id:owner,child_id:childId,vaccine_label:'Disposable sample dose',given_on:born,version:1}).select('id').single();
  expect(dose.error).toBeNull();vaccineId=dose.data?.id??'';
  for(const table of ['family_children','family_growth_entries','family_vaccine_entries','family_record_events']){
   const r=await b.from(table).select('id').eq(table==='family_children'?'id':'child_id',childId);
   expect(r.error).toBeNull();expect(r.data).toEqual([]);
  }
  const ownEvents=await a.from('family_record_events').select('action').eq('child_id',childId);
  expect(ownEvents.error).toBeNull();expect(ownEvents.data?.some(e=>e.action==='INSERT')).toBe(true);
 });
});
