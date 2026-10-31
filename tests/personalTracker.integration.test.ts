import {beforeAll,afterAll,describe,it,expect} from 'vitest';
import {createClient} from '@supabase/supabase-js';
const keys=['MAMA_TEST_SUPABASE_URL','MAMA_TEST_SUPABASE_ANON_KEY',
 'MAMA_TEST_USER_A_EMAIL','MAMA_TEST_USER_A_PASSWORD',
 'MAMA_TEST_USER_B_EMAIL','MAMA_TEST_USER_B_PASSWORD'];
const enabled=process.env.MAMA_TEST_CONFIRM_DISPOSABLE==='true'&&keys.every(k=>Boolean(process.env[k]));
const env=(key:string)=>process.env[key]??'';
describe.skipIf(!enabled)('personal tracker: real signed-in two-account RLS on disposable local GoTrue',()=>{
 const url=env('MAMA_TEST_SUPABASE_URL')||'https://disabled.invalid';
 const key=env('MAMA_TEST_SUPABASE_ANON_KEY')||'no-key';
 const a=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const b=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const visitor=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 let aId='',bId='',aItem='',bItem='';
 beforeAll(async()=>{
  const [r1,r2]=await Promise.all([
   a.auth.signInWithPassword({email:env('MAMA_TEST_USER_A_EMAIL'),password:env('MAMA_TEST_USER_A_PASSWORD')}),
   b.auth.signInWithPassword({email:env('MAMA_TEST_USER_B_EMAIL'),password:env('MAMA_TEST_USER_B_PASSWORD')})
  ]);
  if(r1.error||r2.error||!r1.data.user?.email_confirmed_at||!r2.data.user?.email_confirmed_at)throw Error('Two confirmed synthetic accounts are mandatory');
  aId=r1.data.user.id;bId=r2.data.user.id;
  if(aId===bId)throw Error('Synthetic account fixtures overlap');
 });
 afterAll(async()=>{
  if(aItem)await a.from('personal_tracker_items').delete().eq('id',aItem);
  if(bItem)await b.from('personal_tracker_items').delete().eq('id',bItem);
  await Promise.all([a.auth.signOut(),b.auth.signOut()]);
 });
 it('anonymous account has no table-level read or insert permission',async()=>{
  const read=await visitor.from('personal_tracker_items').select('id').limit(1);
  expect(read.error).not.toBeNull();
  const insert=await visitor.from('personal_tracker_items').insert({
   owner_id:aId,kind:'journal',subject:'family',title:'Unauthorized test',
   recorded_on:'2026-10-31',source_kind:'self'
  });
  expect(insert.error).not.toBeNull();
 });
 it('account A and B can each create their own private entries',async()=>{
  const createdA=await a.from('personal_tracker_items').insert({
   kind:'progress',subject:'baby',title:'Synthetic measurement',recorded_on:'2026-10-31',
   value_number:6.2,value_unit:'kg',source_kind:'provider_supplied'
  }).select('id,owner_id,value_number').single();
  expect(createdA.error).toBeNull();expect(createdA.data?.owner_id).toBe(aId);
  aItem=createdA.data?.id??'';expect(aItem).not.toBe('');
  const createdB=await b.from('personal_tracker_items').insert({
   kind:'reminder',subject:'family',title:'Synthetic date reminder',
   recorded_on:'2026-10-31',remind_on:'2026-11-04',source_kind:'self'
  }).select('id,owner_id').single();
  expect(createdB.error).toBeNull();expect(createdB.data?.owner_id).toBe(bId);
  bItem=createdB.data?.id??'';expect(bItem).not.toBe('');
 });
 it('cross-account reads return no rows, not leaked records',async()=>{
  const [fromB,fromA]=await Promise.all([
   b.from('personal_tracker_items').select('id,title,details').eq('id',aItem),
   a.from('personal_tracker_items').select('id,title,details').eq('id',bItem)
  ]);
  expect(fromB.error).toBeNull();expect(fromB.data).toEqual([]);
  expect(fromA.error).toBeNull();expect(fromA.data).toEqual([]);
 });
 it('rejects creating records with someone else as owner',async()=>{
  const forged=await b.from('personal_tracker_items').insert({
   owner_id:aId,kind:'journal',subject:'mother',title:'Forged ownership',recorded_on:'2026-10-31'
  });
  expect(forged.error).not.toBeNull();
 });
 it('rejects owner reassignment even by legitimate author',async()=>{
  const move=await a.from('personal_tracker_items').update({owner_id:bId})
   .eq('id',aItem).select('id');
  expect(move.error).not.toBeNull();
  const stillMine=await a.from('personal_tracker_items').select('owner_id').eq('id',aItem).single();
  expect(stillMine.data?.owner_id).toBe(aId);
 });
 it('cross-account update and erasure affect no records',async()=>{
  const [update,remove]=await Promise.all([
   b.from('personal_tracker_items').update({title:'Unauthorized update'}).eq('id',aItem).select('id'),
   b.from('personal_tracker_items').delete().eq('id',aItem).select('id')
  ]);
  expect(update.error).toBeNull();expect(update.data).toEqual([]);
  expect(remove.error).toBeNull();expect(remove.data).toEqual([]);
  const unchanged=await a.from('personal_tracker_items').select('title').eq('id',aItem).single();
  expect(unchanged.error).toBeNull();expect(unchanged.data?.title).toBe('Synthetic measurement');
 });
 it('signed-in owner can edit, complete and erase their own entries',async()=>{
  const changed=await b.from('personal_tracker_items').update({completed:true})
   .eq('id',bItem).select('completed').single();
  expect(changed.error).toBeNull();expect(changed.data?.completed).toBe(true);
  const deleted=await b.from('personal_tracker_items').delete().eq('id',bItem).select('id');
  expect(deleted.error).toBeNull();expect(deleted.data).toHaveLength(1);bItem='';
 });
});
