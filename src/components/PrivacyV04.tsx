import { useState } from 'react';
import type { FormEvent } from 'react';
import { Archive, CheckCircle2, Download, FileLock2, Info, LockKeyhole, ShieldCheck, Trash2, X } from 'lucide-react';
import type { Journey } from '../lib/domain';
import { readable } from '../lib/domain';
import type { PrivacyChoices } from '../lib/privacy';

interface Props {
 journeys:Journey[];
 selectedId:string;
 choices:PrivacyChoices;
 isDemo:boolean;
 onChange:(next:PrivacyChoices)=>Promise<void>|void;
 onExport:()=>Promise<void>;
 onDelete:(id:string)=>Promise<boolean>;
}
export default function PrivacyV04({journeys,selectedId,choices,isDemo,onChange,onExport,onDelete}:Props){
 const [deleteId,setDeleteId]=useState<string|null>(null);
 const [confirmation,setConfirmation]=useState('');
 const [working,setWorking]=useState(false);
 const [message,setMessage]=useState('');
 const target=journeys.find(j=>j.id===deleteId);
 async function setPreference(key:keyof PrivacyChoices,checked:boolean){
  setMessage('');setWorking(true);
  try{await onChange({...choices,[key]:checked});setMessage('Your preference was saved.');}
  catch(e){setMessage('Could not save your preference: '+String(e));}
  finally{setWorking(false);}
 }
 async function exportData(){
  setMessage('');setWorking(true);
  try{await onExport();setMessage('Export prepared on your device. Keep the file private.');}
  catch(e){setMessage('Export unsuccessful: '+String(e));}
  finally{setWorking(false);}
 }
 async function confirmDelete(e:FormEvent){
  e.preventDefault();if(!target||confirmation!=='DELETE')return;
  setWorking(true);setMessage('');
  try{
   const success=await onDelete(target.id);
   if(!success)throw new Error('The record was not deleted. Refresh and try again.');
   setDeleteId(null);setConfirmation('');setMessage('The selected journey was deleted from its active database records.');
  }catch(err){setMessage('Deletion failed: '+String(err));}
  finally{setWorking(false);}
 }
 return <div className="page-content v4-page">
  <div className="section-heading"><div><div className="eyebrow">YOUR DATA • YOUR CHOICES</div><h2>Privacy & records</h2><p>Understand what MamaMwana stores, choose optional features and manage your information.</p></div></div>
  <div className="v4-privacy-hero"><span><ShieldCheck size={30}/></span><div><h3>Health data deserves extra care</h3><p>Pregnancy and child health entries can be sensitive personal information. Signed-in records are associated with your authenticated account and protected with database row-level access policies. Review the app’s privacy notices before entering real records.</p></div></div>
  <section className="panel v4-privacy-section"><div className="panel-heading"><div><div className="eyebrow">OPTIONAL EXPERIENCE SETTINGS</div><h3>Feature preferences</h3></div><LockKeyhole size={20}/></div>
   <p className="muted">Essential account storage is required for signed-in journeys. These controls affect only the specified optional features, not medical records, research consent or any third-party data sharing.</p>
   <label className="v4-switch-line"><span><strong>Show in-app appointment reminders</strong><small>Display upcoming and overdue antenatal visits while using MamaMwana. No email or push alerts are sent.</small></span><input type="checkbox" disabled={working} checked={choices.in_app_reminders} onChange={e=>{void setPreference('in_app_reminders',e.target.checked)}}/></label>
   <label className="v4-switch-line"><span><strong>Use journey stage for local guidance</strong><small>Allow the educational guide to adapt general wording to pregnancy, postpartum or early childhood. Your question is never sent to an external AI provider.</small></span><input type="checkbox" disabled={working} checked={choices.guidance_context} onChange={e=>{void setPreference('guidance_context',e.target.checked)}}/></label>
   {isDemo&&<p className="v4-inline-info"><Info size={16}/> Demo preferences are not saved after leaving the page.</p>}
  </section>
  <section className="panel v4-privacy-section"><div className="panel-heading"><div><div className="eyebrow">PERSONAL DATA PORTABILITY</div><h3>Download your records</h3></div><Download size={20}/></div>
   <p className="muted">Export all of your MamaMwana journeys and care diaries as a human-readable JSON file. This file may contain names, due dates, birth dates, notes, vaccinations and wellbeing information. It is not encrypted by the app.</p>
   <button className="v4-main-button" onClick={()=>{void exportData()}} disabled={working}><FileLock2 size={17}/> Export all my journeys <Download size={15}/></button>
   <p className="footnote"><Archive size={14}/> Store the downloaded file in a safe location. Export does not remove the server copy. It includes your current records rather than the full Supabase audit or backup history.</p>
  </section>
  <section className="panel v4-privacy-section"><div className="panel-heading"><div><div className="eyebrow">CONTROL YOUR JOURNEYS</div><h3>Delete a pregnancy / child journey</h3></div><Trash2 size={19}/></div>
   <p className="muted">Deletes an individual MamaMwana journey and its associated current clinical record projections. This action cannot be undone from inside the app. Backups may be subject to a separate retention policy.</p>
   <div className="v4-delete-list">{journeys.map(j=><div className="v4-delete-row" key={j.id}><span><strong>{j.baby_name??'Pregnancy journey'}</strong><small>{j.baby_birth_date?'Birth '+readable(j.baby_birth_date):'Estimated due '+readable(j.due_date)}{j.id===selectedId?' · Current journey':''}</small></span><button disabled={working} onClick={()=>{setDeleteId(j.id);setConfirmation('')}}><Trash2 size={15}/> Delete</button></div>)}</div>
   <p className="v4-inline-info"><Info size={16}/> Deleting your entire login account is not yet supported in the frontend. Account erasure requires a verified server-side process and an applicable retention policy; do not place an admin API key in the browser.</p>
  </section>
  <section className="panel v4-privacy-section">
   <div className="eyebrow">DATA GOVERNANCE</div><h3>What this milestone does and does not do</h3>
   <div className="v4-governance-grid"><div><CheckCircle2 size={19}/><strong>Account-scoped records</strong><p>Authenticated database tables use restricted row access. New normalized clinical read models have select-only owner access.</p></div><div><CheckCircle2 size={19}/><strong>Source-linked guide</strong><p>Medical questions are not transmitted to a generative AI model. No conversation history is stored.</p></div><div><Info size={19}/><strong>Work still required</strong><p>Legal notice, data controller registration analysis, retention schedules, account deletion, clinician approvals and production security testing must be completed before real-patient rollout.</p></div></div>
   <a className="v4-public-link" href="https://www.odpc.go.ke/rights-of-a-data-subject/" target="_blank" rel="noopener noreferrer">Kenya ODPC — rights of a data subject</a>
  </section>
  {message&&<p className="v4-inline-info" role="status">{message}</p>}
  {target&&<div className="v4-delete-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setDeleteId(null)}}><div className="v4-delete-modal" role="dialog" aria-modal="true" aria-labelledby="v4-delete-heading">
   <button className="v4-close" onClick={()=>setDeleteId(null)} aria-label="Close"><X size={19}/></button><span className="v4-danger-icon"><Trash2 size={24}/></span>
   <h3 id="v4-delete-heading">Delete this journey?</h3><p>You are about to delete <strong>{target.baby_name??'this pregnancy journey'}</strong> and its diary records. Other journeys will not be deleted. The action is not reversible here.</p>
   <form onSubmit={e=>{void confirmDelete(e)}}><label>Type DELETE to confirm<input autoComplete="off" value={confirmation} onChange={e=>setConfirmation(e.target.value)} placeholder="DELETE"/></label>
    <div className="v4-delete-actions"><button disabled={working||confirmation!=='DELETE'} type="submit">Delete journey permanently</button><button type="button" onClick={()=>setDeleteId(null)}>Cancel</button></div>
   </form><p className="footnote">This deletes active application records, not copies already exported or existing database backups.</p>
  </div></div>}
 </div>;
}
