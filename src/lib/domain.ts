export interface Visit { id: string; scheduled_on: string; clinic: string; notes: string; attended: boolean }
export interface Growth { id: string; measured_on: string; weight_kg: number | null; length_cm: number | null }
export type FeedingMethod = 'breast' | 'expressed' | 'formula' | 'other';
export interface FeedingLog { id: string; recorded_at: string; method: FeedingMethod }
export type Feeling = 'good' | 'okay' | 'tired' | 'low' | 'anxious';
export interface WellbeingEntry { id: string; recorded_on: string; feeling: Feeling; note: string }
export type ChildSex = 'female' | 'male' | 'unknown';
export interface ImmunizationRecord {
 id: string; dose_id: string; given_on: string; facility: string; note: string;
}
export interface Journey {
  id: string; mother_name: string; due_date: string; baby_birth_date: string | null; baby_name: string | null;
  visits: Visit[]; daily_checks: Record<string, string[]>; birth_checks: string[]; growth: Growth[]; milestones: string[];
  feeding_logs: FeedingLog[]; wellbeing_entries: WellbeingEntry[];
  baby_sex?: ChildSex | null; gestation_at_birth_weeks?: number | null;
  immunizations?: ImmunizationRecord[];
}
export const BIRTH_CHECKLIST = [
  { key:'hospital', label:'Choose a health facility and confirm your birth contact' },
  { key:'transport', label:'Arrange transport and an emergency travel option' },
  { key:'bag', label:'Prepare your hospital bag and important documents' },
  { key:'support', label:'Choose a birth companion or trusted support person' },
  { key:'questions', label:'Discuss birth preferences and any concerns with your clinician' },
  { key:'newborn', label:'Plan essential newborn supplies and safe sleeping space' }
];
export function todayISO() { const d=new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); }
export function parseISO(s:string) { return new Date(s+'T12:00:00Z'); }
export function daysBetween(a:string,b:string) { return Math.round((parseISO(b).getTime()-parseISO(a).getTime())/86400000); }
export function addDays(date:string, days:number) { return new Date(parseISO(date).getTime()+days*86400000).toISOString().slice(0,10); }
export function pregnancyStage(dueDate:string, now=todayISO()) {
  const daysLeft=daysBetween(now,dueDate);
  const elapsed=280-daysLeft;
  const week=Math.max(1,Math.min(42,Math.floor(elapsed/7)));
  const trimester=week<=13?1:week<=27?2:3;
  return { week, trimester, daysLeft, progress:Math.max(0,Math.min(100,Math.round(elapsed/280*100))) };
}
export function ageInMonths(birthDate:string, now=todayISO()) {
  const b=parseISO(birthDate), t=parseISO(now);
  const months=(t.getUTCFullYear()-b.getUTCFullYear())*12+(t.getUTCMonth()-b.getUTCMonth());
  return Math.max(0, months-(t.getUTCDate()<b.getUTCDate()?1:0));
}
export function postpartumDay(birthDate:string,now=todayISO()) { return Math.max(0,daysBetween(birthDate,now)); }
export function readable(date:string) {
  if (!date) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-KE',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(parseISO(date));
}
export function makeJourney(mother_name:string,due_date:string):Journey {
 return { id:crypto.randomUUID(),mother_name:mother_name.trim(),due_date,baby_birth_date:null,baby_name:null,visits:[],daily_checks:{},birth_checks:[],growth:[],milestones:[],feeding_logs:[],wellbeing_entries:[],baby_sex:null,gestation_at_birth_weeks:null,immunizations:[] };
}
export function isDate(value:string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseISO(value).getTime()) && parseISO(value).toISOString().slice(0,10)===value; }
export function validateOnboarding(name:string,due:string,now=todayISO()) {
  if(name.trim().length<2||name.trim().length>80)return 'Enter a name between 2 and 80 characters.';
  if(!isDate(due))return 'Choose a valid estimated due date.';
  const distance=daysBetween(now,due);
  if(distance < -35 || distance > 300) return 'Enter a due date within a reasonable pregnancy window. Speak with your clinician if dates are uncertain.';
  return null;
}
export function isValidBirthDate(birth:string,createdDue:string,now=todayISO()){
 return isDate(birth) && daysBetween(birth,now)>=0 && daysBetween(birth,createdDue)<=300 && daysBetween(birth,createdDue)>=-90;
}
export function getPhase(j:Journey,now=todayISO()) {
  if(!j.baby_birth_date)return 'pregnancy' as const;
  return postpartumDay(j.baby_birth_date,now)<=42?'postpartum' as const:'childhood' as const;
}
