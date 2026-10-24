import type { Journey } from './domain';
export interface PrivacyChoices {
 in_app_reminders:boolean;
 guidance_context:boolean;
}
export const DEFAULT_PRIVACY:PrivacyChoices={in_app_reminders:true,guidance_context:false};
export interface ExportBundle {
 product:'MamaMwana';
 schema:'v0.4';
 exported_at:string;
 notice:string;
 privacy_preferences:PrivacyChoices;
 journeys:Journey[];
}
/** The caller must fetch their own latest authenticated rows first.
 *  Keep sensitive data on-device; never POST this bundle to a third party.
 */
export function buildExport(journeys:readonly Journey[],choices:PrivacyChoices,now=new Date()):ExportBundle{
 return {
  product:'MamaMwana',schema:'v0.4',exported_at:now.toISOString(),
  notice:'Sensitive personal maternal and child data. Store securely. This is not a certified medical record.',
  privacy_preferences:{...choices},
  journeys:journeys.map(j=>({...j,visits:[...j.visits],growth:[...j.growth],immunizations:[...(j.immunizations??[])]}))
 };
}
export function exportFilename(now=new Date()){
 const d=now.toISOString().slice(0,10);
 return 'mamamwana-private-export-'+d+'.json';
}
