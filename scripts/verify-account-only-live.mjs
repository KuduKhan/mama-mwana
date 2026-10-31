/** Run only with a privately provisioned, verified synthetic test user.
 * Never commit credentials, email addresses, access tokens or raw patient data.
 * This is an account-only backend safety smoke; not clinical release approval.
 */
import {createClient} from '@supabase/supabase-js';
export function accessDenied(error,status){
 const code=String(error?.code??'');
 return Boolean(error)&&(
  code==='42501'||code==='PGRST301'||code==='PGRST202'||
  status===401||status===403||status===404
 );
}
export async function verifyAccountOnly({url,key,email,password,log=console.log}){
 if(!/^https:\/\/[^/]+\.supabase\.co$/.test(url??'')||!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key??'')||
   !email||!password)throw new Error('Verified synthetic account and publishable Supabase configuration required');
 const api=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 try{
  const response=await api.auth.signInWithPassword({email,password});
  if(response.error||!response.data.user||!response.data.session)throw new Error('Synthetic login not verified');
  if(!response.data.user.email_confirmed_at)throw new Error('Synthetic account email confirmation not verified');
  const claims=await api.auth.getUser();
  if(claims.error||claims.data.user?.id!==response.data.user.id)throw new Error('Active account identity not verified');
  const read=await api.from('journeys').select('id').limit(1);
  if(!accessDenied(read.error,read.status))throw new Error('FAIL_CLOSED: signed-in account obtained unapproved clinical-table access');
  const rpc=await api.rpc('get_shared_child_summary',{p_child_id:'00000000-0000-4000-8000-000000000000'});
  if(!accessDenied(rpc.error,rpc.status))throw new Error('FAIL_CLOSED: signed-in account invoked unapproved clinical-summary RPC');
  const invitation=await api.from('caregiver_invitations').select('id').limit(1);
  if(!accessDenied(invitation.error,invitation.status))throw new Error('FAIL_CLOSED: signed-in account obtained caregiver-invitation access');
  log('PASS: verified synthetic login/session, and all three protected clinical endpoints deny account-only access; no patient data queried.');
  return true;
 }finally{
  await api.auth.signOut({scope:'local'}).catch(()=>{});
 }
}
if(process.argv.includes('--run')){
 const env=process.env;
 verifyAccountOnly({
  url:env.MM_TEST_SUPABASE_URL,key:env.MM_TEST_SUPABASE_PUBLISHABLE_KEY,
  email:env.MM_TEST_VERIFIED_EMAIL,password:env.MM_TEST_VERIFIED_PASSWORD
 }).catch(error=>{console.error('Account-only acceptance failed: '+String(error.message));process.exitCode=1;});
}else if(process.argv[1]?.endsWith('verify-account-only-live.mjs')){
 console.error('NOT RUN: --run and private verified synthetic test-account environment are required.');
 process.exitCode=2;
}
