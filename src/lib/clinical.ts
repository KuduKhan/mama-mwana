import type {SupabaseClient} from '@supabase/supabase-js';
import type {Growth,ImmunizationRecord,Journey,Visit} from './domain';

export type ClinicalKind='visit'|'growth'|'immunization';
export type ClinicalEntry=Visit|Growth|ImmunizationRecord;
export type ClinicalVersioned=ClinicalEntry&{version?:number};
export interface Mutation {kind:ClinicalKind;journeyId:string;entry:ClinicalVersioned;remove?:boolean}

interface RowBase {journey_id:string;source_id:string;version:number}
interface VisitRow extends RowBase {scheduled_on:string;clinic:string;notes:string;attended:boolean}
interface GrowthRow extends RowBase {measured_on:string;weight_kg:number|null;length_cm:number|null}
interface ImmunizationRow extends RowBase {dose_id:string;given_on:string;facility:string;note:string}

export function isClinicalConflict(error:unknown){
 const message=error instanceof Error?error.message:String(error??'');
 return message.includes('MM_CONFLICT');
}
export function mapRow(kind:'visit',r:VisitRow):Visit&{version:number};
export function mapRow(kind:'growth',r:GrowthRow):Growth&{version:number};
export function mapRow(kind:'immunization',r:ImmunizationRow):ImmunizationRecord&{version:number};
export function mapRow(kind:ClinicalKind,r:VisitRow|GrowthRow|ImmunizationRow):ClinicalVersioned;
export function mapRow(kind:ClinicalKind,r:VisitRow|GrowthRow|ImmunizationRow):ClinicalVersioned {
 if(kind==='visit'){const v=r as VisitRow;return {id:v.source_id,version:v.version,scheduled_on:v.scheduled_on,clinic:v.clinic,notes:v.notes,attended:v.attended};}
 if(kind==='growth'){const v=r as GrowthRow;return {id:v.source_id,version:v.version,measured_on:v.measured_on,weight_kg:v.weight_kg,length_cm:v.length_cm};}
 const v=r as ImmunizationRow;
 return {id:v.source_id,version:v.version,dose_id:v.dose_id,given_on:v.given_on,facility:v.facility,note:v.note};
}
export function editJourneyClinical(journey:Journey,kind:ClinicalKind,entry:ClinicalVersioned,remove=false):Journey {
 const field=kind==='visit'?'visits':kind==='growth'?'growth':'immunizations';
 const current=(journey[field]??[]) as ClinicalVersioned[];
 const items=remove?current.filter(v=>v.id!==entry.id):[...current.filter(v=>v.id!==entry.id),entry];
 if(kind==='visit')return {...journey,visits:(items as Visit[]).sort((a,b)=>b.scheduled_on.localeCompare(a.scheduled_on))};
 if(kind==='growth')return {...journey,growth:(items as Growth[]).sort((a,b)=>b.measured_on.localeCompare(a.measured_on))};
 return {...journey,immunizations:(items as ImmunizationRecord[]).sort((a,b)=>b.given_on.localeCompare(a.given_on))};
}
export function hydrateCanonicalJourneys(journeys:readonly Journey[],visits:readonly VisitRow[],growth:readonly GrowthRow[],immunizations:readonly ImmunizationRow[]):Journey[]{
 // Normalized records override historical JSONB snapshots. Never union them:
 // doing so could resurrect deleted vaccinations or outdated measurements.
 return journeys.map(j=>({...j,
  visits:visits.filter(r=>r.journey_id===j.id).map(r=>mapRow('visit',r)),
  growth:growth.filter(r=>r.journey_id===j.id).map(r=>mapRow('growth',r)),
  immunizations:immunizations.filter(r=>r.journey_id===j.id).map(r=>mapRow('immunization',r))
 }));
}
export async function loadCanonicalJourneys(client:SupabaseClient,journeys:Journey[]):Promise<Journey[]> {
 if(!journeys.length)return [];
 const ids=journeys.map(j=>j.id);
 const [v,g,i]=await Promise.all([
  client.from('journey_visits').select('journey_id,source_id,version,scheduled_on,clinic,notes,attended').in('journey_id',ids),
  client.from('child_measurements').select('journey_id,source_id,version,measured_on,weight_kg,length_cm').in('journey_id',ids),
  client.from('child_immunizations').select('journey_id,source_id,version,dose_id,given_on,facility,note').in('journey_id',ids)
 ]);
 if(v.error||g.error||i.error)throw new Error('Canonical clinical records unavailable. Confirm the v0.6 migration and account permissions.');
 return hydrateCanonicalJourneys(journeys,(v.data??[]) as VisitRow[],(g.data??[]) as GrowthRow[],(i.data??[]) as ImmunizationRow[]);
}
export async function applyClinicalMutation(client:SupabaseClient,{kind,journeyId,entry,remove=false}:Mutation):Promise<ClinicalVersioned|null>{
 const version=entry.version??0;
 const payload={...entry};
 const {data,error}=await client.rpc('apply_clinical_change',{
  p_journey_id:journeyId,p_kind:kind,p_source_id:entry.id,
  p_expected_version:version,p_payload:payload,p_delete:remove
 });
 if(error)throw new Error(error.message);
 if(remove)return null;
 if(!data||typeof data!=='object'||!('version' in data))throw new Error('Clinical save response was incomplete.');
 return mapRow(kind,data as VisitRow|GrowthRow|ImmunizationRow);
}
/** Non-clinical journey edits must never overwrite canonical clinical records.
 *  Inserted journeys use database defaults for visits/growth/immunizations.
 */
export function nonClinicalJourneyPayload(j:Journey,owner_id:string){
 const {visits:ignoredVisits,growth:ignoredGrowth,immunizations:ignoredImmunizations,...profile}=j;
 void ignoredVisits;void ignoredGrowth;void ignoredImmunizations;
 return {...profile,owner_id};
}
