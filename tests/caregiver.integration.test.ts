import {beforeAll,afterAll,describe,expect,it} from 'vitest';
import {createClient} from '@supabase/supabase-js';
/** Protected workflow only. Disposable database with verified test identities. */
const keys=['MAMA_TEST_SUPABASE_URL','MAMA_TEST_SUPABASE_ANON_KEY',
 'MAMA_TEST_USER_A_EMAIL','MAMA_TEST_USER_A_PASSWORD',
 'MAMA_TEST_USER_B_EMAIL','MAMA_TEST_USER_B_PASSWORD','MAMA_TEST_A_JOURNEY_ID'];
const enabled=process.env.MAMA_TEST_CONFIRM_DISPOSABLE==='true'&&keys.every(k=>!!process.env[k]);
const env=(name:string)=>process.env[name]??'';
describe.skipIf(!enabled)('v1.0 caregiver access: verified, revocable and read-only',()=>{
 const url=env('MAMA_TEST_SUPABASE_URL')||'https://disabled.invalid';
 const key=env('MAMA_TEST_SUPABASE_ANON_KEY')||'disabled';
 const settings={auth:{persistSession:false,autoRefreshToken:false}};
 const a=createClient(url,key,settings),b=createClient(url,key,settings);
 let ownerId='',inviteId='',childId='',inviteVersion=0,recipient='';
 beforeAll(async()=>{
  const [aa,bb]=await Promise.all([
   a.auth.signInWithPassword({email:env('MAMA_TEST_USER_A_EMAIL'),password:env('MAMA_TEST_USER_A_PASSWORD')}),
   b.auth.signInWithPassword({email:env('MAMA_TEST_USER_B_EMAIL'),password:env('MAMA_TEST_USER_B_PASSWORD')})
  ]);
  if(aa.error||bb.error||!aa.data.user||!bb.data.user)throw new Error('Two verified test accounts are required.');
  if(!aa.data.user.email_confirmed_at||!bb.data.user.email_confirmed_at)throw new Error('Both disposable accounts must have verified emails.');
  ownerId=aa.data.user.id;recipient=(bb.data.user.email??'').toLowerCase();
  const owned=await a.from('family_children').select('id').eq('journey_id',env('MAMA_TEST_A_JOURNEY_ID')).order('birth_order',{ascending:true}).limit(1).single();
  if(owned.error||!owned.data)throw new Error('User A needs a disposable family child profile.');
  childId=owned.data.id;
 });
 afterAll(async()=>{
  if(inviteId&&inviteVersion){
   await a.from('caregiver_invitations').update({status:'revoked',version:inviteVersion+1})
    .eq('id',inviteId).eq('version',inviteVersion).neq('status','revoked');
  }
  await Promise.all([a.auth.signOut(),b.auth.signOut()]);
 });
 it('only the owner can request a verified-email child invitation',async()=>{
  const created=await a.from('caregiver_invitations').insert({
   owner_id:ownerId,child_id:childId,invited_email:recipient,
   guardian_authority_attested:true
  }).select('id,version,status').single();
  expect(created.error).toBeNull();
  inviteId=created.data?.id??'';inviteVersion=created.data?.version??0;
  expect(created.data?.status).toBe('pending');
  const visible=await b.from('caregiver_invitations').select('id,status').eq('id',inviteId).single();
  expect(visible.error).toBeNull();expect(visible.data?.status).toBe('pending');
  const prior=await b.rpc('get_shared_child_summary',{p_child_id:childId});
  expect(prior.error).not.toBeNull();
 });
 it('allows recipient acceptance without widening base clinical RLS',async()=>{
  const res=await b.from('caregiver_invitations').update({status:'accepted',version:inviteVersion+1})
   .eq('id',inviteId).eq('version',inviteVersion).select('id,version,status').single();
  expect(res.error).toBeNull();inviteVersion=res.data?.version??inviteVersion+1;
  const data=await b.rpc('get_shared_child_summary',{p_child_id:childId});
  expect(data.error).toBeNull();expect(data.data?.child?.id).toBe(childId);
  const direct=await b.from('family_children').select('id').eq('id',childId);
  expect(direct.error).toBeNull();expect(direct.data).toEqual([]);
  const wrong=await b.from('family_growth_entries').insert({
   owner_id:ownerId,child_id:childId,measured_on:new Date().toISOString().slice(0,10),weight_kg:2.5,version:1
  });
  expect(wrong.error).not.toBeNull();
 });
 it('revokes access immediately at summary-RPC boundary',async()=>{
  const result=await a.from('caregiver_invitations').update({status:'revoked',version:inviteVersion+1})
   .eq('id',inviteId).eq('version',inviteVersion).select('version').single();
  expect(result.error).toBeNull();inviteVersion=result.data?.version??inviteVersion+1;
  const denied=await b.rpc('get_shared_child_summary',{p_child_id:childId});
  expect(denied.error).not.toBeNull();
 });
});
