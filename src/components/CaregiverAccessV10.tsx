import {useEffect,useState} from 'react';
import type {FormEvent} from 'react';
import type {FamilyChild} from '../lib/family';
import {supabase} from '../lib/supabase';
import {useMamaLocale} from '../lib/locale';
type Invite={id:string;owner_id:string;child_id:string;invited_email:string;status:'pending'|'accepted'|'revoked';accepted_by:string|null;expires_at:string;shared_until:string|null;version:number};
type Shared={child:{id:string;display_name:string;born_on:string;sex:string};growth:{measured_on:string;weight_kg:number|null;length_cm:number|null}[];vaccinations:{given_on:string;vaccine_label:string}[];notice:string};
const select='id,owner_id,child_id,invited_email,status,accepted_by,expires_at,shared_until,version';
export function CaregiverOwnerPanel({child,userId,demo}:{child:FamilyChild|null;userId:string|null;demo:boolean}){
 const {t}=useMamaLocale();
 const [email,setEmail]=useState(''),[attest,setAttest]=useState(false),[scopeAcknowledged,setScopeAcknowledged]=useState(false),[invites,setInvites]=useState<Invite[]>([]);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[reload,setReload]=useState(0);
 useEffect(()=>{
  let active=true;setInvites([]);setError('');setEmail('');setAttest(false);setScopeAcknowledged(false);if(demo||!child||!userId)return;
  const client=supabase;if(!client)return;
  void client.from('caregiver_invitations').select(select).eq('owner_id',userId).eq('child_id',child.id)
   .order('expires_at',{ascending:false}).limit(100).then(({data,error})=>{
     if(!active)return;if(error)setError('Private caregiver invitations cannot load. Check the reviewed sharing migration.');else setInvites((data??[]) as Invite[]);
   });
  return()=>{active=false};
 },[child?.id,userId,demo,reload]);
 async function invite(e:FormEvent){
  e.preventDefault();setError('');setMessage('');
  if(!attest||!scopeAcknowledged||!child||!userId){setError('Confirm legal authority and review the limited scope before requesting access.');return;}
  const address=email.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)){setError('Enter a valid caregiver email address.');return;}
  if(demo){setMessage('Demo mode does not send invitations or share records.');return;}
  if(!supabase)return;setBusy(true);
  const {data,error:writeError}=await supabase.from('caregiver_invitations')
   .insert({owner_id:userId,child_id:child.id,invited_email:address,guardian_authority_attested:true})
   .select(select).single();
  setBusy(false);
  if(writeError||!data){setError('Invite not created. Check for a duplicate invitation or a database security issue.');return;}
  setInvites(v=>[data as Invite,...v]);setEmail('');setAttest(false);setScopeAcknowledged(false);
  setMessage('Invitation saved. Ask this caregiver to sign in with a verified account using that email. No message was sent automatically.');
 }
 async function revoke(item:Invite){
  if(!supabase||busy||demo)return;
  if(!window.confirm('Revoke this caregiver invitation or active read-only access?'))return;
  setBusy(true);
  const {data,error:writeError}=await supabase.from('caregiver_invitations')
   .update({status:'revoked',version:item.version+1})
   .eq('id',item.id).eq('version',item.version).eq('owner_id',userId)
   .select(select).maybeSingle();
  setBusy(false);
  if(writeError||!data){setError('Revoke failed or invitation changed. Refresh.');return;}
  setInvites(items=>items.map(x=>x.id===item.id?data as Invite:x));setMessage('Access revoked at the database.');
 }
 if(!child)return null;
 return <section className="sharing10 panel"><div className="sharing10-head"><h3>Caregiver invitations · {child.display_name}</h3><button type="button" onClick={()=>setReload(v=>v+1)}>Refresh</button></div>
  <p>Share only this child's separate profile and recorded growth/vaccination notes, with read-only access. Invitations expire in seven days; accepted access expires after thirty days or when revoked. Sharing does not include the pregnancy journal, private care planner or historical clinical notes.</p>
  <details className="mm14-sharing-scope"><summary>{t('caregiver.scope','Review exactly what is shared')}</summary>
   <ul><li>One child profile: display name and date of birth.</li><li>Recorded growth measurements and vaccination notes entered for that child.</li><li>No pregnancy journal, private care planner, wellbeing entries, unrelated siblings, or write access.</li></ul>
   <p>Read-only invitations expire after seven days; accepted access expires after thirty days or sooner if revoked. No automatic email is sent.</p>
  </details>
  <form className="sharing10-form" onSubmit={e=>{void invite(e)}}>
   <label>Verified caregiver email<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="caregiver@example.com"/></label>
   <label className="sharing10-check"><input type="checkbox" checked={attest} onChange={e=>setAttest(e.target.checked)}/> I confirm that I have parental or legal authority to request sharing of this child's information.</label>
   <label className="mm14-consent"><input type="checkbox" checked={scopeAcknowledged} onChange={e=>setScopeAcknowledged(e.target.checked)}/>{t('caregiver.ownerScope','I reviewed the limited child data being shared and understand I can revoke access.')}</label>
   <button type="submit" disabled={busy||!attest||!scopeAcknowledged}>Invite read-only caregiver</button>
  </form>
  {error&&<p role="alert" className="sharing10-error">{error}</p>}
  {message&&<p role="status">{message}</p>}
  <div className="sharing10-list">{invites.map(i=><article key={i.id}><span><strong>{i.invited_email}</strong><small>{i.status} · {i.status==='accepted'?'Access ends '+(i.shared_until??''):'Invitation ends '+i.expires_at}</small></span>{i.status!=='revoked'&&<button type="button" disabled={busy} onClick={()=>{void revoke(i)}}>Revoke</button>}</article>)}</div>
  {demo&&<small>Demo preview: sharing is not active.</small>}
 </section>;
}
export function CaregiverInbox({userId,demo}:{userId:string|null;demo:boolean}){
 const {t}=useMamaLocale();
 const [invites,setInvites]=useState<Invite[]>([]),[view,setView]=useState<Shared|null>(null),[busy,setBusy]=useState(false);
 const [acceptedScope,setAcceptedScope]=useState(false);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[reload,setReload]=useState(0);
 useEffect(()=>{
  let active=true;setInvites([]);setView(null);setError('');setAcceptedScope(false);if(!userId||demo||!supabase)return;
  void supabase.from('caregiver_invitations').select(select).neq('owner_id',userId)
   .in('status',['pending','accepted']).order('expires_at',{ascending:false}).limit(100)
   .then(({data,error})=>{if(!active)return;if(error)setError('Shared invitations unavailable; sign in with a verified email.');else setInvites((data??[]) as Invite[]);});
  return()=>{active=false};
 },[userId,demo,reload]);
 async function change(i:Invite,next:'accepted'|'revoked'){
  if(!supabase||busy||next==='accepted'&&!acceptedScope)return;
  setView(null);setAcceptedScope(false);setBusy(true);setError('');setMessage('');
  const {data,error}=await supabase.from('caregiver_invitations').update({status:next,version:i.version+1})
   .eq('id',i.id).eq('version',i.version).select(select).maybeSingle();
  setBusy(false);
  if(error||!data){setError('Your verified email or invitation status could not be confirmed. Refresh.');return;}
  setInvites(v=>v.map(x=>x.id===i.id?data as Invite:x).filter(x=>x.status!=='revoked'));setMessage(next==='accepted'?'Read-only invitation accepted.':'Invitation declined or access revoked.');
 }
 async function read(i:Invite){
  if(!supabase)return;setBusy(true);setView(null);setError('');
  const {data,error}=await supabase.rpc('get_shared_child_summary',{p_child_id:i.child_id});setBusy(false);
  if(error||!data){setError('Shared child information is unavailable, expired, or revoked.');return;}
  setView(data as Shared);
 }
 if(!userId||demo)return null;
 return <section className="sharing10 panel" aria-label="Caregiver invitations"><div className="sharing10-head"><h3>Shared with me</h3><button type="button" onClick={()=>setReload(v=>v+1)}>Refresh</button></div>
  <p>Only a caregiver signed in with the invited, verified email can accept. You receive time-limited, read-only access; you cannot edit records or see the owner's private pregnancy notes.</p>
  {error&&<p role="alert" className="sharing10-error">{error}</p>}
  {message&&<p role="status">{message}</p>}
  {invites.some(i=>i.status==='pending')&&<label className="mm14-consent"><input type="checkbox" checked={acceptedScope} onChange={e=>setAcceptedScope(e.target.checked)}/>{t('caregiver.acceptScope','I understand that this is read-only access to one child profile, not the full family health record.')}</label>}
  <div className="sharing10-list">{invites.map(i=><article key={i.id}><span><strong>Child profile shared privately</strong><small>{i.status==='accepted'?'Read-only access until '+(i.shared_until??''):'Invitation expires '+i.expires_at}</small></span><div className="sharing10-actions">
   {i.status==='pending'&&<button type="button" disabled={busy||!acceptedScope} onClick={()=>{void change(i,'accepted')}}>Accept</button>}
   {i.status==='accepted'&&<button type="button" disabled={busy} onClick={()=>{void read(i)}}>View child summary</button>}
   <button type="button" disabled={busy} onClick={()=>{void change(i,'revoked')}}>{i.status==='pending'?'Decline':'Leave'}</button>
  </div></article>)}</div>
  {view&&<div className="sharing10-summary"><h4>{view.child.display_name}</h4><p>Born {view.child.born_on}</p><strong>Measurements</strong><ul>{view.growth.map((r,k)=><li key={k}>{r.measured_on} · {r.weight_kg??'—'} kg · {r.length_cm??'—'} cm</li>)}</ul>
   <strong>Recorded vaccinations</strong><ul>{view.vaccinations.map((r,k)=><li key={k}>{r.vaccine_label} · {r.given_on}</li>)}</ul><small>{view.notice}</small></div>}
 </section>;
}
