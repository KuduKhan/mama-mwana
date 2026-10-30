import {useMemo,useState} from 'react';
import {CalendarCheck,ChevronRight,ClipboardList,Download,HeartHandshake,LockKeyhole,Search} from 'lucide-react';
import type {Journey} from '../lib/domain';
import {readable,todayISO} from '../lib/domain';
import {buildCareEvents} from '../lib/careJourney';
type Filter='all'|'visit'|'baby'|'wellbeing';
const filterOptions:readonly {key:Filter;label:string}[]=[{key:'all',label:'All'},{key:'visit',label:'Visits'},{key:'baby',label:'Baby'},{key:'wellbeing',label:'Wellbeing'}];
type RecordItem={id:string;day:string;kind:Filter;label:string;status:string;journey:Journey};
/** Private notes/clinic names deliberately excluded from the unified sample-data timeline. */
export function safeFamilyDigest(journeys:Journey[]):RecordItem[]{
 return journeys.flatMap(j=>buildCareEvents(j).map(e=>({
  id:j.id+':'+e.id,day:e.day,kind:e.kind,
  label:e.kind==='visit'?'Visit journal entry':e.kind==='baby'?'Baby milestone entry':'Wellbeing journal entry',
  status:e.status,journey:j
 }))).sort((a,b)=>b.day.localeCompare(a.day)||a.id.localeCompare(b.id));
}
export function FamilyIntelligenceV203({journeys,demo,onSelect,onHub}:{journeys:Journey[];demo:boolean;onSelect:(j:Journey)=>void;onHub:()=>void}){
 const [filter,setFilter]=useState<Filter>('all');
 const [search,setSearch]=useState('');
 const [more,setMore]=useState(false);
 const all=useMemo(()=>demo?safeFamilyDigest(journeys):[],[demo,journeys]);
 const visible=all.filter(e=>(filter==='all'||e.kind===filter)&&(!search||e.label.toLowerCase().includes(search.toLowerCase())||e.day.includes(search))).slice(0,more?30:6);
 return <section className="mm23-panel" aria-labelledby="mm23-family-title"><div className="mm23-head"><span className="mm23-symbol"><HeartHandshake size={20} aria-hidden="true"/></span><div><h3 id="mm23-family-title">Family Journey 360°</h3><p>Explore a combined family timeline in the sample-data demo. No private notes or clinical results appear here.</p></div></div>
  {!demo?<p className="mm23-locked"><LockKeyhole size={17}/> This enhanced family overview is limited to sample data until additional privacy review.</p>:<>
   <div className="mm23-tools"><div className="mm23-chips" role="group" aria-label="Filter family timeline">{filterOptions.map(f=><button type="button" aria-pressed={filter===f.key} key={f.key} onClick={()=>setFilter(f.key)}>{f.label}</button>)}</div><label className="mm23-search"><Search size={16} aria-hidden="true"/><span className="sr-only">Search safe family events</span><input aria-label="Search safe family events" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search event type or date"/></label></div>
   {visible.length?<ol className="mm23-timeline">{visible.map(e=><li key={e.id}><time dateTime={e.day}>{readable(e.day)}</time><span><strong>{e.label}</strong><small>{e.status==='planned'?'Planned in journal':e.status==='confirm'?'Confirm journal date':'Recorded in sample journal'}</small></span><button type="button" onClick={()=>onSelect(e.journey)} aria-label={'Open family journey for '+e.day}><ChevronRight size={18} aria-hidden="true"/></button></li>)}</ol>:<p className="mm23-empty">No matching sample milestones yet.</p>}
   <div className="mm23-footer">{visible.length>=6&&!more&&<button type="button" onClick={()=>setMore(true)}>Show more milestones</button>}<button type="button" onClick={onHub}>Open personal timeline <ChevronRight size={17}/></button></div>
  </>}
 </section>;
}
export const DEMO_VISIT_QUESTIONS=Object.freeze([
 'What should I prepare or bring for the next appointment?',
 'What follow-up questions should I ask my health professional?',
 'When and how will I receive any results?',
 'Who should I contact with a new concern before the next visit?'
]);
/** Visit kit is a local-only checklist; download happens only after direct user action. */
export function demoVisitKit(checked:readonly number[],date:string):string{
 const questions=checked.filter(n=>Number.isInteger(n)&&n>=0&&n<DEMO_VISIT_QUESTIONS.length)
  .filter((n,i,a)=>a.indexOf(n)===i).map(n=>'• '+DEMO_VISIT_QUESTIONS[n]);
 return ['MAMAMWANA — SAMPLE VISIT PREPARATION','Date prepared: '+date,
  'Educational questions, not a booked visit or clinical record.','',
  'Questions to discuss:',...(questions.length?questions:['• No questions selected']),
  '','Confirm dates and advice with your own healthcare professional.'].join('\n');
}
export function VisitPreparationV203({journey,demo}:{journey:Journey;demo:boolean}){
 const [selected,setSelected]=useState<number[]>([]);
 const [message,setMessage]=useState('');
 const upcoming=journey.visits.filter(v=>!v.attended&&v.scheduled_on>=todayISO()).sort((a,b)=>a.scheduled_on.localeCompare(b.scheduled_on))[0];
 function download(){
  if(!demo)return;
  const content=demoVisitKit(selected,todayISO());
  const href=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=href;link.download='mamamwana-sample-visit-questions.txt';link.click();
  URL.revokeObjectURL(href);setMessage('Sample visit preparation downloaded.');
 }
 return <section className="mm23-panel mm23-visit" aria-labelledby="mm23-visit-title"><div className="mm23-head"><span className="mm23-symbol"><ClipboardList size={20}/></span><div><h3 id="mm23-visit-title">Prepare for your next visit</h3><p>{demo?(upcoming?'You entered a visit for '+readable(upcoming.scheduled_on)+'. Confirm it directly with your clinic.':'No upcoming visit recorded in your sample journal.'): 'General visit questions are available in the sample-data demo only.'}</p></div></div>
 {!demo?<p className="mm23-locked"><LockKeyhole size={16}/> Private visit preparation is pending clinical and privacy signoff.</p>:<><fieldset className="mm23-questions"><legend>Choose the questions to include in your sample visit pack</legend>{DEMO_VISIT_QUESTIONS.map((q,i)=><label key={q}><input type="checkbox" checked={selected.includes(i)} onChange={e=>setSelected(v=>e.target.checked?[...v,i]:v.filter(n=>n!==i))}/><span>{q}</span></label>)}</fieldset><button type="button" className="mm23-download" onClick={download}><Download size={17}/> Download sample question pack</button>{message&&<p role="status" className="mm23-confirm">{message}</p>}<p className="mm23-small"><CalendarCheck size={15}/> Nothing is transmitted or saved; this file contains generic sample questions only.</p></>}
 </section>;
}