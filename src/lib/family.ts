import {daysBetween,isDate,todayISO} from './domain';
export type FamilySex='unknown'|'female'|'male';
export interface FamilyChild{id:string;journey_id:string;owner_id:string;birth_order:number;display_name:string;born_on:string;sex:FamilySex;version:number}
export interface FamilyGrowth{id:string;child_id:string;owner_id:string;measured_on:string;weight_kg:number|null;length_cm:number|null}
export interface FamilyVaccine{id:string;child_id:string;owner_id:string;vaccine_label:string;given_on:string;facility:string}
export function validateChildDraft(name:string,born:string,due:string):string|null{
 if(name.trim().length<1||name.trim().length>80)return 'Child name must be 1–80 characters.';
 if(!isDate(born)||!isDate(due)||daysBetween(born,due)>300||daysBetween(born,due)<-90||daysBetween(born,todayISO())<0)return 'Choose a valid recorded birth date for this pregnancy.';
 return null;
}
export function validateGrowthDraft(date:string,birth:string,weight:number|null,length:number|null):string|null{
 if(!isDate(date)||daysBetween(birth,date)<0||daysBetween(date,todayISO())<0)return 'Measurement date must be after birth and no later than today.';
 if(weight===null&&length===null)return 'Enter a weight or length.';
 if(weight!==null&&(!Number.isFinite(weight)||weight<0.1||weight>70))return 'Weight must be between 0.1 and 70 kg.';
 if(length!==null&&(!Number.isFinite(length)||length<20||length>180))return 'Length must be between 20 and 180 cm.';
 return null;
}
export function validateVaccineDraft(label:string,date:string,birth:string):string|null{
 if(label.trim().length<3||label.trim().length>100)return 'Enter the exact recorded vaccine label.';
 if(!isDate(date)||daysBetween(birth,date)<0||daysBetween(date,todayISO())<0)return 'Administration date must be after birth and no later than today.';
 return null;
}
export function nextBirthOrder(rows:readonly FamilyChild[]):number{return rows.reduce((m,r)=>Math.max(m,r.birth_order),0)+1;}
export function groupFamilyRecords<T extends {child_id:string}>(children:readonly FamilyChild[],rows:readonly T[]):Record<string,T[]>{
 return Object.fromEntries(children.map(c=>[c.id,rows.filter(r=>r.child_id===c.id)]));
}
