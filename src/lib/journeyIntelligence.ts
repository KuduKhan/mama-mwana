import type {Journey} from './domain';
import {todayISO} from './domain';
export type NextAction={target:'care'|'visits'|'planner';kind:'checklist'|'visit'|'plan';date?:string};
export function nextJournalAction(journey:Pick<Journey,'visits'>,done:number,total:number,now=todayISO()):NextAction{
 const max=Math.max(0,Number.isFinite(total)?Math.trunc(total):0);
 const complete=Math.max(0,Math.min(max,Number.isFinite(done)?Math.trunc(done):0));
 const visits=journey.visits.filter(v=>!v.attended&&/^\d{4}-\d{2}-\d{2}$/.test(v.scheduled_on)&&v.scheduled_on>=now)
  .sort((a,b)=>a.scheduled_on.localeCompare(b.scheduled_on));
 if(max&&complete<max)return {target:'care',kind:'checklist'};
 if(visits[0])return {target:'visits',kind:'visit',date:visits[0].scheduled_on};
 return {target:'planner',kind:'plan'};
}
