import type {SupabaseClient} from '@supabase/supabase-js';
import type {Journey} from './domain';
import type {PrivacyChoices} from './privacy';
const TABLES=['family_children','family_growth_entries','family_vaccine_entries','care_plan_items','family_record_events','care_plan_events','clinical_record_events','data_rights_requests'] as const;
type Table=typeof TABLES[number];
export type PrivateExportRows=Record<Table,Record<string,unknown>[]>;
export function emptyPrivateExportRows():PrivateExportRows{
 return Object.fromEntries(TABLES.map(t=>[t,[]])) as PrivateExportRows;
}
/** Export all owned records, with pagination and failure-atomic behavior. */
export async function fetchPrivateExportRows(client:SupabaseClient,userId:string):Promise<PrivateExportRows>{
 if(!userId)throw new Error('A signed-in account is required.');
 const result=await Promise.all(TABLES.map(async table=>{
  const rows:Record<string,unknown>[]=[];
  for(let offset=0;offset<100000;offset+=200){
   const {data,error}=await client.from(table).select('*').eq('owner_id',userId).order('id',{ascending:true}).range(offset,offset+199);
   if(error)throw new Error('Private export incomplete: '+table+'. No partial file was created.');
   rows.push(...(data??[]));
   if((data??[]).length<200)return [table,rows] as const;
  }
  throw new Error('Record export exceeds the current paging limit.');
 }));
 return Object.fromEntries(result) as PrivateExportRows;
}
export function buildCompleteExport(journeys:readonly Journey[],privacy:PrivacyChoices,rows:PrivateExportRows,now=new Date()){
 return {
  product:'MamaMwana' as const,schema:'v1.0-rc' as const,exported_at:now.toISOString(),
  notice:'SENSITIVE MATERNAL/CHILD INFORMATION. This unencrypted JSON is not a certified medical record. Store and share privately.',
  privacy_preferences:{...privacy},
  journeys:journeys.map(j=>({...j,visits:[...j.visits],growth:[...j.growth],immunizations:[...(j.immunizations??[])]})),
  child_profiles:rows.family_children,
  child_growth:rows.family_growth_entries,
  child_vaccinations:rows.family_vaccine_entries,
  care_planner:rows.care_plan_items,
  change_history:{family:rows.family_record_events,care_plan:rows.care_plan_events,clinical:rows.clinical_record_events},
  data_rights_requests:rows.data_rights_requests
 };
}
