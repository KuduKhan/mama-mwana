import {Baby,CalendarCheck2,Heart,Lightbulb,NotebookPen,ArrowUpRight} from 'lucide-react';
import type {Journey} from '../lib/domain';
import {getPhase,pregnancyStage,readable,todayISO} from '../lib/domain';
import type {Tab} from '../ui/navigation';
import {useMamaLocale} from '../lib/locale';
import TodayNextStepV207 from './TodayNextStepV207';
/** Display-only projection of the already selected journey, without new persistence. */
export default function SmartHomeV202({journey,done,total,onNavigate}:{journey:Journey;done:number;total:number;onNavigate:(to:Tab)=>void}){
 const {locale}=useMamaLocale();
 const phase=getPhase(journey);
 const stage=phase==='pregnancy'?'Week '+pregnancyStage(journey.due_date).week:phase==='postpartum'?'Postpartum':'Growing together';
 const upcoming=journey.visits.filter(v=>!v.attended&&v.scheduled_on>=todayISO()).sort((a,b)=>a.scheduled_on.localeCompare(b.scheduled_on))[0];
 const actions=[
  {id:'care' as Tab,Icon:Heart,title:locale==='sw'?'Shughuli za leo':'Today’s wellbeing',detail:done+' / '+total+' checklist items'},
  {id:'visits' as Tab,Icon:CalendarCheck2,title:locale==='sw'?'Ziara ijayo':'Next journal visit',detail:upcoming?readable(upcoming.scheduled_on):'No visit entered'},
  {id:'hub' as Tab,Icon:NotebookPen,title:locale==='sw'?'Kumbukumbu za familia':'Journal moments',detail:journey.visits.length+' visits · '+journey.growth.length+' growth entries'}
 ];
 return <section className="mm22-smart-home" aria-labelledby="mm22-home-title">
  <div className="mm22-smart-head"><div><span className="mm22-overline"><Lightbulb size={14} aria-hidden="true"/> YOUR FAMILY SNAPSHOT</span><h2 id="mm22-home-title">{locale==='sw'?'Kila hatua, sehemu moja.':'Your everyday care, made simple.'}</h2><p>{locale==='sw'?'Taarifa ulizoingiza mwenyewe; si ushauri wa kitabibu.':'A quick look at what you recorded—not medical assessment or a clinic-confirmed schedule.'}</p></div><span className="mm22-stage"><Baby size={16} aria-hidden="true"/>{stage}</span></div>
  <div className="mm22-smart-grid">{actions.map(({id,Icon,title,detail})=><button className="mm22-smart-action" key={id} type="button" onClick={()=>onNavigate(id)}><span className="mm22-action-icon"><Icon size={21} aria-hidden="true"/></span><span><strong>{title}</strong><small>{detail}</small></span><ArrowUpRight size={17} aria-hidden="true"/></button>)}</div>
  <TodayNextStepV207 journey={journey} done={done} total={total} onNavigate={onNavigate}/>
 </section>;
}