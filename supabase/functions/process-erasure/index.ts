// MamaMwana v0.6 • privileged, separately reviewed erasure executor.
// Deployment gate: keep ERASURE_EXECUTION_ENABLED unset until legal and security
// officers have approved the documented workflow on an isolated test project.
// This function MUST NOT be called from ordinary user-facing browser screens.
import {serve} from 'https://deno.land/std@0.224.0/http/server.ts';
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const json=(status:number,body:Record<string,unknown>)=>new Response(JSON.stringify(body),{
 status,headers:{'content-type':'application/json','cache-control':'no-store'}
});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const env=(key:string)=>Deno.env.get(key)?.trim()??'';
const fingerprint=async(value:string)=>{
 const data=new TextEncoder().encode(env('ERASURE_RECEIPT_SALT')+':'+value);
 const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',data));
 return [...digest].map(b=>b.toString(16).padStart(2,'0')).join('');
};
serve(async request=>{
 if(request.method!=='POST')return json(405,{error:'Method not allowed'});
 if(env('ERASURE_EXECUTION_ENABLED')!=='true')return json(503,{error:'Erasure workflow is not activated'});
 const url=env('SUPABASE_URL'),serviceKey=env('SUPABASE_SERVICE_ROLE_KEY');
 const publicKey=env('SUPABASE_ANON_KEY'),salt=env('ERASURE_RECEIPT_SALT');
 if(!url||!serviceKey||!publicKey||salt.length<32)return json(503,{error:'Erasure service configuration incomplete'});
 const bearer=request.headers.get('authorization')??'';
 if(!bearer.startsWith('Bearer ')||bearer.length>3000)return json(401,{error:'Authenticated operator required'});
 const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const verifier=createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:authError}=await verifier.auth.getUser(bearer.slice(7));
 if(authError||!user||user.is_anonymous)return json(401,{error:'Invalid operator session'});
 const {data:operator,error:operatorError}=await admin.from('privacy_operators')
  .select('user_id,is_active').eq('user_id',user.id).maybeSingle();
 if(operatorError||!operator?.is_active)return json(403,{error:'Operator authorization required'});
 let input:{request_id?:unknown;confirm?:unknown};
 try{input=await request.json();}catch{return json(400,{error:'Invalid request body'});}
 if(typeof input.request_id!=='string'||!uuid.test(input.request_id)
  ||input.confirm!=='ERASE_APPROVED_ACCOUNT')return json(400,{error:'Explicit approved request confirmation required'});
 const {data:pending,error:pendingError}=await admin.from('data_rights_requests')
  .select('id,owner_id,request_type,status').eq('id',input.request_id).maybeSingle();
 if(pendingError||!pending||pending.request_type!=='erasure'||pending.status!=='in_review'){
  return json(409,{error:'No independently approved erasure request awaiting execution'});
 }
 if(pending.owner_id===user.id)return json(403,{error:'An operator cannot execute their own erasure'});
 const {data:approval,error:approvalError}=await admin.from('erasure_authorizations')
  .select('approved_by_first,approved_by_second,legal_hold_checked,backup_retention_reviewed')
  .eq('request_id',pending.id).maybeSingle();
 if(approvalError||!approval||approval.approved_by_first===approval.approved_by_second
  ||!approval.legal_hold_checked||!approval.backup_retention_reviewed){
  return json(403,{error:'Independent authorizations and retention review required'});
 }
 const approverIds=[approval.approved_by_first,approval.approved_by_second];
 const {data:approvers,error:approverError}=await admin.from('privacy_operators')
  .select('user_id,is_active').in('user_id',approverIds);
 if(approverError||approvers?.filter(a=>a.is_active).length!==2)
  return json(403,{error:'Both approvers must remain authorized'});
 // Compare-and-set moves only ONE worker into processing state. Parallel
 // requests and replays cannot authorize duplicate deletion.
 const {data:claimed,error:claimError}=await admin.from('data_rights_requests')
  .update({status:'processing'}).eq('id',pending.id).eq('status','in_review')
  .select('id').maybeSingle();
 if(claimError||!claimed)return json(409,{error:'Request was already processed or changed'});
 const requestHash=await fingerprint(pending.id),subjectHash=await fingerprint(pending.owner_id);
 const {error:receiptError}=await admin.from('erasure_receipts').upsert({
  request_fingerprint:requestHash,subject_fingerprint:subjectHash,status:'processing',
  started_at:new Date().toISOString(),completed_at:null
 },{onConflict:'request_fingerprint'});
 if(receiptError){
  await admin.from('data_rights_requests').update({status:'in_review'}).eq('id',pending.id).eq('status','processing');
  return json(503,{error:'Processing receipt could not be created'});
 }
 // Auth deletion cascades user-owned public tables; schema references must use
 // ON DELETE CASCADE/SET NULL. Does not erase external files or retained backups.
 const {error:deleteError}=await admin.auth.admin.deleteUser(pending.owner_id,false);
 if(deleteError){
  await admin.from('erasure_receipts').update({status:'failed'}).eq('request_fingerprint',requestHash);
  await admin.from('data_rights_requests').update({status:'in_review'}).eq('id',pending.id).eq('status','processing');
  return json(503,{error:'Account erasure could not be completed; authorized staff review required'});
 }
 const {error:completedError}=await admin.from('erasure_receipts').update({
  status:'completed',completed_at:new Date().toISOString()
 }).eq('request_fingerprint',requestHash);
 if(completedError)return json(503,{error:'Auth account removed; receipt finalization needs operator follow-up'});
 return json(200,{status:'completed',message:'Account deletion completed. External exports and retained backups remain governed by retention policy.'});
});
