import {isDate} from './domain';
import type {Journey, Visit} from './domain';

export type CareItemKind='question'|'preparation'|'follow_up';
export type CareItemState='open'|'done';
export interface CareItem {
 id:string;
 journey_id:string;
 owner_id:string;
 kind:CareItemKind;
 title:string;
 detail:string;
 state:CareItemState;
 due_on:string|null;
 visit_source_id:string|null;
 version:number;
 created_at:string;
 updated_at:string;
}
export const CARE_KINDS:Record<CareItemKind,string>={
 question:'Ask your care team',
 preparation:'Prepare for a visit',
 follow_up:'Follow up after care'
};
export const CARE_SUGGESTIONS:ReadonlyArray<{kind:CareItemKind;title:string}>= [
 {kind:'question',title:'What should I ask at my next clinic visit?'},
 {kind:'preparation',title:'Bring my clinic handbook and previous records'},
 {kind:'follow_up',title:'Review the next steps with my care team'}
];
export interface CareDraft {
 kind:CareItemKind;
 title:string;
 detail:string;
 due_on:string|null;
 visit_source_id:string|null;
}

export function validateCareDraft(d:CareDraft,visits:readonly Visit[]):string|null {
 if(d.title.trim().length<3||d.title.trim().length>160)return 'Use a clear title between 3 and 160 characters.';
 if(d.detail.length>1200)return 'Notes must be 1200 characters or fewer.';
 if(!['question','preparation','follow_up'].includes(d.kind))return 'Select a valid item category.';
 if(d.due_on!==null&&!isDate(d.due_on))return 'Enter a valid follow-up date.';
 if(d.visit_source_id!==null&&!visits.some(v=>v.id===d.visit_source_id))return 'Select an appointment already recorded in this journey.';
 return null;
}
export function orderCareItems(items:readonly CareItem[]):CareItem[] {
 return [...items].sort((a,b)=>
  Number(a.state==='done')-Number(b.state==='done')
  ||(a.due_on??'9999-12-31').localeCompare(b.due_on??'9999-12-31')
  ||b.created_at.localeCompare(a.created_at)
 );
}
export function buildPrivateVisitBrief(
 journey:Pick<Journey,'baby_birth_date'|'visits'>,
 items:readonly CareItem[],
 visitSourceId:string|null,
 dateISO:string
):string{
 const visit=visitSourceId?journey.visits.find(v=>v.id===visitSourceId):undefined;
 const relevant=items.filter(i=>i.state==='open'&&(i.visit_source_id===null||i.visit_source_id===visitSourceId));
 const line=(value:string)=>value.replace(/[\r\n\t]+/g,' ').trim();
 const sorted=orderCareItems(relevant);
 const sections:ReadonlyArray<{title:string;kind:CareItemKind}>=[
  {title:'Questions to discuss',kind:'question'},
  {title:'What I need to prepare',kind:'preparation'},
  {title:'Follow-up actions',kind:'follow_up'}
 ];
 return [
  'MAMAMWANA | PRIVATE VISIT PREPARATION',
  'Generated: '+dateISO,
  'This is a caregiver-written planning note, not an official clinical record.',
  visit?'Planned clinic visit: '+line(visit.clinic)+' | '+visit.scheduled_on:'General appointment preparation (no visit selected)',
  ...sections.flatMap(s=>{
   const rows=sorted.filter(x=>x.kind===s.kind);
   return [s.title+':',...(rows.length?rows.map(x=>'- '+line(x.title)+(x.detail.trim()?' — '+line(x.detail):'')+(x.due_on?' (target '+x.due_on+')':'')):['- No entries yet'])];
  }),
  'Please review dates, medicines and medical advice directly with your healthcare professional.',
  'Keep this file private. Share it only with people you trust.'
 ].join('\n');
}
