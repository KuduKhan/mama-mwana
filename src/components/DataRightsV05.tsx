import {useEffect,useState} from 'react';
import {ClipboardCheck,FileCheck2,Info,ShieldCheck} from 'lucide-react';
import {supabase} from '../lib/supabase';
import {DATA_RIGHTS_LABELS,canRequestRight} from '../lib/governance';
import {APP_DISPLAY_VERSION} from '../lib/release';
import type {DataRightRequest,DataRightType} from '../lib/governance';

interface Props { userId:string|null; isDemo:boolean }
const types:DataRightType[]=['access','correction','erasure'];
const statusLabels:Record<DataRightRequest['status'],string>={
 received:'Received — awaiting review',
 in_review:'Under staff review',
 resolved:'Resolved by authorized staff',
 declined:'Declined — contact support'
};
export default function DataRightsV05({userId,isDemo}:Props){
 const [requests,setRequests]=useState<DataRightRequest[]>([]);
 const [loading,setLoading]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 useEffect(()=>{
  let active=true;setRequests([]);setError('');setMessage('');
  if(isDemo||!userId||!supabase)return;
  const client=supabase;setLoading(true);
  void Promise.resolve(client.from('data_rights_requests').select('id,request_type,status,requested_at,resolved_at')
   .eq('owner_id',userId).order('requested_at',{ascending:false}).limit(40)
   .then(({data,error:readError})=>{
    if(!active)return;
    if(readError)setError('Data-rights requests are unavailable. Ask the administrator to verify the current privacy-governance setup.');
    else setRequests((data??[]) as DataRightRequest[]);
    setLoading(false);
   })).catch(()=>{if(active){setLoading(false);setError('Could not load account requests.');}});
  return ()=>{active=false;};
 },[userId,isDemo]);
 async function request(type:DataRightType){
  if(!userId||!supabase||isDemo||busy||!canRequestRight(type,requests))return;
  if(!window.confirm('Submit '+DATA_RIGHTS_LABELS[type].toLowerCase()+'? This is a request for staff review and does not automatically change your account.'))return;
  setMessage('');setError('');setBusy(true);
  try{
   const {data,error:saveError}=await supabase.from('data_rights_requests')
    .insert({owner_id:userId,request_type:type,status:'received'})
    .select('id,request_type,status,requested_at,resolved_at').single();
   if(saveError)throw saveError;
   if(data)setRequests(p=>[data as DataRightRequest,...p]);
   setMessage('Request received by the application. An authorized operator must review and fulfill it; no account or backup data has been erased.');
  }catch{
   setError('Could not submit this request. Check connectivity, account permissions and whether an open request already exists.');
  }finally{setBusy(false);}
 }
 return <section className="panel v4-privacy-section v5-rights">
  <div className="panel-heading"><div><div className="eyebrow">ACCOUNT DATA RIGHTS • {APP_DISPLAY_VERSION}</div><h3>Requests and review status</h3></div><ShieldCheck size={20}/></div>
  <p className="muted">Submit a formal request to access, correct or erase account-level information. The request is recorded privately for authorized staff review. This does <strong>not</strong> automatically delete your login, journey history, backups, or other retained records.</p>
  {isDemo?<p className="v5-rights-notice"><Info size={16}/> Sign in to submit a real request. Demo mode never sends or stores requests.</p>:!userId?<p className="v5-rights-notice">Sign in to manage your requests.</p>:
  <>
   <div className="v5-rights-options">{types.map(type=><button key={type} disabled={busy||loading||!canRequestRight(type,requests)} onClick={()=>{void request(type)}}><FileCheck2 size={18}/><span>{DATA_RIGHTS_LABELS[type]}</span><small>{!canRequestRight(type,requests)?'An active request already exists':'Submit request'}</small></button>)}</div>
   <div className="v5-rights-history"><h4>Your request history</h4>
    {loading?<p className="v5-rights-notice">Loading status…</p>:requests.length===0?<p className="v5-rights-notice">No account-rights requests on record.</p>:
     requests.map(r=><div key={r.id} className="v5-rights-row"><span><ClipboardCheck size={17}/><strong>{DATA_RIGHTS_LABELS[r.request_type]}</strong></span><span className="v5-rights-meta"><small>{new Date(r.requested_at).toLocaleDateString('en-KE',{year:'numeric',month:'short',day:'numeric'})}</small><small>{statusLabels[r.status]}</small></span></div>)}
   </div>
  </>}
  {message&&<p className="v5-rights-ok" role="status">{message}</p>}
  {error&&<p className="v4-error" role="alert">{error}</p>}
  <p className="footnote"><Info size={14}/> Request status can only be changed by authorized staff outside the public application. Contact your service administrator for identity verification, expected response periods and applicable retention rules.</p>
 </section>;
}
