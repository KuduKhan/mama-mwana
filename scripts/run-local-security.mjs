/**
 * Local MamaMwana Auth + RLS runner. Requires local Supabase already started.
 * No hosted database will be contacted; synthetic fixtures cleaned up in finally.
 */
import {execFileSync,spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {assertLocalSupabaseEndpoint} from './local-db-boundary.mjs';

const npx=process.platform==='win32'?'npx.cmd':'npx';
function localConfig(){
 let output;
 try {
  output=execFileSync(npx,['supabase','--workdir','.mamamwana-local','status','-o','env'],{
   encoding:'utf8',shell:process.platform==='win32',
   stdio:['ignore','pipe','pipe'],timeout:30000
  });
 } catch{
  throw new Error('Local Supabase unavailable. Run npm run test:local:prepare; then initialize and start Supabase in the .mamamwana-local workdir.');
 }
 const variables=Object.fromEntries(output.split(/\r?\n/).map(line=>{
  const match=/^\s*([A-Z][A-Z0-9_]*)=(.*)\s*$/.exec(line);
  return match?[match[1],match[2].trim().replace(/^["']|["']$/g,'')]:[];
 }).filter(parts=>parts.length===2));
 const apiUrl=variables.API_URL||variables.SUPABASE_URL;
 const publicKey=variables.ANON_KEY||variables.PUBLISHABLE_KEY;
 const secretKey=variables.SERVICE_ROLE_KEY||variables.SECRET_KEY;
 if(!apiUrl||!publicKey||!secretKey)throw new Error('Local API URL, public key or administrative key missing from CLI status.');
 assertLocalSupabaseEndpoint(apiUrl);
 return {apiUrl,publicKey,secretKey};
}
function isoPlusDays(days){
 const d=new Date();d.setUTCDate(d.getUTCDate()+days);
 return d.toISOString().slice(0,10);
}
async function main(){
 const {apiUrl,publicKey,secretKey}=localConfig();
 const service=createClient(apiUrl,secretKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const created=[];
 const stamp=randomBytes(6).toString('hex');
 const emailA='mamamwana-local-owner-'+stamp+'@example.invalid';
 const emailB='mamamwana-local-guest-'+stamp+'@example.invalid';
 const pwA=randomBytes(24).toString('base64url')+'Z7!';
 const pwB=randomBytes(24).toString('base64url')+'Z7!';
 let results=1;
 try{
  for(const [email,password] of [[emailA,pwA],[emailB,pwB]]){
   const {data,error}=await service.auth.admin.createUser({email,password,email_confirm:true});
   if(error||!data.user)throw new Error('Unable to create verified local-only fixture accounts.');
   created.push(data.user.id);
  }
  const {data:journey,error:journeyError}=await service.from('journeys')
   .insert({
    owner_id:created[0],mother_name:'Synthetic QA Parent',
    due_date:isoPlusDays(14),baby_birth_date:isoPlusDays(-3),
    baby_name:'Synthetic QA Child',baby_sex:'unknown'
   }).select('id').single();
  if(journeyError||!journey)throw new Error('Local clinical fixture journey not created; verify all migrations.');
  const {data:children,error:childrenError}=await service.from('family_children')
   .select('id').eq('journey_id',journey.id);
  if(childrenError||children?.length!==1)throw new Error('Local primary-child seeding did not create exactly one child.');
  for(const table of ['family_legacy_links','caregiver_invitations']){
   const {error}=await service.from(table).select('*',{count:'exact',head:true});
   if(error)throw new Error('Local migration missing: '+table+'. Restart/reset only your LOCAL Supabase stack.');
  }
  console.log('Local fixture ready; running real authenticated two-user API isolation tests.');
  const check=spawnSync(process.execPath,[
   'node_modules/vitest/vitest.mjs','run',
   'tests/clinical.integration.test.ts',
   'tests/carePlanner.integration.test.ts',
   'tests/family.integration.test.ts',
   'tests/caregiver.integration.test.ts'
  ],{
   stdio:'inherit',shell:false,timeout:240000,
   env:{
    ...process.env,MAMA_TEST_CONFIRM_DISPOSABLE:'true',
    MAMA_TEST_SUPABASE_URL:apiUrl,MAMA_TEST_SUPABASE_ANON_KEY:publicKey,
    MAMA_TEST_USER_A_EMAIL:emailA,MAMA_TEST_USER_A_PASSWORD:pwA,
    MAMA_TEST_USER_B_EMAIL:emailB,MAMA_TEST_USER_B_PASSWORD:pwB,
    MAMA_TEST_A_JOURNEY_ID:journey.id
   }
  });
  results=check.status??1;
  if(check.error)throw check.error;
  if(results!==0)throw new Error('Local integration tests failed; inspect test output.');
  console.log('Authenticated local two-user security suite passed.');
 }finally{
  let cleanupFailed=false;
  for(const userId of created.reverse()){
   const {error}=await service.auth.admin.deleteUser(userId);
   if(error)cleanupFailed=true;
  }
  if(cleanupFailed)console.error('Local cleanup incomplete: reset only the LOCAL Supabase instance before reuse.');
  else console.log('Local fixture accounts removed; dependent records cascade-deleted.');
 }
 if(results!==0)process.exitCode=results;
}
main().catch(error=>{
 console.error(error instanceof Error?error.message:'Local security checks failed.');
 process.exitCode=1;
});
