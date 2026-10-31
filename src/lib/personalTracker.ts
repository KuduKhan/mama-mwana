/** Account-owned personal tracking only. No diagnostic scores or clinical inference.
 * Data is never placed in localStorage, analytics, URL query parameters, push
 * notifications or third-party APIs. The auth session may be browser-persisted.
 */
export type TrackerKind='journal'|'progress'|'reminder';
export type TrackerSubject='mother'|'baby'|'family';
export type TrackerSource='self'|'provider_supplied';
export type TrackerItem={
 id:string;owner_id:string;kind:TrackerKind;subject:TrackerSubject;
 title:string;details:string;recorded_on:string;
 value_number:number|null;value_unit:string;remind_on:string|null;
 completed:boolean;source_kind:TrackerSource;created_at:string;updated_at:string;
};
export type TrackerDraft={
 kind:TrackerKind;subject:TrackerSubject;title:string;details:string;
 recorded_on:string;value_number:string;value_unit:string;remind_on:string;
 source_kind:TrackerSource;
};
export function localToday(){
 const d=new Date();
 const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
 return y+'-'+m+'-'+day;
}
export function validLocalDate(s:string):boolean{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+'T12:00:00Z');
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;
}
export function blankTrackerDraft(kind:TrackerKind='journal'):TrackerDraft{
 return {kind,subject:'family',title:'',details:'',recorded_on:localToday(),
  value_number:'',value_unit:'',remind_on:'',source_kind:'self'};
}
export function normalizeTrackerDraft(d:TrackerDraft){
 if(!['journal','progress','reminder'].includes(d.kind))throw new Error('Select an entry type.');
 if(!['mother','baby','family'].includes(d.subject))throw new Error('Select the person or family.');
 if(!['self','provider_supplied'].includes(d.source_kind))throw new Error('Choose where this information came from.');
 const title=d.title.trim(),details=d.details.trim();
 if(!title||title.length>120)throw new Error('Enter a title (up to 120 characters).');
 if(details.length>2000)throw new Error('Details must be no longer than 2,000 characters.');
 if(!validLocalDate(d.recorded_on))throw new Error('Enter a valid record date.');
 let value_number:number|null=null,value_unit='';
 if(d.kind==='progress'){
  if(d.value_number.trim()){
   value_number=Number(d.value_number);
   value_unit=d.value_unit.trim();
   if(!Number.isFinite(value_number)||value_number<0||value_number>100000
    ||!value_unit||value_unit.length>24)throw new Error('Use a nonnegative number and a short unit.');
  }else if(d.value_unit.trim())throw new Error('Add a number or clear the unit.');
 }
 const remind_on=d.kind==='reminder'?d.remind_on:null;
 if(d.kind==='reminder'&&(!remind_on||!validLocalDate(remind_on)))
  throw new Error('Choose a valid reminder date.');
 return {kind:d.kind,subject:d.subject,title,details,recorded_on:d.recorded_on,
  value_number,value_unit,remind_on,source_kind:d.source_kind};
}
export function orderedTrackerItems(items:readonly TrackerItem[]):TrackerItem[]{
 return [...items].sort((a,b)=>{
  const aa=a.kind==='reminder'&&a.remind_on?a.remind_on:a.recorded_on;
  const bb=b.kind==='reminder'&&b.remind_on?b.remind_on:b.recorded_on;
  return (a.kind==='reminder'&&!a.completed?0:1)-(b.kind==='reminder'&&!b.completed?0:1)
   ||(a.kind==='reminder'&&!a.completed?aa.localeCompare(bb):bb.localeCompare(aa))
   ||b.created_at.localeCompare(a.created_at);
 });
}
export function reminderDue(item:TrackerItem,today=localToday()){
 return item.kind==='reminder'&&!item.completed&&Boolean(item.remind_on)&&item.remind_on!<=today;
}
function escapeCalendarText(s:string):string{
 return s.replace(/[\r\n]+/g,' ').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').slice(0,160);
}
/** Deliberately generic: never disclose journal contents, names, measurements or care notes to calendars. */
export function reminderCalendarEvent(item:TrackerItem):string{
 if(item.kind!=='reminder'||!item.remind_on||!validLocalDate(item.remind_on))throw new Error('Invalid reminder.');
 const next=new Date(item.remind_on+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);
 const date=item.remind_on.replace(/-/g,'');
 const end=next.toISOString().slice(0,10).replace(/-/g,'');
 const safeID=item.id.replace(/[^A-Za-z0-9-]/g,'').slice(0,48);
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MamaMwana//Personal Tracker//EN',
  'CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+escapeCalendarText(safeID)+'@mamamwana.local',
  'DTSTART;VALUE=DATE:'+date,'DTEND;VALUE=DATE:'+end,
  'SUMMARY:MamaMwana reminder','DESCRIPTION:Open your private MamaMwana account to see this reminder.',
  'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:Open MamaMwana to review your reminder.',
  'END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
export function exportTrackerJson(items:readonly TrackerItem[]):string{
 return JSON.stringify({product:'MamaMwana',schema:'personal-tracker-v1',
  notice:'Private family information. Protect this downloaded file. Not a certified medical record.',
  exported_at:new Date().toISOString(),items},null,2);
}
