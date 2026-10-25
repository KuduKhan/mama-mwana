import type {Journey} from './domain';
import {isDate,readable,todayISO} from './domain';

export type CareEventKind='visit'|'baby'|'wellbeing';
export type CareEvent={
 id:string;day:string;kind:CareEventKind;title:string;detail:string;
 status:'recorded'|'planned'|'confirm';source:string;
};

/** Read-only projection of existing owner-selected journey data; no new clinical state. */
export function buildCareEvents(journey:Journey,asOf=todayISO()):CareEvent[]{
 const events:CareEvent[]=[];
 const add=(value:CareEvent)=>{if(isDate(value.day))events.push(value);};
 for(const visit of journey.visits){
  const status=visit.attended?'recorded':visit.scheduled_on<asOf?'confirm':'planned';
  add({id:'visit:'+visit.id,day:visit.scheduled_on,kind:'visit',
   title:visit.clinic||'Care visit',
   detail:visit.notes?.trim()||'No additional visit notes',
   status,source:'Personal appointment journal'});
 }
 if(journey.baby_birth_date){
  add({id:'birth:'+journey.id,day:journey.baby_birth_date,kind:'baby',
   title:'Baby arrival recorded',detail:journey.baby_name||'Baby name not recorded',
   status:'recorded',source:'Pregnancy and baby journey'});
 }
 for(const growth of journey.growth){
  const weight=growth.weight_kg==null?'':String(growth.weight_kg)+' kg';
  const length=growth.length_cm==null?'':String(growth.length_cm)+' cm';
  const values=[weight,length].filter(Boolean).join(' · ');
  add({id:'growth:'+growth.id,day:growth.measured_on,kind:'baby',
   title:'Growth measurement',detail:values||'No measurements supplied',
   status:'recorded',source:'Personal growth journal'});
 }
 for(const dose of journey.immunizations??[]){
  add({id:'immunization:'+dose.id,day:dose.given_on,kind:'baby',
   title:'Immunization recorded',detail:dose.dose_id+' · '+(dose.facility?.trim()||'Facility not specified'),
   status:'recorded',source:'Personal immunization record — not a verified vaccination certificate'});
 }
 for(const feed of journey.feeding_logs??[]){
  const label:{[key:string]:string}={breast:'Breastfeeding',expressed:'Expressed milk',formula:'Formula',other:'Mixed or other'};
  add({id:'feeding:'+feed.id,day:feed.recorded_at.slice(0,10),kind:'baby',
   title:'Feeding log',detail:label[feed.method]||'Feeding entry',
   status:'recorded',source:'Personal feeding journal'});
 }
 for(const wellbeing of journey.wellbeing_entries??[]){
  const feeling:{[key:string]:string}={good:'Good',okay:'Okay',tired:'Tired',low:'Low',anxious:'Worried'};
  add({id:'wellbeing:'+wellbeing.id,day:wellbeing.recorded_on,kind:'wellbeing',
   title:'Wellbeing check-in',detail:(feeling[wellbeing.feeling]||'Check-in')+(wellbeing.note?' · '+wellbeing.note:''),
   status:'recorded',source:'Private personal wellbeing notes'});
 }
 return events.sort((a,b)=>b.day.localeCompare(a.day)||a.kind.localeCompare(b.kind)||a.id.localeCompare(b.id));
}

/** Short user-requested excerpt, not a clinical record or a professional handover. */
export function buildVisitBrief(journey:Journey,asOf=todayISO()):string{
 const lines=[
  'MAMAMWANA — PERSONAL VISIT PREPARATION NOTES',
  'Prepared: '+readable(asOf),
  'For the record of: '+journey.mother_name,
  'Estimated due date (user entered): '+readable(journey.due_date)
 ];
 if(journey.baby_birth_date)lines.push('Birth date (user entered): '+readable(journey.baby_birth_date));
 if(journey.baby_name)lines.push('Baby name (user entered): '+journey.baby_name);
 const upcoming=journey.visits.filter(v=>!v.attended&&isDate(v.scheduled_on)&&v.scheduled_on>=asOf).sort((a,b)=>a.scheduled_on.localeCompare(b.scheduled_on));
 lines.push('Upcoming visits in this journal:');
 if(!upcoming.length)lines.push('  No future visit entered');
 for(const visit of upcoming.slice(0,4))lines.push('  '+readable(visit.scheduled_on)+' — '+visit.clinic+' (planned; confirm directly)');
 const recent=journey.visits.filter(v=>v.attended&&isDate(v.scheduled_on)).sort((a,b)=>b.scheduled_on.localeCompare(a.scheduled_on));
 lines.push('Recent visits marked attended:');
 if(!recent.length)lines.push('  No attended visits marked');
 for(const visit of recent.slice(0,3))lines.push('  '+readable(visit.scheduled_on)+' — '+visit.clinic);
 const measurements=journey.growth.filter(g=>isDate(g.measured_on)).sort((a,b)=>b.measured_on.localeCompare(a.measured_on));
 lines.push('Recent growth entries (user-entered, not interpreted):');
 if(!measurements.length)lines.push('  No measurements entered');
 for(const g of measurements.slice(0,3)){
  const values=[g.weight_kg==null?'':String(g.weight_kg)+' kg',g.length_cm==null?'':String(g.length_cm)+' cm'].filter(Boolean).join(' · ');
  lines.push('  '+readable(g.measured_on)+' — '+(values||'No values'));
 }
 lines.push('');
 lines.push('This excerpt may be incomplete or inaccurate. It does NOT include separate child profiles, medicines, allergies, examination results, diagnoses or the full medical history. Check every entry with your healthcare professional. Do not use this note as a clinical certificate.');
 return lines.join('\n');
}
