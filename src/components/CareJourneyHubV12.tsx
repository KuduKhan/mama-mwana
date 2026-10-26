import {useEffect,useMemo,useState} from 'react';
import {Activity,Baby,CalendarDays,ChevronDown,ClipboardCopy,HeartPulse,LockKeyhole,NotebookPen,ShieldCheck} from 'lucide-react';
import type {Journey} from '../lib/domain';
import {readable,todayISO} from '../lib/domain';
import {buildCareEvents,buildVisitBrief} from '../lib/careJourney';
import type {CareEventKind} from '../lib/careJourney';

type Filter='all'|CareEventKind;
const FILTERS:readonly {id:Filter;label:string}[]=[
 {id:'all',label:'All entries'},
 {id:'visit',label:'Care visits'},
 {id:'baby',label:'Baby & growth'},
 {id:'wellbeing',label:'Wellbeing'}
];
const labels={recorded:'Recorded',planned:'Planned',confirm:'Confirm status'};
const styles={visit:CalendarDays,baby:Baby,wellbeing:HeartPulse};

export default function CareJourneyHubV12({journey,isDemo}:{journey:Journey;isDemo:boolean}){
 const [filter,setFilter]=useState<Filter>('all');
 const [visible,setVisible]=useState(8);
 const [revealedFor,setRevealedFor]=useState<string|null>(null);
 const [approvedFor,setApprovedFor]=useState<string|null>(null);
 const [feedback,setFeedback]=useState('');
 const events=useMemo(()=>buildCareEvents(journey),[journey]);
 const today=todayISO();
 const selected=useMemo(()=>events.filter(e=>filter==='all'||e.kind===filter),[events,filter]);
 const upcoming=useMemo(()=>events.filter(e=>e.kind==='visit'&&e.status==='planned'&&e.day>=today).sort((a,b)=>a.day.localeCompare(b.day)).slice(0,3),[events,today]);
 const recent=selected.slice(0,visible);
 const brief=useMemo(()=>buildVisitBrief(journey),[journey]);
 const showBrief=revealedFor===journey.id;
 const allowCopy=approvedFor===journey.id&&showBrief;
 useEffect(()=>{
  setFilter('all');setVisible(8);setFeedback('');
  // A preview or consent approval belongs only to the actively selected journey.
  // Never retain it when a family member switches journeys.
  setRevealedFor(null);setApprovedFor(null);
 },[journey.id]);

 async function copyBrief(){
  if(!allowCopy)return;
  try{
   if(!navigator.clipboard?.writeText)throw new Error('Clipboard not available');
   await navigator.clipboard.writeText(brief);
   setFeedback('Notes copied. Only paste them into a place you trust.');
  }catch{
   setFeedback('The clipboard is unavailable. You can select and copy the preview manually.');
  }
 }

 return <div className="page-content m12-hub">
  <div className="section-heading">
   <div><div className="eyebrow">YOUR STORY, IN ONE PLACE</div>
    <h2>Care journey hub</h2>
    <p>Explore the dates and details you have recorded, from pregnancy appointments to your baby’s early moments.</p>
   </div>
   <span className="mini-pill"><LockKeyhole size={14} aria-hidden="true"/> {isDemo?'Sample information only':'Your private journey'}</span>
  </div>
  <section className="m12-intro panel" aria-label="Journey summary">
   <div className="m12-intro-copy">
    <span className="eyebrow">ONE CONTINUOUS STORY</span>
    <h3>Your moments, together <span aria-hidden="true">♡</span></h3>
    <p>Only entries from the pregnancy or baby journey currently selected in MamaMwana appear here. Separate child profiles and external clinic records are not automatically included.</p>
   </div>
   <div className="m12-summary" aria-label="Recorded event counts">
    <div><CalendarDays size={19} aria-hidden="true"/><strong>{journey.visits.length}</strong><span>Care visits</span></div>
    <div><Baby size={19} aria-hidden="true"/><strong>{journey.growth.length}</strong><span>Growth entries</span></div>
    <div><Activity size={19} aria-hidden="true"/><strong>{(journey.immunizations??[]).length}</strong><span>Vaccine entries</span></div>
   </div>
  </section>

  <div className="m12-layout">
   <section className="panel m12-events" aria-labelledby="m12-events-title">
    <div className="panel-heading m12-heading">
     <div><div className="eyebrow">PERSONAL JOURNAL</div><h3 id="m12-events-title">Your recorded timeline</h3></div>
     <span className="soft-label">{selected.length} {selected.length===1?'entry':'entries'}</span>
    </div>
    <p className="muted m12-footnote">Entries reflect what was recorded in MamaMwana. They do not establish clinical findings, completed treatments or verified immunizations.</p>
    <div className="m12-filters" role="group" aria-label="Filter journey events">
     {FILTERS.map(option=><button type="button" key={option.id} aria-pressed={filter===option.id} className={filter===option.id?'active':''}
       onClick={()=>{setFilter(option.id);setVisible(8);}}>{option.label}</button>)}
    </div>
    {recent.length===0?<div className="empty-state compact m12-empty">
      <NotebookPen size={30} aria-hidden="true"/><h4>No entries in this category yet</h4>
      <p>Record a care visit, growth measurement or wellbeing check-in in its existing section to see it here.</p>
     </div>:
     <ol className="m12-timeline">
      {recent.map(event=>{
       const Icon=styles[event.kind];
       return <li key={event.id} className="m12-event">
        <span className={'m12-event-icon m12-'+event.kind}><Icon size={19} aria-hidden="true"/></span>
        <div className="m12-event-info">
         <div className="m12-event-date">{readable(event.day)}<span className={'m12-status '+event.status}>{labels[event.status]}</span></div>
         <strong>{event.title}</strong><p>{event.detail}</p><small>{event.source}</small>
        </div>
       </li>;
      })}
     </ol>}
    {selected.length>visible&&<button type="button" className="btn btn-secondary m12-more" onClick={()=>setVisible(count=>count+8)}>
     Show more entries <ChevronDown size={17} aria-hidden="true"/>
    </button>}
   </section>
   <div className="m12-aside">
    <section className="panel m12-appointments" aria-labelledby="m12-upcoming-title">
     <div className="panel-heading"><div><div className="eyebrow">LOOKING AHEAD</div><h3 id="m12-upcoming-title">Next planned visits</h3></div><CalendarDays size={21} aria-hidden="true"/></div>
     {upcoming.length===0?<p className="muted">No future visits have been added to this journey. Arrange any required appointments directly with your healthcare team.</p>:
       <ul>{upcoming.map(v=><li key={v.id}><strong>{v.title}</strong><span>{readable(v.day)}</span><small>Planned in your journal; confirm with the clinic</small></li>)}</ul>}
    </section>
    <section className="panel m12-brief" aria-labelledby="m12-brief-title">
     <div className="panel-heading"><div><div className="eyebrow">PREPARE FOR A CONVERSATION</div><h3 id="m12-brief-title">My visit notes</h3></div><NotebookPen size={21} aria-hidden="true"/></div>
     <p className="muted">Review a short, user-entered excerpt before your appointment. It is not a medical record, diagnosis or verified clinic report.</p>
     {!showBrief?
       <button type="button" className="btn btn-secondary m12-reveal" onClick={()=>{setRevealedFor(journey.id);setApprovedFor(null);setFeedback('');}}>
        Review private notes
       </button>:
       <>
        <div className="m12-private"><ShieldCheck size={16} aria-hidden="true"/><span>Private preview shown only on this screen. It includes names, dates and care-visit details.</span></div>
        <pre className="m12-brief-text" aria-label="Visit preparation excerpt">{brief}</pre>
        <label className="m12-consent"><input type="checkbox" checked={allowCopy} onChange={e=>{setApprovedFor(e.target.checked?journey.id:null);setFeedback('');}}/>
         <span>I understand this contains sensitive personal information, and I will only share it deliberately.</span></label>
        <div className="m12-brief-actions">
         <button type="button" className="btn btn-primary" disabled={!allowCopy} onClick={()=>void copyBrief()}><ClipboardCopy size={16} aria-hidden="true"/> Copy notes</button>
         <button type="button" className="btn btn-subtle" onClick={()=>{setRevealedFor(null);setApprovedFor(null);setFeedback('');}}>Hide preview</button>
        </div>
        {feedback&&<p className="m12-feedback" role="status">{feedback}</p>}
       </>}
    </section>
   </div>
  </div>
  <div className="m12-safety"><ShieldCheck size={18} aria-hidden="true"/><span>This feature organizes existing entries only. It cannot verify vaccinations, assess growth, make diagnoses or replace an appointment. For urgent concerns, contact healthcare services directly.</span></div>
 </div>;
}
