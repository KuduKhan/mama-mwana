import {useEffect,useMemo,useState} from 'react';
import type {FormEvent} from 'react';
import {CalendarCheck,CheckCircle2,ClipboardCopy,ClipboardList,FileCheck2,HelpCircle,Link2,NotebookPen,Plus,RefreshCw,ShieldCheck,Trash2} from 'lucide-react';
import type {Journey} from '../lib/domain';
import {supabase} from '../lib/supabase';
import {buildPrivateVisitBrief,CARE_KINDS,CARE_SUGGESTIONS,orderCareItems,validateCareDraft} from '../lib/carePlanner';
import type {CareDraft,CareItem,CareItemKind,CareItemState} from '../lib/carePlanner';

interface Props {journey:Journey;isDemo:boolean;userId:string|null}
const empty:CareDraft={kind:'question',title:'',detail:'',due_on:null,visit_source_id:null};
const topics:CareItemKind[]=['question','preparation','follow_up'];
export default function CarePlannerV07({journey,isDemo,userId}:Props){
 const [items,setItems]=useState<CareItem[]>([]);
 const [draft,setDraft]=useState<CareDraft>(empty);
 const [editing,setEditing]=useState<CareItem|null>(null);
 const [selectedVisit,setSelectedVisit]=useState('');
 const [filter,setFilter]=useState<'open'|'done'|'all'>('open');
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(false);
 const [loadFailed,setLoadFailed]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [reloadKey,setReloadKey]=useState(0);
 const demo=isDemo||!userId;
 useEffect(()=>{
  let alive=true;
  setItems([]);setDraft({...empty});setEditing(null);setSelectedVisit('');setError('');setNotice('');setLoadFailed(false);
  if(demo)return;
  if(!supabase){setLoadFailed(true);setError('Connect a secure database to save appointment planning items.');return;}
  const client=supabase;setLoading(true);
  void Promise.resolve(client.from('care_plan_items')
   .select('id,journey_id,owner_id,kind,title,detail,state,due_on,visit_source_id,version,created_at,updated_at')
   .eq('journey_id',journey.id).order('created_at',{ascending:false}).limit(250))
   .then(({data,error:queryError})=>{
    if(!alive)return;
    if(queryError){setLoadFailed(true);setError('Care Planner cannot load. Apply and verify the v0.7 database migration.');}
    else setItems((data??[]) as CareItem[]);
    setLoading(false);
   }).catch(()=>{if(alive){setLoadFailed(true);setError('Unable to load your care plan. Check your connection.');setLoading(false);}});
  return ()=>{alive=false;};
 },[demo,journey.id,userId,reloadKey]);
 const arranged=useMemo(()=>orderCareItems(items),[items]);
 const shown=arranged.filter(x=>filter==='all'||x.state===filter);
 const open=items.filter(x=>x.state==='open').length;
 const done=items.length-open;
 const setField=<K extends keyof CareDraft>(key:K,value:CareDraft[K])=>setDraft(d=>({...d,[key]:value}));
 function refresh(){setReloadKey(x=>x+1);}
 function beginEdit(item:CareItem){setEditing(item);setDraft({kind:item.kind,title:item.title,detail:item.detail,due_on:item.due_on,visit_source_id:item.visit_source_id});setError('');setNotice('');}
 function cancelEdit(){setEditing(null);setDraft({...empty});setError('');}
 const reportError=(e:unknown)=>{
  const message=e instanceof Error?e.message:String(e);
  if(message.includes('MM_CARE_CONFLICT')||message.includes('0 rows')||message.includes('Cannot coerce')){
   setError('Someone changed this item in another session. The list will reload; review it before retrying.');
   refresh();
  }else setError('Unable to update your care plan. '+message);
 };
 async function create(e:FormEvent){
  e.preventDefault();setError('');setNotice('');
  const problem=validateCareDraft(draft,journey.visits);
  if(problem){setError(problem);return;}
  const normalized={kind:draft.kind,title:draft.title.trim(),detail:draft.detail.trim(),due_on:draft.due_on,visit_source_id:draft.visit_source_id};
  if(demo){
   if(editing){setItems(current=>current.map(x=>x.id===editing.id?{...x,...normalized,version:x.version+1}:x));cancelEdit();setNotice('Demo item revised.');return;}
   const now=new Date().toISOString();
   setItems(current=>[{
    ...normalized,id:crypto.randomUUID(),journey_id:journey.id,owner_id:'demo',
    state:'open',version:1,created_at:now,updated_at:now
   },...current]);setDraft({...empty});setNotice('Sample item added. Demo content is not saved.');return;
  }
  if(!supabase||!userId)return;
  setBusy(true);
  const selection='id,journey_id,owner_id,kind,title,detail,state,due_on,visit_source_id,version,created_at,updated_at';
  if(editing){
   const {data,error:saveError}=await supabase.from('care_plan_items')
    .update({...normalized,version:editing.version+1})
    .eq('id',editing.id).eq('journey_id',journey.id).eq('owner_id',userId)
    .eq('version',editing.version).select(selection).maybeSingle();
   setBusy(false);
   if(saveError||!data){reportError(saveError??new Error('MM_CARE_CONFLICT'));return;}
   setItems(current=>current.map(x=>x.id===editing.id?data as CareItem:x));cancelEdit();setNotice('Your updated care item was saved.');return;
  }
  const {data,error:saveError}=await supabase.from('care_plan_items')
   .insert({...normalized,journey_id:journey.id,owner_id:userId,state:'open',version:1})
   .select(selection).single();
  setBusy(false);
  if(saveError){reportError(saveError);return;}
  setItems(current=>[data as CareItem,...current]);setDraft({...empty});setNotice('Your item was saved privately.');
 }
 async function changeState(item:CareItem,state:CareItemState){
  setError('');setNotice('');
  if(demo){setItems(a=>a.map(x=>x.id===item.id?{...x,state,version:x.version+1}:x));return;}
  if(!supabase||!userId||busy)return;
  setBusy(true);
  const {data,error:saveError}=await supabase.from('care_plan_items').update({
   state,version:item.version+1
  }).eq('id',item.id).eq('journey_id',journey.id).eq('owner_id',userId).eq('version',item.version)
   .select('id,journey_id,owner_id,kind,title,detail,state,due_on,visit_source_id,version,created_at,updated_at').maybeSingle();
  setBusy(false);
  if(saveError||!data){reportError(saveError??new Error('MM_CARE_CONFLICT'));return;}
  setItems(a=>a.map(x=>x.id===item.id?data as CareItem:x));
 }
 async function remove(item:CareItem){
  if(!window.confirm('Remove this caregiver-written note from your care plan?'))return;
  setError('');setNotice('');
  if(demo){setItems(a=>a.filter(x=>x.id!==item.id));return;}
  if(!supabase||!userId||busy)return;
  setBusy(true);
  const {data,error:saveError}=await supabase.from('care_plan_items').delete()
   .eq('id',item.id).eq('journey_id',journey.id).eq('owner_id',userId).eq('version',item.version).select('id');
  setBusy(false);
  if(saveError||data?.length!==1){reportError(saveError??new Error('MM_CARE_CONFLICT'));return;}
  setItems(a=>a.filter(x=>x.id!==item.id));setNotice('Care note removed.');
 }
 async function copyBrief(){
  setError('');setNotice('');
  const prepared=buildPrivateVisitBrief(journey,items,selectedVisit||null,new Date().toISOString().slice(0,10));
  if(!window.confirm('This brief contains your private clinic questions and notes. Copy it to the clipboard? Only paste it where you trust the destination.'))return;
  try{
   if(!navigator.clipboard?.writeText)throw new Error('Clipboard permission is not available. Open this page over HTTPS.');
   await navigator.clipboard.writeText(prepared);
   setNotice('Private visit brief copied. Paste it only into a trusted destination.');
  }catch{setError('Clipboard access unavailable or blocked. Your notes have not been shared.');}
 }
 return <div className="page-content care07">
  <div className="section-heading"><div><div className="eyebrow">MAMAMWANA CARE CONTINUITY • V0.7</div><h2>My care planner</h2><p>Prepare for clinic conversations, organize personal questions and follow up on your own decisions.</p></div></div>
  <div className="care07-intro"><span><ShieldCheck size={25}/></span><div><strong>Your notes. Your choices.</strong><p>This is a caregiver-managed planner, not a clinician's prescription, appointment booking system, or emergency service. Always follow your care team's instructions.</p></div></div>
  <div className="care07-metrics"><div><NotebookPen size={20}/><small>Open care items</small><strong>{open}</strong></div><div><CheckCircle2 size={20}/><small>Completed notes</small><strong>{done}</strong></div><div><CalendarCheck size={20}/><small>Recorded visits</small><strong>{journey.visits.length}</strong></div></div>
  <section className="panel care07-form"><div className="panel-heading"><div><div className="eyebrow">WRITE IT DOWN</div><h3>{editing?'Edit your care item':'Add something to remember'}</h3></div><Plus size={21}/></div>
   <div className="care07-templates">{CARE_SUGGESTIONS.map(t=><button type="button" key={t.title} onClick={()=>setDraft(d=>({...d,kind:t.kind,title:t.title}))}>{t.title}</button>)}</div>
   <form onSubmit={e=>{void create(e)}}>
    <div className="care07-form-grid">
     <label>Type of item<select value={draft.kind} onChange={e=>setField('kind',e.target.value as CareItemKind)}>{topics.map(k=><option key={k} value={k}>{CARE_KINDS[k]}</option>)}</select></label>
     <label>For which clinic visit?<select value={draft.visit_source_id??''} onChange={e=>setField('visit_source_id',e.target.value||null)}><option value="">General / any visit</option>{journey.visits.map(v=><option key={v.id} value={v.id}>{v.clinic} · {v.scheduled_on}</option>)}</select></label>
    </div>
    <label>Question or action<input value={draft.title} required maxLength={160} minLength={3} onChange={e=>setField('title',e.target.value)} placeholder="What would I like to discuss or remember?"/></label>
    <label>Supporting details (optional)<textarea rows={3} maxLength={1200} value={draft.detail} onChange={e=>setField('detail',e.target.value)} placeholder="A short note for your next visit. Avoid information you would not want on a device."/></label>
    <div className="care07-form-bottom"><label>Target date (optional)<input type="date" value={draft.due_on??''} onChange={e=>setField('due_on',e.target.value||null)}/></label><div className="care07-submit-actions"><button type="submit" disabled={busy||loading||loadFailed}><Plus size={16}/> {editing?'Save changes':'Save to my plan'}</button>{editing&&<button className="care07-cancel" type="button" onClick={cancelEdit} disabled={busy}>Cancel</button>}</div></div>
   </form>
   {demo&&<p className="care07-demo">Preview mode: entries are kept in this page only and disappear when you leave.</p>}
  </section>
  <section className="panel care07-list"><div className="panel-heading"><div><div className="eyebrow">PERSONAL ACTIONS</div><h3>Care questions & follow-ups</h3></div><button className="care07-icon-button" aria-label="Refresh care plan" title="Reload latest saved items" disabled={busy||loading} onClick={refresh}><RefreshCw size={18}/></button></div>
   <div className="care07-tabs" role="group" aria-label="Filter care items">{(['open','done','all'] as const).map(x=><button key={x} onClick={()=>setFilter(x)} className={filter===x?'active':''}>{x==='open'?'Open':x==='done'?'Completed':'All'}</button>)}</div>
   {loading&&<p className="care07-note">Loading your private care items…</p>}
   {!loading&&shown.length===0&&<div className="care07-empty"><ClipboardList size={27}/><p>No {filter==='all'?'care items':filter} items yet. Use the form above to prepare for your next care visit.</p></div>}
   {!loading&&shown.map(item=>{
    const related=journey.visits.find(v=>v.id===item.visit_source_id);
    return <article className={'care07-entry '+(item.state==='done'?'is-done':'')} key={item.id}>
     <span className="care07-entry-icon">{item.kind==='question'?<HelpCircle size={20}/>:item.kind==='preparation'?<ClipboardList size={20}/>:<FileCheck2 size={20}/>}</span>
     <div className="care07-entry-body"><small className="care07-kind">{CARE_KINDS[item.kind]}</small><h4>{item.title}</h4>{item.detail&&<p>{item.detail}</p>}<div className="care07-entry-meta">{related&&<span><Link2 size={13}/>{related.clinic}</span>}{item.due_on&&<span><CalendarCheck size={13}/>Target {item.due_on}</span>}<span>Revision {item.version}</span></div></div>
     <div className="care07-entry-actions"><button disabled={busy} onClick={()=>beginEdit(item)}>Edit</button><button disabled={busy} onClick={()=>{void changeState(item,item.state==='open'?'done':'open')}}>{item.state==='open'?'Mark completed':'Reopen'}</button><button disabled={busy} aria-label={'Remove '+item.title} onClick={()=>{void remove(item)}}><Trash2 size={16}/></button></div>
    </article>;
   })}
  </section>
  <section className="panel care07-brief"><div className="panel-heading"><div><div className="eyebrow">PRIVATE APPOINTMENT HANDOFF</div><h3>Prepare a visit brief</h3></div><ClipboardCopy size={21}/></div>
   <p className="muted">Assemble your open questions, preparation and follow-up notes into a short text brief. It never sends records to anyone automatically or includes clinical growth measurements. You decide whether to copy it.</p>
   <div className="care07-brief-controls"><label>Choose a clinic visit<select value={selectedVisit} onChange={e=>setSelectedVisit(e.target.value)}><option value="">General care brief</option>{journey.visits.map(v=><option key={v.id} value={v.id}>{v.clinic} · {v.scheduled_on}</option>)}</select></label><button type="button" onClick={()=>{void copyBrief()}}><ClipboardCopy size={16}/> Copy private brief</button></div>
   <p className="care07-disclaimer">Clipboard copies may be visible to other apps or devices. Never share this brief without reviewing its contents and deciding who should receive it.</p>
  </section>
  {error&&<p className="v4-error" role="alert">{error}</p>}
  {notice&&<p className="care07-notice" role="status">{notice}</p>}
 </div>;
}
