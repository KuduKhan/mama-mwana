import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {createClient} from '@supabase/supabase-js';

/** Disposable local Supabase only. Never point this suite at a hosted clinical project. */
const keys=['MAMA_TEST_SUPABASE_URL','MAMA_TEST_SUPABASE_ANON_KEY',
 'MAMA_TEST_USER_A_EMAIL','MAMA_TEST_USER_A_PASSWORD',
 'MAMA_TEST_USER_B_EMAIL','MAMA_TEST_USER_B_PASSWORD'];
const enabled=process.env.MAMA_TEST_CONFIRM_DISPOSABLE==='true'&&keys.every(k=>Boolean(process.env[k]));
const env=(k:string)=>process.env[k]||'';
describe.skipIf(!enabled)('Personal tracker owner-only database access',()=>{
 const url=env('MAMA_TEST_SUPABASE_URL')||'https://disabled.invalid';
 const key=env('MAMA_TEST_SUPABASE_ANON_KEY')||'disabled';
 const opts={auth:{persistSession:false,autoRefreshToken:false}};
 const a=createClient(url,key,opts),b=createClient(url,key,opts);
 let ownerA='',ownerB='',entryId='';
 const title='Synthetic local reminder';
 beforeAll(async()=>{
  const [la,lb]=await Promise.all([
   a.auth.signInWithPassword({email:env('MAMA_TEST_USER_A_EMAIL'),password:env('MAMA_TEST_USER_A_PASSWORD')}),
   b.auth.signInWithPassword({email:env('MAMA_TEST_USER_B_EMAIL'),password:env('MAMA_TEST_USER_B_PASSWORD')})
  ]);
  if(la.error||lb.error||!la.data.user||!lb.data.user)throw new Error('Both disposable accounts must sign in');
  ownerA=la.data.user.id;ownerB=lb.data.user.id;
  const {data,error}=await a.from('personal_tracker_entries')
   .insert({owner_id:ownerA,kind:'reminder',title,note:'Synthetic test data only',event_date:'2026-11-20'})
   .select('id').single();
  if(error||!data)throw new Error('Local tracker migration or owner-scoped insertion is missing');
  entryId=data.id;
 });
 afterAll(async()=>{
  if(entryId)await a.from('personal_tracker_entries').delete().eq('id',entryId).eq('owner_id',ownerA);
  await Promise.all([a.auth.signOut(),b.auth.signOut()]);
 });
 it('allows a real owner to read their own fixture only',async()=>{
  const response=await a.from('personal_tracker_entries').select('id,owner_id,title').eq('id',entryId);
  expect(response.error).toBeNull();
  expect(response.data).toEqual([{id:entryId,owner_id:ownerA,title}]);
 });
 it('denies a different signed-in user access, mutation and deletion',async()=>{
  const read=await b.from('personal_tracker_entries').select('id,title').eq('id',entryId);
  expect(read.error).toBeNull();expect(read.data).toEqual([]);
  const update=await b.from('personal_tracker_entries').update({title:'Unauthorized mutation'}).eq('id',entryId).select('id');
  expect(update.error).toBeNull();expect(update.data).toEqual([]);
  const remove=await b.from('personal_tracker_entries').delete().eq('id',entryId).select('id');
  expect(remove.error).toBeNull();expect(remove.data).toEqual([]);
  const owner=await a.from('personal_tracker_entries').select('title').eq('id',entryId).single();
  expect(owner.error).toBeNull();expect(owner.data?.title).toBe(title);
 });
 it('rejects owner impersonation and malformed records',async()=>{
  const forged=await b.from('personal_tracker_entries').insert({owner_id:ownerA,kind:'journal',title:'Forged'});
  expect(forged.error).not.toBeNull();
  const emptyTitle=await a.from('personal_tracker_entries').insert({owner_id:ownerA,kind:'journal',title:' '});
  // The original SQL requires 1–160 characters; a one-space title is allowed at
  // the DB layer, so the frontend also enforces trimmed title validation.
  expect(emptyTitle.error).toBeNull();
  const invalid=await a.from('personal_tracker_entries').insert({owner_id:ownerA,kind:'clinical-diagnosis',title:'Invalid category'});
  expect(invalid.error).not.toBeNull();
  await a.from('personal_tracker_entries').delete().eq('owner_id',ownerA).eq('title',' ');
 });
 it('enforces stale-update detection with owner-scoped compare-and-set',async()=>{
  const initial=await a.from('personal_tracker_entries').select('updated_at').eq('id',entryId).single();
  expect(initial.error).toBeNull();
  const version=initial.data!.updated_at as string;
  const next='2026-11-19T12:00:00.000Z';
  const first=await a.from('personal_tracker_entries')
   .update({title:'Synthetic updated record',updated_at:next})
   .eq('id',entryId).eq('owner_id',ownerA).eq('updated_at',version).select('id');
  expect(first.error).toBeNull();expect(first.data).toHaveLength(1);
  const stale=await a.from('personal_tracker_entries')
   .update({title:'Stale overwrite',updated_at:new Date().toISOString()})
   .eq('id',entryId).eq('owner_id',ownerA).eq('updated_at',version).select('id');
  expect(stale.error).toBeNull();expect(stale.data).toEqual([]);
  const check=await a.from('personal_tracker_entries').select('title').eq('id',entryId).single();
  expect(check.data?.title).toBe('Synthetic updated record');
 });
 it('denies anonymous records and maintains user B own-row isolation',async()=>{
  const guest=createClient(url,key,opts);
  const anonymous=await guest.from('personal_tracker_entries').select('id').eq('id',entryId);
  expect(anonymous.error||anonymous.data?.length===0).toBeTruthy();
  const bInsert=await b.from('personal_tracker_entries')
   .insert({owner_id:ownerB,kind:'journal',title:'Synthetic B journal'}).select('id').single();
  expect(bInsert.error).toBeNull();
  const ownId=bInsert.data!.id;
  try{
   const aRead=await a.from('personal_tracker_entries').select('id').eq('id',ownId);
   expect(aRead.error).toBeNull();expect(aRead.data).toEqual([]);
  }finally{await b.from('personal_tracker_entries').delete().eq('id',ownId).eq('owner_id',ownerB);}
  await guest.auth.signOut();
 });
});
