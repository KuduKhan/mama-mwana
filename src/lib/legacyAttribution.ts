import type {Journey} from './domain';
export type LegacyKind='growth'|'immunization';
export interface LegacyAssignment{
 journey_id:string;owner_id:string;kind:LegacyKind;source_id:string;child_id:string;confirmed_by:string;confirmed_at:string;version:number
}
export interface LegacyEntry{kind:LegacyKind;sourceId:string;date:string;label:string}
export function legacyEntries(j:Pick<Journey,'growth'|'immunizations'>):LegacyEntry[]{
 return [
  ...j.growth.map(v=>({kind:'growth' as const,sourceId:v.id,date:v.measured_on,label:(v.weight_kg??'—')+' kg · '+(v.length_cm??'—')+' cm'})),
  ...(j.immunizations??[]).map(v=>({kind:'immunization' as const,sourceId:v.id,date:v.given_on,label:v.dose_id}))
 ];
}
export function findLegacyAssignment(links:readonly LegacyAssignment[],kind:LegacyKind,sourceId:string):LegacyAssignment|undefined{
 return links.find(v=>v.kind===kind&&v.source_id===sourceId);
}
