import {useEffect,useState} from 'react';
import type {FamilyChild} from '../lib/family';
import type {Journey} from '../lib/domain';
import {readable} from '../lib/domain';
import {supabase} from '../lib/supabase';
import {findLegacyAssignment,legacyEntries} from '../lib/legacyAttribution';
import type {LegacyAssignment,LegacyKind} from '../lib/legacyAttribution';
interface Props {journey:Journey;child:FamilyChild|null;userId:string|null;isDemo:boolean}
/** Linking never duplicates or modifies the underlying clinical observation. */
export default function LegacyAttributionV10({journey,child,userId,isDemo}:Props){
 const [links,setLinks]=useState<LegacyAssignment[]>([]);
 const [busy,setBusy]=useState(false),[ready,setReady]=useState(isDemo),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [reload,setReload]=useState(0);
 const records=legacyEntries(journey);
 useEffect(()=>{
  let active=true;setLinks([]);setError('');setReady(isDemo);
  if(isDemo)return;
  if(!supabase||!userId){setError('Sign in to load private historical attributions.');return;}
  const client=supabase;
  void (async()=>{
   const {data,error:loadError}=await client.from('family_legacy_links')
    .select('journey_id,owner_id,kind,source_id,child_id,confirmed_by,confirmed_at,version')
    .eq('journey_id',journey.id).limit(500);
   if(!active)return;
   if(loadError){setError('Historical attribution records are not available. The v1.0 reconciliation migration must be verified.');return;}
   setLinks((data??[]) as LegacyAssignment[]);setReady(true);
  })();
  return ()=>{active=false;};
 },[journey.id,userId,isDemo,reload]);
 async function attribute(kind:LegacyKind,sourceId:string){
  if(!child||!ready||busy)return;
  const existing=findLegacyAssignment(links,kind,sourceId);
  if(existing?.child_id===child.id){setNotice('Already assigned to the selected child.');return;}
  if(!window.confirm('Confirm from the child health handbook that this historical entry belongs to '+child.display_name+'. It is caregiver-attested, not clinician-verified.'))return;
  setError('');setNotice('');
  const attrs={journey_id:journey.id,owner_id:userId??'demo',kind,source_id:sourceId,child_id:child.id,confirmed_by:userId??'demo'};
  if(isDemo){
   const assigned:LegacyAssignment={...attrs,confirmed_at:new Date().toISOString(),version:(existing?.version??0)+1};
   setLinks(old=>[...old.filter(v=>!(v.kind===kind&&v.source_id===sourceId)),assigned]);setNotice('Demo attribution only.');return;
  }
  if(!supabase||!userId)return;
  setBusy(true);
  try{
   const q=supabase.from('family_legacy_links');
   const {data,error:writeError}=existing
    ?await q.update({...attrs,version:existing.version+1})
      .eq('journey_id',journey.id).eq('kind',kind).eq('source_id',sourceId)
      .eq('version',existing.version).select('journey_id,owner_id,kind,source_id,child_id,confirmed_by,confirmed_at,version').maybeSingle()
    :await q.insert({...attrs,version:1}).select('journey_id,owner_id,kind,source_id,child_id,confirmed_by,confirmed_at,version').maybeSingle();
   if(writeError||!data)throw new Error('Could not confirm assignment.');
   setLinks(old=>[...old.filter(v=>!(v.kind===kind&&v.source_id===sourceId)),data as LegacyAssignment]);
   setNotice('Assignment recorded. The original clinical entry was not copied or changed.');
  }catch{setError('Assignment failed or became outdated. Refresh and review the source record.');}
  finally{setBusy(false);}
 }
 if(!records.length)return null;
 return <section className="legacy10 panel" aria-label="Historical child record reconciliation">
  <div className="legacy10-head"><div><small>RECORD INTEGRITY</small><h3>Reconcile historical child records</h3></div>
   <button type="button" onClick={()=>setReload(x=>x+1)} disabled={busy} aria-label="Refresh historical attributions">Refresh</button></div>
  <p>Earlier baby measurements and vaccinations were recorded under the pregnancy, not under a specific child.
   Select the correct child above and check the child health handbook before confirming an assignment.
   No observation is duplicated, and caregiver confirmation does not make it a certified clinical record.</p>
  {!child&&<p>Please choose the child to whom these entries belong.</p>}
  {error&&<p role="alert" className="legacy10-error">{error}</p>}
  {notice&&<p role="status" className="legacy10-success">{notice}</p>}
  <div className="legacy10-list">{records.map(item=>{
   const link=findLegacyAssignment(links,item.kind,item.sourceId);
   return <article key={item.kind+':'+item.sourceId} className="legacy10-row">
    <div><strong>{item.kind==='growth'?'Growth measurement':'Recorded immunization'} · {item.label}</strong>
     <small>{readable(item.date)}</small>
     <span>{link?'Assigned child: '+(link.child_id===child?.id?child.display_name:'Another child in this pregnancy'):'Needs child attribution'}</span>
    </div>
    <button type="button" disabled={!child||!ready||busy} onClick={()=>{void attribute(item.kind,item.sourceId)}}>
     {link?.child_id===child?.id?'Confirmed':'Assign to selected child'}
    </button>
   </article>;
  })}</div>
 </section>;
}
