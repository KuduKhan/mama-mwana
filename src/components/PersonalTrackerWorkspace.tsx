import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import {CalendarDays,CheckCircle2,Download,FileClock,NotebookPen,Plus,RefreshCw,Search,ShieldCheck,Trash2,X} from 'lucide-react';
import {authSupabase} from '../lib/supabase';
import '../personal-tracker.css';
import {useMamaLocale} from '../lib/locale';
import {
  fileSafeLocalDate,genericReminderCalendar,TRACKER_PAGE_SIZE,
  trackerExport,validateTrackerDraft,type TrackerDraft,type TrackerEntry,
  type TrackerFilter,type TrackerOrder
} from '../lib/personalTracker';

const table = 'personal_tracker_entries';
const columns = 'id,owner_id,kind,title,note,event_date,completed,created_at,updated_at';
const emptyDraft: TrackerDraft = {kind:'journal',title:'',note:'',event_date:null};

function downloadFile(name:string,content:string,mime:string){
  const url=URL.createObjectURL(new Blob([content],{type:mime}));
  const link=document.createElement('a');
  link.href=url; link.download=name; document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function displayDate(value:string|null,locale:string){
  if(!value)return 'No date';
  const date=new Date(value+'T12:00:00');
  return Number.isNaN(date.getTime())?value:date.toLocaleDateString(locale==='sw'?'sw-KE':'en-KE',{day:'numeric',month:'short',year:'numeric'});
}

/**
 * An opt-in, owner-only non-diagnostic record book.
 * All access control is enforced by Supabase RLS, not by the client filter.
 * The clinical workspace is deliberately separate and remains locked.
 */
export default function PersonalTrackerWorkspace({userId}:{userId:string}){
  const {locale}=useMamaLocale();
  const [entries,setEntries]=useState<TrackerEntry[]>([]);
  const [count,setCount]=useState(0);
  const [upcoming,setUpcoming]=useState<TrackerEntry[]>([]);
  const [page,setPage]=useState(0);
  const [kindFilter,setKindFilter]=useState<TrackerFilter>('all');
  const [order,setOrder]=useState<TrackerOrder>('newest');
  const [queryInput,setQueryInput]=useState('');
  const [query,setQuery]=useState('');
  const [draft,setDraft]=useState<TrackerDraft>(emptyDraft);
  const [edit,setEdit]=useState<TrackerEntry|null>(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const requestGeneration=useRef(0);

  const load=useCallback(async()=>{
    const generation=++requestGeneration.current;
    if(!authSupabase){
      setEntries([]);setUpcoming([]);setCount(0);setLoading(false);
      setError('Private tracking is unavailable without approved account configuration.');
      return;
    }
    setLoading(true);setError('');
    let request=authSupabase.from(table).select(columns,{count:'exact'}).eq('owner_id',userId);
    if(kindFilter!=='all')request=request.eq('kind',kindFilter);
    if(query.trim())request=request.ilike('title','%'+query.trim().slice(0,100)+'%');
    const [records,reminders]=await Promise.all([
      request.order('created_at',{ascending:order==='oldest'}).order('id',{ascending:true})
        .range(page*TRACKER_PAGE_SIZE,(page+1)*TRACKER_PAGE_SIZE-1),
      authSupabase.from(table).select(columns).eq('owner_id',userId)
        .eq('kind','reminder').eq('completed',false).gte('event_date',fileSafeLocalDate())
        .order('event_date',{ascending:true}).limit(4)
    ]);
    if(generation!==requestGeneration.current)return;
    setLoading(false);
    if(records.error){
      setEntries([]);setUpcoming([]);setCount(0);
      setError('Your private tracker could not be loaded. Check account access and database setup; no data has been changed.');
      return;
    }
    setEntries((records.data||[]) as TrackerEntry[]);
    setCount(records.count||0);
    setUpcoming(reminders.error?[]:(reminders.data||[]) as TrackerEntry[]);
    if(reminders.error)setNotice('Upcoming reminders could not be checked. Your saved entries are still available.');
  },[userId,kindFilter,order,query,page]);

  useEffect(()=>{
    void load();
    return()=>{requestGeneration.current++;};
  },[load]);

  function resetEditor(){
    setEdit(null);setDraft({...emptyDraft});
  }
  function startEdit(entry:TrackerEntry){
    setEdit(entry);
    setDraft({kind:entry.kind,title:entry.title,note:entry.note,event_date:entry.event_date});
    setError('');setNotice('');
    document.getElementById('mm-tracker-editor')?.scrollIntoView({behavior:'auto',block:'start'});
    document.getElementById('mm-tracker-title')?.focus();
  }
  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!authSupabase||busy)return;
    const problem=validateTrackerDraft(draft);
    if(problem){setError(problem);return;}
    setBusy(true);setError('');setNotice('');
    const payload={kind:draft.kind,title:draft.title.trim(),note:draft.note.trim(),event_date:draft.event_date||null};
    try{
      if(edit){
        const {data,error:issue}=await authSupabase.from(table)
          .update({...payload,updated_at:new Date().toISOString()})
          .eq('id',edit.id).eq('owner_id',userId).eq('updated_at',edit.updated_at).select('id');
        if(issue)throw issue;
        if(!data?.length){
          setError('This entry changed in another session or is no longer available. Refresh before editing again.');
          return;
        }
        setNotice('Entry updated privately.');
      }else{
        const {data,error:issue}=await authSupabase.from(table).insert({...payload,owner_id:userId}).select('id');
        if(issue||!data?.length)throw issue||new Error('Save not confirmed');
        setNotice('Entry saved privately.');
      }
      resetEditor();
      await load();
    }catch{
      setError('Save failed. Your changes have not been confirmed. Check your connection and try again.');
    }finally{setBusy(false);}
  }
  async function setComplete(entry:TrackerEntry){
    if(!authSupabase||busy)return;
    setBusy(true);setError('');setNotice('');
    try{
      const {data,error:issue}=await authSupabase.from(table)
        .update({completed:!entry.completed,updated_at:new Date().toISOString()})
        .eq('id',entry.id).eq('owner_id',userId).eq('updated_at',entry.updated_at).select('id');
      if(issue)throw issue;
      if(!data?.length){setError('This reminder changed in another session. Refresh before retrying.');return;}
      setNotice(entry.completed?'Reminder marked pending.':'Reminder completed.');
      await load();
    }catch{setError('Unable to update this reminder. Nothing has been confirmed.');}
    finally{setBusy(false);}
  }
  async function remove(entry:TrackerEntry){
    if(!authSupabase||busy||!window.confirm('Permanently delete this personal tracker entry?'))return;
    setBusy(true);setError('');setNotice('');
    try{
      const {data,error:issue}=await authSupabase.from(table).delete()
        .eq('id',entry.id).eq('owner_id',userId).select('id');
      if(issue)throw issue;
      if(!data?.length){setError('Entry already removed or no longer accessible. Refresh your records.');return;}
      if(edit?.id===entry.id)resetEditor();
      setNotice('Entry deleted.');
      await load();
    }catch{setError('Deletion failed. Please check your connection.');}
    finally{setBusy(false);}
  }
  async function exportRecords(){
    if(!authSupabase||busy||!window.confirm('Export ALL your personal tracker entries to an UNENCRYPTED JSON file on this device? Keep this file private.'))return;
    setBusy(true);setError('');setNotice('');
    try{
      const exported:TrackerEntry[]=[];
      for(let offset=0;offset<100000;offset+=500){
        const {data,error:issue}=await authSupabase.from(table).select(columns).eq('owner_id',userId)
          .order('created_at',{ascending:false}).order('id',{ascending:true}).range(offset,offset+499);
        if(issue)throw issue;
        const batch=(data||[]) as TrackerEntry[];
        exported.push(...batch);
        if(batch.length<500)break;
        if(offset===99500)throw new Error('Export size limit');
      }
      downloadFile('mamamwana-private-tracker-'+fileSafeLocalDate()+'.json',trackerExport(exported),'application/json;charset=utf-8');
      setNotice('Private export prepared. Store it securely; the downloaded file is not encrypted.');
    }catch{setError('Export failed; no complete export file was produced. Try again later.');}
    finally{setBusy(false);}
  }
  function calendar(entry:TrackerEntry){
    const content=genericReminderCalendar(entry);
    if(!content){setError('This reminder has no valid calendar date.');return;}
    if(!window.confirm('Create a generic calendar event? Only the date and “MamaMwana personal reminder” are included; no private notes.'))return;
    downloadFile('mamamwana-reminder-'+entry.event_date+'.ics',content,'text/calendar;charset=utf-8');
    setNotice('Generic calendar event downloaded. Import it into your calendar if you wish.');
  }
  const setFilter=(value:TrackerFilter)=>{setKindFilter(value);setPage(0);};
  const pageCount=Math.max(1,Math.ceil(count/TRACKER_PAGE_SIZE));
  return <section className="mm-pt" aria-labelledby="mm-pt-heading">
    <div className="mm-pt-hero">
      <div className="mm-pt-icon"><NotebookPen size={23} aria-hidden="true"/></div>
      <div className="mm-pt-intro">
        <span className="mm-pt-kicker">YOUR PRIVATE SPACE · NON-DIAGNOSTIC</span>
        <h2 id="mm-pt-heading">{locale==='sw'?'Daftari langu la binafsi':'Your personal tracker'}</h2>
        <p>Keep your own journal, progress notes and date reminders. This is not a medical record, diagnosis, clinic appointment or emergency service.</p>
      </div>
      <div className="mm-pt-privacy"><ShieldCheck size={16} aria-hidden="true"/>Account-only records</div>
    </div>
    <div className="mm-pt-stats" aria-label="Personal tracking overview">
      <div><NotebookPen size={18} aria-hidden="true"/><strong>{count}</strong><span>Matching records</span></div>
      <div><CalendarDays size={18} aria-hidden="true"/><strong>{upcoming.length}{upcoming.length===4?'+':''}</strong><span>Next reminder dates</span></div>
      <div><FileClock size={18} aria-hidden="true"/><strong>{page+1} / {pageCount}</strong><span>History pages</span></div>
    </div>
    <div className="mm-pt-layout">
      <form id="mm-tracker-editor" className="mm-pt-card mm-pt-editor" onSubmit={e=>void save(e)}>
        <div className="mm-pt-cardhead"><h3>{edit?'Edit your entry':'Add an entry'}</h3><span><Plus size={16} aria-hidden="true"/>Personal</span></div>
        <label htmlFor="mm-tracker-kind">Entry type</label>
        <select id="mm-tracker-kind" value={draft.kind} onChange={e=>setDraft(v=>({...v,kind:e.target.value as TrackerDraft['kind']}))} disabled={busy}>
          <option value="journal">Journal note</option><option value="progress">Progress record</option><option value="reminder">Date reminder</option>
        </select>
        <label htmlFor="mm-tracker-title">Title</label>
        <input id="mm-tracker-title" value={draft.title} required maxLength={160} onChange={e=>setDraft(v=>({...v,title:e.target.value}))} disabled={busy} placeholder="A short personal title"/>
        <label htmlFor="mm-tracker-note">Your notes <small>(optional)</small></label>
        <textarea id="mm-tracker-note" value={draft.note} maxLength={4000} rows={4} onChange={e=>setDraft(v=>({...v,note:e.target.value}))} disabled={busy} placeholder="Write only what you choose to record"/>
        <label htmlFor="mm-tracker-date">Date {draft.kind==='reminder'?'(required)':'(optional)'}</label>
        <input type="date" id="mm-tracker-date" value={draft.event_date||''} required={draft.kind==='reminder'} onChange={e=>setDraft(v=>({...v,event_date:e.target.value||null}))} disabled={busy}/>
        <div className="mm-pt-editor-actions">
          <button className="mm-pt-primary" type="submit" disabled={busy||!draft.title.trim()}>{busy?'Working…':edit?'Save changes':'Save privately'}</button>
          {edit&&<button className="mm-pt-secondary" type="button" disabled={busy} onClick={resetEditor}><X size={15}/>Cancel</button>}
        </div>
        <p className="mm-pt-caption">Entries are saved only when the account and database are available. No automatic clinical interpretation or background alerts.</p>
      </form>
      <div className="mm-pt-side">
        <section className="mm-pt-card mm-pt-reminders" aria-labelledby="mm-pt-soon">
          <div className="mm-pt-cardhead"><h3 id="mm-pt-soon">Upcoming reminders</h3><CalendarDays size={19} aria-hidden="true"/></div>
          {upcoming.length?<ol>{upcoming.map(item=><li key={item.id}><span><strong>{displayDate(item.event_date,locale)}</strong><small>Personal reminder (check your private entries)</small></span><button type="button" className="mm-pt-link" onClick={()=>calendar(item)}>Calendar</button></li>)}</ol>:<p className="mm-pt-empty">No upcoming reminders loaded. Add a dated reminder to get started.</p>}
          <p className="mm-pt-caption">Reminders appear only when the app is open. Calendar downloads are generic and require your permission.</p>
        </section>
        <section className="mm-pt-card mm-pt-export" aria-label="Download private records">
          <div><Download size={21} aria-hidden="true"/><strong>Your data, your control</strong></div>
          <p>Download your own tracker history. Exports are plain JSON files and are not encrypted.</p>
          <button className="mm-pt-secondary" type="button" disabled={busy||loading} onClick={()=>void exportRecords()}><Download size={16} aria-hidden="true"/>Export all entries</button>
        </section>
      </div>
    </div>
    <section className="mm-pt-card mm-pt-history" aria-labelledby="mm-pt-history-heading">
      <div className="mm-pt-history-header"><div><span className="mm-pt-kicker">PERSONAL HISTORY</span><h3 id="mm-pt-history-heading">Your saved entries</h3></div><button className="mm-pt-secondary" type="button" disabled={busy||loading} onClick={()=>void load()}><RefreshCw size={15}/>Refresh</button></div>
      <div className="mm-pt-controls">
        <form role="search" aria-label="Search personal entry titles" onSubmit={e=>{e.preventDefault();setPage(0);setQuery(queryInput);}}>
          <label className="mm-pt-search"><Search size={17} aria-hidden="true"/><span className="mm-pt-sr">Search titles</span><input type="search" value={queryInput} maxLength={100} placeholder="Find an entry by title" onChange={e=>setQueryInput(e.target.value)}/></label><button type="submit">Search</button>
        </form>
        <label>Type <select value={kindFilter} onChange={e=>setFilter(e.target.value as TrackerFilter)}><option value="all">All entries</option><option value="journal">Journals</option><option value="progress">Progress</option><option value="reminder">Reminders</option></select></label>
        <label>Order <select value={order} onChange={e=>{setOrder(e.target.value as TrackerOrder);setPage(0);}}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
      </div>
      {error&&<p role="alert" className="mm-pt-error">{error}</p>}
      {notice&&<p role="status" className="mm-pt-notice">{notice}</p>}
      {loading?<p role="status" className="mm-pt-empty">Loading private entries…</p>:
      !entries.length?<p className="mm-pt-empty">No matching entries found. Add one above or adjust your filters.</p>:
      <ul className="mm-pt-list">{entries.map(entry=><li key={entry.id} className="mm-pt-entry">
        <div className="mm-pt-entry-top">
          <span className={'mm-pt-type mm-pt-type-'+entry.kind}>{entry.kind}</span>
          <span className="mm-pt-date">{displayDate(entry.event_date,locale)}</span>
          {entry.kind==='reminder'&&entry.completed&&<span className="mm-pt-done"><CheckCircle2 size={14}/>Complete</span>}
        </div>
        <h4>{entry.title}</h4>{entry.note&&<p className="mm-pt-entry-note">{entry.note}</p>}
        <div className="mm-pt-entry-actions">
          <button type="button" disabled={busy} onClick={()=>startEdit(entry)}>Edit</button>
          {entry.kind==='reminder'&&<button type="button" disabled={busy} onClick={()=>void setComplete(entry)}>{entry.completed?'Mark pending':'Complete'}</button>}
          {entry.kind==='reminder'&&entry.event_date&&<button type="button" disabled={busy} onClick={()=>calendar(entry)}>Calendar</button>}
          <button type="button" className="mm-pt-delete" disabled={busy} onClick={()=>void remove(entry)}><Trash2 size={14} aria-hidden="true"/>Delete</button>
        </div>
      </li>)}</ul>}
      <div className="mm-pt-pagination">
        <span>{count===0?'No entries':('Showing '+(page*TRACKER_PAGE_SIZE+1)+'–'+Math.min(count,(page+1)*TRACKER_PAGE_SIZE)+' of '+count)}</span>
        <div><button type="button" disabled={loading||busy||page===0} onClick={()=>setPage(v=>Math.max(0,v-1))}>Previous</button><button type="button" disabled={loading||busy||page+1>=pageCount} onClick={()=>setPage(v=>v+1)}>Next</button></div>
      </div>
    </section>
  </section>;
}
