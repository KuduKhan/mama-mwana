import {daysBetween,isDate,todayISO} from './domain';
import type {Visit} from './domain';

export type VisitNoticeKind='overdue'|'today'|'upcoming';
export type VisitNotice={id:string;kind:VisitNoticeKind;day:string;route:'visits'};

/** Computed in memory from the current private journey; no push, persistence or PHI in OS notifications. */
export function buildVisitNotices(visits:readonly Visit[],enabled:boolean,now=todayISO()):VisitNotice[]{
 if(!enabled)return [];
 return visits.filter(v=>!v.attended&&isDate(v.scheduled_on))
  .map(v=>({visit:v,offset:daysBetween(now,v.scheduled_on)}))
  .filter(v=>v.offset<=7)
  .sort((a,b)=>a.visit.scheduled_on.localeCompare(b.visit.scheduled_on))
  .slice(0,6).map(({visit,offset})=>({
   id:visit.id,day:visit.scheduled_on,route:'visits' as const,
   kind:offset<0?'overdue' as const:offset===0?'today' as const:'upcoming' as const
  }));
}
