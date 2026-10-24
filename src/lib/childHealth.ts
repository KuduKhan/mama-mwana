import { addDays, daysBetween, isDate, todayISO } from './domain';
import type { Growth, ImmunizationRecord, ChildSex } from './domain';

export interface VaccineDose {
 id:string; title:string; dose:string; atDays?:number; atMonths?:number; note?:string;
}
export const KENYA_IMMUNIZATIONS: readonly VaccineDose[] = [
 {id:'bcg',title:'BCG',dose:'Birth',atDays:0},
 {id:'opv0',title:'Oral polio (OPV)',dose:'Birth dose',atDays:0},
 {id:'opv1',title:'Oral polio (OPV)',dose:'Dose 1',atDays:42},
 {id:'penta1',title:'Pentavalent (DPT-HepB-Hib)',dose:'Dose 1',atDays:42},
 {id:'pcv1',title:'Pneumococcal (PCV)',dose:'Dose 1',atDays:42},
 {id:'rota1',title:'Rotavirus',dose:'Dose 1',atDays:42},
 {id:'opv2',title:'Oral polio (OPV)',dose:'Dose 2',atDays:70},
 {id:'penta2',title:'Pentavalent (DPT-HepB-Hib)',dose:'Dose 2',atDays:70},
 {id:'pcv2',title:'Pneumococcal (PCV)',dose:'Dose 2',atDays:70},
 {id:'rota2',title:'Rotavirus',dose:'Dose 2',atDays:70},
 {id:'opv3',title:'Oral polio (OPV)',dose:'Dose 3',atDays:98},
 {id:'penta3',title:'Pentavalent (DPT-HepB-Hib)',dose:'Dose 3',atDays:98},
 {id:'pcv3',title:'Pneumococcal (PCV)',dose:'Dose 3',atDays:98},
 {id:'ipv',title:'Inactivated polio (IPV)',dose:'Routine dose',atDays:98},
 {id:'mr1',title:'Measles-Rubella (MR)',dose:'Dose 1',atMonths:9},
 {id:'mr2',title:'Measles-Rubella (MR)',dose:'Dose 2',atMonths:18},
];
export const CLINICAL_REFERENCES={
 kenya:'https://health.go.ke/sites/default/files/2025-04/Clinical%20Guidelines%20for%20Level%201%20Community%20Health%20Services.pdf',
 whoWeight:'https://www.who.int/tools/child-growth-standards/standards/weight-for-age',
 whoLength:'https://www.who.int/tools/child-growth-standards/standards/length-height-for-age',
 whoIntroduction:'https://www.who.int/tools/child-growth-standards',
 whoFeeding:'https://www.who.int/health-topics/breastfeeding',
 whoPostnatal:'https://www.who.int/publications/i/item/9789240045989'
} as const;
export const WHO_REFERENCE_CHARTS={
 female:{
  weight:'https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-age/cht-wfa-girls-p-0-5.pdf?sfvrsn=d4a8e3bc_12',
  length:'https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/length-height-for-age/cht-lhfa-girls-z-0-5.pdf?sfvrsn=252d03a5_14'
 },
 male:{
  weight:'https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-age/cht-wfa-boys-p-0-5.pdf?sfvrsn=7a899731_12',
  length:'https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/length-height-for-age/cht-lhfa-boys-z-0-5.pdf?sfvrsn=a839cd27_10'
 }
} as const;
export function dateAtMonths(birthDate:string,months:number):string {
 if(!isDate(birthDate)||!Number.isInteger(months)||months<0||months>120)throw new Error('Invalid date or months');
 const base=new Date(birthDate+'T12:00:00Z'),first=new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth()+months,1,12));
 const day=Math.min(base.getUTCDate(),new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0,12)).getUTCDate());
 first.setUTCDate(day);return first.toISOString().slice(0,10);
}
export function referenceDate(birthDate:string,dose:VaccineDose){
 return dose.atDays!==undefined?addDays(birthDate,dose.atDays):dateAtMonths(birthDate,dose.atMonths??0);
}
export function referenceStage(birthDate:string,dose:VaccineDose,recorded:readonly ImmunizationRecord[],now=todayISO()){
 if(recorded.some(r=>r.dose_id===dose.id))return 'recorded' as const;
 const age=daysBetween(referenceDate(birthDate,dose),now);
 if(age<0)return 'later' as const;
 return 'ask-clinic' as const;
}
export function validateImmunization(date:string,birthDate:string,facility:string,now=todayISO()):string|null{
 if(!isDate(date)||daysBetween(birthDate,date)<0||daysBetween(date,now)<0)return 'Choose a valid administration date from birth through today.';
 if(facility.trim().length>100)return 'Facility name must be 100 characters or fewer.';
 return null;
}
export function recordImmunization(records:readonly ImmunizationRecord[],entry:ImmunizationRecord){
 return [...records.filter(r=>r.dose_id!==entry.dose_id),entry].sort((a,b)=>b.given_on.localeCompare(a.given_on));
}
export type GrowthMetric='weight'|'length';
export interface TrendPoint {x:number;y:number;date:string}
export function growthTrend(records:readonly Growth[],birthDate:string,metric:GrowthMetric):TrendPoint[]{
 const key=metric==='weight'?'weight_kg':'length_cm';
 return records.filter(r=>isDate(r.measured_on)&&daysBetween(birthDate,r.measured_on)>=0&&typeof r[key]==='number'&&Number.isFinite(r[key])&&r[key]!==null&&(r[key] as number)>0)
  .map(r=>({x:daysBetween(birthDate,r.measured_on),y:r[key] as number,date:r.measured_on})).sort((a,b)=>a.x-b.x);
}
export function referenceForSex(sex:ChildSex|null|undefined){
 if(sex==='female'||sex==='male')return WHO_REFERENCE_CHARTS[sex];
 return null;
}
