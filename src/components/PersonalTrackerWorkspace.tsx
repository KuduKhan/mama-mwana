import {useEffect,useMemo,useState} from 'react';
import type {FormEvent} from 'react';
import type {User} from '@supabase/supabase-js';
import {BookHeart,CalendarDays,Check,Download,Heart,LockKeyhole,NotebookPen,Plus,RefreshCw,ShieldCheck,Trash2,TrendingUp} from 'lucide-react';
import {authSupabase} from '../lib/supabase';
import {useMamaLocale} from '../lib/locale';
import {blankTrackerDraft,exportTrackerJson,localToday,normalizeTrackerDraft,orderedTrackerItems,reminderCalendarEvent,reminderDue} from '../lib/personalTracker';
import type {TrackerDraft,TrackerItem,TrackerKind} from '../lib/personalTracker';

const FIELDS='id,owner_id,kind,subject,title,details,recorded_on,value_number,value_unit,remind_on,completed,source_kind,created_at,updated_at';
const copy={
 en:{
  eyebrow:'YOUR PRIVATE FAMILY SPACE',title:'Personal tracker & reminders',
  lead:'Record what matters to you. No diagnosis, automatic growth interpretation or provider messaging.',
  private:'Only your signed-in account may access these entries. Information remains private to this account; no family sharing is enabled.',
  add:'Add an entry',journal:'Journal',progress:'Progress log',reminder:'Reminder',
  mother:'Mother',baby:'Baby',family:'Family',subject:'About',titleLabel:'Title',
  details:'Your notes (optional)',recordDate:'Recorded on',value:'Measurement (optional)',unit:'Unit',date:'Remind me on',
  source:'Where did this information come from?',self:'I recorded it',provider:'Copied from professional information (not verified by the app)',
  save:'Save privately',cancel:'Cancel editing',saved:'Saved privately.',none:'No entries yet. Add a private note, progress record or reminder.',
  all:'All',done:'Complete',reopen:'Reopen',edit:'Edit',delete:'Delete',due:'Due or overdue',calendar:'Add to my calendar',
  export:'Export my entries',deleteAll:'Delete every tracker entry',notice:'Calendar exports show a generic reminder only. They are not automatic notifications, and reminders appear here only while you open the app.',
  warning:'This is a personal organizer, not a medical record or advice. Seek a qualified professional for health decisions.',
  refresh:'Refresh',reset:'Add a new entry',empty:'No matching entries.',busy:'Saving…',clearWarning:'Delete ALL private tracker entries? This cannot be undone.',
 },
 sw:{
  eyebrow:'NAFASI YAKO YA FAMILIA',title:'Kumbukumbu na vikumbusho',
  lead:'Hifadhi kumbukumbu zako. Hakuna utambuzi wa ugonjwa au tafsiri ya vipimo.',
  private:'Ni akaunti yako tu iliyounganishwa inayoweza kuona kumbukumbu hizi. Kushiriki na familia hakujaruhusiwa.',
  add:'Ongeza kumbukumbu',journal:'Shajara',progress:'Maendeleo',reminder:'Kikumbusho',
  mother:'Mama',baby:'Mtoto',family:'Familia',subject:'Kuhusu',titleLabel:'Kichwa',
  details:'Maelezo (si lazima)',recordDate:'Tarehe ya kumbukumbu',value:'Kipimo (si lazima)',unit:'Kizio',date:'Nikumbushe tarehe',
  source:'Taarifa imetoka wapi?',self:'Nimeandika mimi',provider:'Nimenakili kutoka kwa mtaalamu (haijathibitishwa na programu)',
  save:'Hifadhi kwa faragha',cancel:'Ghairi marekebisho',saved:'Imehifadhiwa.',none:'Bado hakuna kumbukumbu. Ongeza shajara, maendeleo au kikumbusho.',
  all:'Zote',done:'Imekamilika',reopen:'Fungua tena',edit:'Hariri',delete:'Futa',due:'Leo au imepitwa',calendar:'Ongeza kwenye kalenda',
  export:'Pakua kumbukumbu',deleteAll:'Futa kumbukumbu zote',notice:'Kalenda itaonyesha kikumbusho cha kawaida tu. Hii si arifa ya moja kwa moja; vikumbusho huonekana unapofungua programu.',
  warning:'Hii ni programu ya kujipangia, si ushauri au rekodi rasmi ya matibabu. Uliza mtaalamu wa afya kwa maamuzi ya kiafya.',
  refresh:'Sasisha',reset:'Ongeza kumbukumbu mpya',empty:'Hakuna kumbukumbu zinazolingana.',busy:'Inahifadhi…',clearWarning:'Ufute kumbukumbu ZOTE za faragha? Huwezi kutendua.',
 }
};
function downloadFile(data:string,name:string,type:string){
 const url=URL.createObjectURL(new Blob([data],{type}));
 const a=document.createElement('a');a.href=url;a.download=name;
 document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),4000);
}
export default function PersonalTrackerWorkspace({user}:{user:User}){
 const {locale}=useMamaLocale();const t=copy[locale==='sw'?'sw':'en'];
 const [items,setItems]=useState<TrackerItem[]>([]);
 const [draft,setDraft]=useState<TrackerDraft>(()=>blankTrackerDraft());
 const [editing,setEditing]=useState<TrackerItem|null>(null);
 const [kindFilter,setKindFilter]=useState<TrackerKind|'all'>('all');
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [error,setError]=useState(''),[status,setStatus]=useState('');
 const [reload,setReload]=useState(0);
 const client=authSupabase;
 useEffect(()=>{
  let alive=true;setItems([]);setError('');setStatus('');setLoading(true);setEditing(null);setDraft(blankTrackerDraft());
  if(!client){setError('The account service is not available.');setLoading(false);return;}
  void (async()=>{
   try{
    const {data:identity,error:identityError}=await client.auth.getUser();
    if(identityError||identity.user?.id!==user.id||!identity.user.email_confirmed_at)throw Error('A verified account session is required. Confirm your email and sign in again.');
    const rows:TrackerItem[]=[];let from=0;const page=250;
    while(true){
     const {data,error:loadError}=await client.from('personal_tracker_items').select(FIELDS)
      .eq('owner_id',user.id).order('created_at',{ascending:false}).range(from,from+page-1);
     if(loadError)throw loadError;
     rows.push(...(data??[] as TrackerItem[]));if(!data||data.length<page)break;
     from+=page;
     if(from>=10000)throw Error('Too many records to load safely. Contact support for a private export.');
    }
    if(alive)setItems(rows);
   }catch(e){if(alive)setError(e instanceof Error?e.message:'Unable to retrieve private tracker entries.');}
   finally{if(alive)setLoading(false);}
  })();
  return()=>{alive=false;};
 },[client,user.id,reload]);
 const ordered=useMemo(()=>orderedTrackerItems(items),[items]);
 const shown=ordered.filter(x=>kindFilter==='all'||x.kind===kindFilter);
 const due=items.filter(x=>reminderDue(x)).length;
 function newDraft(kind:TrackerKind='journal'){setDraft(blankTrackerDraft(kind));setEditing(null);setError('');setStatus('');}
 function edit(item:TrackerItem){
  setEditing(item);setDraft({kind:item.kind,subject:item.subject,title:item.title,details:item.details,
   recorded_on:item.recorded_on,value_number:item.value_number===null?'':String(item.value_number),
   value_unit:item.value_unit,remind_on:item.remind_on??'',source_kind:item.source_kind});
  setError('');setStatus('');document.querySelector('#mm-tracker-form')?.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function field<K extends keyof TrackerDraft>(name:K,value:TrackerDraft[K]){
  setDraft(prev=>({...prev,[name]:value}));
 }
 async function save(e:FormEvent){
  e.preventDefault();if(!client||busy||loading)return;setError('');setStatus('');
  let normalized:ReturnType<typeof normalizeTrackerDraft>;
  try{normalized=normalizeTrackerDraft(draft);}catch(e){setError(e instanceof Error?e.message:'Invalid entry');return;}
  setBusy(true);
  try{
   const {data:identity,error:authError}=await client.auth.getUser();
   if(authError||identity.user?.id!==user.id||!identity.user.email_confirmed_at)throw Error('The verified account session expired. Sign in again.');
   const query=editing?
    client.from('personal_tracker_items').update({...normalized,updated_at:new Date().toISOString()})
     .eq('id',editing.id).eq('owner_id',user.id).select(FIELDS).single():
    client.from('personal_tracker_items').insert({...normalized,owner_id:user.id}).select(FIELDS).single();
   const {data,error:saveError}=await query;
   if(saveError||!data)throw saveError??Error('The item could not be saved.');
   if(editing)setItems(xs=>xs.map(x=>x.id===data.id?data as TrackerItem:x));
   else setItems(xs=>[data as TrackerItem,...xs]);
   newDraft();setStatus(t.saved);
  }catch(e){setError(e instanceof Error?e.message:'Could not save. Check your connection.');}
  finally{setBusy(false);}
 }
 async function toggle(item:TrackerItem){
  if(!client||busy||loading)return;setBusy(true);setError('');setStatus('');
  try{
   const {data,error:saveError}=await client.from('personal_tracker_items').update({completed:!item.completed,updated_at:new Date().toISOString()})
    .eq('id',item.id).eq('owner_id',user.id).select(FIELDS).single();
   if(saveError||!data)throw saveError??Error('Unable to update.');
   setItems(xs=>xs.map(x=>x.id===data.id?data as TrackerItem:x));
  }catch(e){setError(e instanceof Error?e.message:'Unable to update.');}
  finally{setBusy(false);}
 }
 async function remove(item:TrackerItem){
  if(!window.confirm('Delete this private entry? This cannot be undone.')||!client||busy)return;
  setBusy(true);setError('');setStatus('');
  try{
   const {data,error:removeError}=await client.from('personal_tracker_items').delete()
    .eq('id',item.id).eq('owner_id',user.id).select('id');
   if(removeError||data?.length!==1)throw removeError??Error('The entry was not found.');
   setItems(xs=>xs.filter(x=>x.id!==item.id));
   if(editing?.id===item.id)newDraft();
  }catch(e){setError(e instanceof Error?e.message:'Unable to delete.');}
  finally{setBusy(false);}
 }
 async function deleteAll(){
  if(!client||busy||!items.length)return;
  const confirmed=window.prompt(t.clearWarning+' Type DELETE to confirm.');
  if(confirmed!=='DELETE')return;
  setBusy(true);setError('');setStatus('');
  try{
   // Per-record delete with RLS; never claim success until ALL have been acknowledged.
   for(const item of items){
    const {data,error:deleteError}=await client.from('personal_tracker_items').delete()
     .eq('id',item.id).eq('owner_id',user.id).select('id');
    if(deleteError||data?.length!==1)throw deleteError??Error('Failed to delete an item.');
   }
   setItems([]);newDraft();setStatus('All entries deleted from your tracker.');
  }catch{setError('Deletion was interrupted. Refresh to see remaining entries and retry.');setReload(v=>v+1);}
  finally{setBusy(false);}
 }
 async function exportAll(){
  if(!client||busy||loading)return;
  if(!window.confirm('Download your private tracker information as a JSON file? Protect the file on your device.'))return;
  // Refresh from the server before exporting; do not silently omit off-screen entries.
  setReload(v=>v+1);
  downloadFile(exportTrackerJson(items),'mamamwana-personal-tracker-'+localToday()+'.json','application/json');
 }
 function calendar(item:TrackerItem){
  if(!window.confirm('Add a generic reminder to your calendar? It will not include family notes or measurements.'))return;
  try{downloadFile(reminderCalendarEvent(item),'mamamwana-reminder.ics','text/calendar');}
  catch{setError('Could not prepare calendar reminder.');}
 }
 return <section className="mm-tracker" aria-labelledby="mm-tracker-title">
  <div className="mm-tracker-heading"><div><span className="eyebrow"><LockKeyhole size={15} aria-hidden="true"/> {t.eyebrow}</span>
   <h2 id="mm-tracker-title">{t.title}</h2><p>{t.lead}</p></div>
   <span className="mm-tracker-count"><ShieldCheck size={18} aria-hidden="true"/> Account only</span></div>
  <p className="mm-tracker-private"><ShieldCheck size={17} aria-hidden="true"/>{t.private}</p>
  <div className="mm-tracker-stats">
   <div><NotebookPen size={19}/><strong>{items.filter(x=>x.kind==='journal').length}</strong><span>{t.journal}</span></div>
   <div><TrendingUp size={19}/><strong>{items.filter(x=>x.kind==='progress').length}</strong><span>{t.progress}</span></div>
   <div><CalendarDays size={19}/><strong>{due}</strong><span>{t.due}</span></div>
  </div>
  <div className="mm-tracker-grid">
   <form id="mm-tracker-form" onSubmit={e=>{void save(e)}} className="mm-tracker-panel">
    <div className="mm-tracker-panel-heading"><h3>{editing?t.edit:t.add}</h3><Plus size={21} aria-hidden="true"/></div>
    <fieldset className="mm-tracker-kind"><legend>Entry type</legend>
     {(['journal','progress','reminder'] as const).map(k=><button key={k} type="button"
      className={draft.kind===k?'active':''} aria-pressed={draft.kind===k}
      disabled={busy||Boolean(editing)} onClick={()=>field('kind',k)}>{k==='journal'?<BookHeart size={16}/>:k==='progress'?<TrendingUp size={16}/>:<CalendarDays size={16}/>} {t[k]}</button>)}
    </fieldset>
    <div className="mm-tracker-fields">
     <label>{t.subject}<select value={draft.subject} onChange={e=>field('subject',e.target.value as TrackerDraft['subject'])}>
      <option value="mother">{t.mother}</option><option value="baby">{t.baby}</option><option value="family">{t.family}</option></select></label>
     <label>{t.recordDate}<input type="date" required value={draft.recorded_on} onChange={e=>field('recorded_on',e.target.value)}/></label>
    </div>
    <label>{t.titleLabel}<input required maxLength={120} value={draft.title} placeholder={draft.kind==='reminder'?'Example: Appointment follow-up':'What would you like to remember?'} onChange={e=>field('title',e.target.value)}/></label>
    <label>{t.details}<textarea rows={3} maxLength={2000} value={draft.details} onChange={e=>field('details',e.target.value)}/></label>
    {draft.kind==='progress'&&<div className="mm-tracker-fields">
     <label>{t.value}<input type="number" min="0" max="100000" step="any" value={draft.value_number} onChange={e=>field('value_number',e.target.value)} placeholder="6.2"/></label>
     <label>{t.unit}<input maxLength={24} value={draft.value_unit} onChange={e=>field('value_unit',e.target.value)} placeholder="kg, cm, steps…"/></label></div>}
    {draft.kind==='reminder'&&<label>{t.date}<input required type="date" value={draft.remind_on} onChange={e=>field('remind_on',e.target.value)}/></label>}
    <label>{t.source}<select value={draft.source_kind} onChange={e=>field('source_kind',e.target.value as TrackerDraft['source_kind'])}>
     <option value="self">{t.self}</option><option value="provider_supplied">{t.provider}</option></select></label>
    <div className="mm-tracker-buttons"><button type="submit" disabled={busy||loading||Boolean(error&&items.length===0&&loading)}><Check size={17}/>{busy?t.busy:t.save}</button>
     {editing&&<button type="button" className="ghost" onClick={()=>newDraft()}>{t.cancel}</button>}</div>
   </form>
   <section className="mm-tracker-panel" aria-labelledby="mm-tracker-list-title">
    <div className="mm-tracker-panel-heading"><h3 id="mm-tracker-list-title">Your entries</h3><button type="button" className="mm-tracker-icon" aria-label={t.refresh} disabled={busy} onClick={()=>setReload(v=>v+1)}><RefreshCw size={18}/></button></div>
    <div className="mm-tracker-filters" role="group" aria-label="Filter private entries">
     {(['all','journal','progress','reminder'] as const).map(k=><button type="button" className={kindFilter===k?'active':''}
      key={k} aria-pressed={kindFilter===k} onClick={()=>setKindFilter(k)}>{k==='all'?t.all:t[k]}</button>)}</div>
    {loading?<p role="status">Loading private entries…</p>:shown.length===0?<p className="mm-tracker-empty">{items.length===0?t.none:t.empty}</p>:<div className="mm-tracker-list">
     {shown.map(item=><article key={item.id} className="mm-tracker-entry">
      <div className="mm-tracker-entry-head"><span>{t[item.kind]} · {t[item.subject]}</span><time dateTime={item.recorded_on}>{item.recorded_on}</time></div>
      <h4>{item.title}</h4>{item.details&&<p className="mm-tracker-entry-details">{item.details}</p>}
      {item.value_number!==null&&<p className="mm-tracker-measure">{item.value_number} {item.value_unit}<small> · User-recorded value, not interpreted</small></p>}
      {item.kind==='reminder'&&<p className={reminderDue(item)?'mm-tracker-due':''}><CalendarDays size={15} aria-hidden="true"/> {item.remind_on} · {item.completed?t.done:reminderDue(item)?t.due:'Upcoming'}</p>}
      {item.source_kind==='provider_supplied'&&<small>Copied from a professional source — not independently verified</small>}
      <div className="mm-tracker-entry-actions">
       <button disabled={busy} onClick={()=>edit(item)}>{t.edit}</button>
       {item.kind==='reminder'&&<button disabled={busy} onClick={()=>{void toggle(item)}}>{item.completed?t.reopen:t.done}</button>}
       {item.kind==='reminder'&&<button disabled={busy} onClick={()=>calendar(item)}>{t.calendar}</button>}
       <button disabled={busy} className="danger" onClick={()=>{void remove(item)}}><Trash2 size={14} aria-hidden="true"/>{t.delete}</button>
      </div></article>)}</div>}
    <div className="mm-tracker-manage">
     <button type="button" disabled={busy||loading||!items.length} onClick={()=>{void exportAll()}}><Download size={16}/>{t.export}</button>
     <button type="button" disabled={busy||loading||!items.length} className="danger" onClick={()=>{void deleteAll()}}><Trash2 size={16}/>{t.deleteAll}</button>
    </div>
   </section>
  </div>
  {error&&<p role="alert" className="mm-tracker-error">{error}</p>}
  {status&&<p role="status" className="mm-tracker-success">{status}</p>}
  <p className="mm-tracker-note"><Heart size={16} aria-hidden="true"/>{t.warning}</p>
  <p className="mm-tracker-note"><CalendarDays size={16} aria-hidden="true"/>{t.notice}</p>
 </section>;
}
