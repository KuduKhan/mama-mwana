import {ArrowRight,CheckCircle2} from 'lucide-react';
import type {Journey} from '../lib/domain';
import {readable} from '../lib/domain';
import type {Tab} from '../ui/navigation';
import {nextJournalAction} from '../lib/journeyIntelligence';
import {useMamaLocale} from '../lib/locale';
export default function TodayNextStepV207({journey,done,total,onNavigate}:{journey:Journey;done:number;total:number;onNavigate:(tab:Tab)=>void}){
 const {locale}=useMamaLocale();
 const step=nextJournalAction(journey,done,total);
 const words=locale==='sw'?{
  checklist:['Endelea na orodha yako','Kazi ulizoandika mwenyewe'],
  visit:['Angalia ziara inayofuata','Tarehe uliyoandika: '+(step.date?readable(step.date):'hakuna')],
  plan:['Fungua mpango wako','Panga shughuli za familia']
 }:{
  checklist:['Continue your daily checklist','Your self-recorded daily tasks'],
  visit:['Review your next journal visit','Self-entered date: '+(step.date?readable(step.date):'none')],
  plan:['Open your family planner','Organize the next practical step']
 };
 const [title,description]=words[step.kind];
 return <div className="mm207-next">
  <span className="mm207-next-icon"><CheckCircle2 size={21} aria-hidden="true"/></span>
  <div className="mm207-next-copy"><strong>{title}</strong><small>{description}. {locale==='sw'?'Si ushauri wa kitabibu.':'Not medical advice.'}</small></div>
  <button type="button" onClick={()=>onNavigate(step.target)} aria-label={title}>{locale==='sw'?'Endelea':'Continue'}<ArrowRight size={17} aria-hidden="true"/></button>
 </div>;
}
