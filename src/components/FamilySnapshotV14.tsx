import {Baby,CalendarDays,Heart,Users} from 'lucide-react';
import type {Journey} from '../lib/domain';
import {readable,todayISO} from '../lib/domain';
import {useMamaLocale} from '../lib/locale';
export default function FamilySnapshotV14({journeys,activeId,onSelect}:{journeys:Journey[];activeId:string;onSelect:(journey:Journey)=>void}){
 const {t}=useMamaLocale();
 const now=todayISO();
 return <section className="mm14-family-summary" aria-labelledby="mm14-family-summary-title">
  <div className="mm14-family-heading"><span className="mm14-family-icon"><Users size={21} aria-hidden="true"/></span><div>
   <h3 id="mm14-family-summary-title">{t('family.snapshot','Your family at a glance')}</h3>
   <p>{t('family.scope','Only journeys in your current account. Select one to open its private care space.')}</p>
  </div></div>
  <div className="mm14-family-grid">
   {journeys.map(item=>{
    const born=Boolean(item.baby_birth_date);
    const upcoming=item.visits.filter(v=>!v.attended&&v.scheduled_on>=now).length;
    const selected=item.id===activeId;
    return <button key={item.id} type="button" className={'mm14-family-card '+(selected?'selected':'')} aria-pressed={selected} onClick={()=>onSelect(item)}>
     <span className="mm14-family-card-icon">{born?<Baby size={18} aria-hidden="true"/>:<Heart size={18} aria-hidden="true"/>}</span>
     <span className="mm14-family-card-body"><strong>{born?(item.baby_name||t('family.baby','Baby')):t('family.pregnancy','Pregnancy journey')}</strong>
      <small>{born?t('family.birthDate','Birth date'):t('family.dueDate','Estimated due date')}: {readable(born?item.baby_birth_date!:item.due_date)}</small>
      <span className="mm14-family-foot"><CalendarDays size={13} aria-hidden="true"/>{upcoming} {t('family.upcoming','planned visit(s)')}</span>
     </span>
     <span className="mm14-family-status">{selected?t('family.current','Current'):t('family.switch','Open')}</span>
    </button>;
   })}
  </div>
  <p className="mm14-family-disclaimer">{t('family.disclaimer','Counts are based on your own journal entries, not verified clinic records.')}</p>
 </section>;
}
