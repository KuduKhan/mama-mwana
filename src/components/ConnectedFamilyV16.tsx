import {useEffect,useMemo,useState} from 'react';
import {Activity,ArrowRight,Bell,CalendarDays,CloudOff,LockKeyhole,ShieldCheck,Wifi} from 'lucide-react';
import type {Journey} from '../lib/domain';
import {readable} from '../lib/domain';
import {buildCareEvents} from '../lib/careJourney';
import {buildVisitNotices} from '../lib/notificationCenter';
import {EDUCATION_REVIEW_REGISTER,isBilingualClinicallyReviewed} from '../lib/educationGovernance';
import {useMamaLocale} from '../lib/locale';

function useNetworkHint(){
 const [online,setOnline]=useState(()=>typeof navigator==='undefined'?true:navigator.onLine);
 useEffect(()=>{
  const handle=()=>setOnline(navigator.onLine);
  window.addEventListener('online',handle);window.addEventListener('offline',handle);
  return()=>{window.removeEventListener('online',handle);window.removeEventListener('offline',handle);};
 },[]);
 return online;
}
export function ConnectionStatusV16({demo}:{demo:boolean}){
 const {t}=useMamaLocale();const online=useNetworkHint();
 return <div className={'mm16-connection '+(online?'online':'offline')} role="status" aria-live="polite" data-connection={online?'online':'offline'}>
  {online?<Wifi size={17} aria-hidden="true"/>:<CloudOff size={17} aria-hidden="true"/>}
  <span>{online?t('v16.online','Connection available'):t('v16.offline','Offline — changes may not save')}</span>
  {!online&&<small>{demo?t('v16.demoMemory','Demo entries remain only in this open page.'):t('v16.noSync','Do not enter new medical information while offline; reconnect and confirm saved records.')}</small>}
 </div>;
}
export function NotificationCenterV16({journey,enabled,onVisit}:{journey:Journey;enabled:boolean;onVisit:()=>void}){
 const {t}=useMamaLocale();
 const notices=useMemo(()=>buildVisitNotices(journey.visits,enabled),[journey,enabled]);
 const label=(kind:'overdue'|'today'|'upcoming')=>kind==='overdue'?t('v16.overdue','A journal visit date has passed'):kind==='today'?t('v16.today','A journal visit is dated today'):t('v16.soon','A journal visit is coming up');
 return <section className="mm16-panel" aria-labelledby="mm16-notices-title">
  <div className="mm16-panel-head"><span className="mm16-symbol"><Bell size={20} aria-hidden="true"/></span><div><h3 id="mm16-notices-title">{t('v16.notifications','Care reminders')}</h3><p>{t('v16.notificationIntro','In-app journal reminders only. No push messages or medical scheduling decisions.')}</p></div><span className="mm16-count">{enabled?notices.length:'—'}</span></div>
  {!enabled?<p className="mm16-muted">{t('v16.disabled','In-app reminders are off in Privacy & Records.')}</p>:notices.length===0?<p className="mm16-muted">{t('v16.clear','No journal reminders in the next seven days or overdue.')}</p>:
   <ol className="mm16-notices">{notices.map(n=><li key={n.id}><CalendarDays size={17} aria-hidden="true"/><span><strong>{label(n.kind)}</strong><small>{readable(n.day)} · {t('v16.unverified','Date entered by you, not confirmed by a clinic')}</small></span></li>)}</ol>}
  <button type="button" className="mm16-link" onClick={onVisit}>{t('v16.openVisits','Open appointment journal')} <ArrowRight size={16} aria-hidden="true"/></button>
 </section>;
}
const safeEventLabel=(kind:'visit'|'baby'|'wellbeing',status:'recorded'|'planned'|'confirm',t:(k:string,f?:string)=>string)=>{
 if(kind==='visit')return status==='planned'?t('v16.visitPlanned','Care visit planned'):status==='confirm'?t('v16.visitCheck','Care visit status to confirm'):t('v16.visitRecorded','Care visit recorded');
 if(kind==='baby')return t('v16.babyRecord','Baby journal entry');
 return t('v16.wellbeing','Personal wellbeing entry');
};
export function FamilyTimelineV16({journeys,activeId,onSelect}:{journeys:Journey[];activeId:string;onSelect:(j:Journey)=>void}){
 const {t}=useMamaLocale();
 const events=useMemo(()=>journeys.flatMap(j=>buildCareEvents(j).map(e=>({
  id:j.id+':'+e.id,journey:j,day:e.day,kind:e.kind,status:e.status
 }))).sort((a,b)=>b.day.localeCompare(a.day)||a.id.localeCompare(b.id)).slice(0,8),[journeys]);
 return <section className="mm16-panel" aria-labelledby="mm16-timeline-title">
  <div className="mm16-panel-head"><span className="mm16-symbol"><Activity size={20} aria-hidden="true"/></span><div><h3 id="mm16-timeline-title">{t('v16.timeline','Family activity timeline')}</h3><p>{t('v16.timelineIntro','Recent dates across journeys in this account. Private notes are never previewed here.')}</p></div></div>
  {events.length===0?<p className="mm16-muted">{t('v16.noEntries','No recorded family milestones yet.')}</p>:
   <ol className="mm16-timeline">{events.map(e=><li key={e.id}><time dateTime={e.day}>{readable(e.day)}</time><span><strong>{safeEventLabel(e.kind,e.status,t)}</strong><small>{e.journey.id===activeId?t('v16.current','Current journey'):t('v16.other','Another family journey')}</small></span><button type="button" onClick={()=>onSelect(e.journey)} aria-label={t('v16.openJourney','Open this family journey')}>{t('v16.open','Open')}</button></li>)}</ol>}
  <small className="mm16-muted">{t('v16.userEntered','Entries are caregiver-entered, not verified clinical records.')}</small>
 </section>;
}
export function EducationReviewV16(){
 const {t,locale}=useMamaLocale();
 return <section className="mm16-panel mm16-education" aria-labelledby="mm16-education-title">
  <div className="mm16-panel-head"><span className="mm16-symbol"><ShieldCheck size={20} aria-hidden="true"/></span><div><h3 id="mm16-education-title">{t('v16.education','Bilingual learning source register')}</h3><p>{t('v16.educationIntro','Trusted external sources with transparent editorial and translation status.')}</p></div></div>
  <p className="mm16-review-warning"><LockKeyhole size={16} aria-hidden="true"/>{t('v16.unapproved','Independent clinical and Kiswahili medical-language approvals are pending. Do not treat these links as individually reviewed advice.')}</p>
  <ul className="mm16-source-list">{EDUCATION_REVIEW_REGISTER.map(entry=><li key={entry.id}><a href={entry.sourceUrl} target="_blank" rel="noreferrer noopener">{entry.sourceLabel}</a><span>{isBilingualClinicallyReviewed(entry)?t('v16.reviewed','Approved in both languages'):t('v16.pending','Clinical and translation review pending')}</span></li>)}</ul>
  <small>{locale==='sw'?'Maelezo ya kimatibabu yanahitaji tathmini ya wataalamu kabla ya kutafsiriwa.':'Clinical source text remains English until professional translation and review are signed.'}</small>
 </section>;
}
