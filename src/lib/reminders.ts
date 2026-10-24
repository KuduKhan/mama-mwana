import { addDays, daysBetween, isDate, todayISO } from './domain';
import type { Visit } from './domain';

export type ReminderStatus = 'attended' | 'overdue' | 'today' | 'soon' | 'planned';
export function reminderStatus(v: Visit, now = todayISO()): ReminderStatus {
  if (v.attended) return 'attended';
  const days = daysBetween(now, v.scheduled_on);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 7) return 'soon';
  return 'planned';
}
export function visitReminders(visits: Visit[], now = todayISO()) {
  return visits.filter(v => !v.attended && isDate(v.scheduled_on) && daysBetween(now,v.scheduled_on) <= 7)
    .sort((a,b) => a.scheduled_on.localeCompare(b.scheduled_on));
}
function cleanIcs(value:string) {
  return value.replace(/[\r\n]+/g,' ').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').slice(0,150);
}
/** User-exported all-day calendar event. Confirm visit time with clinic.
 *  Event has a one-day reminder if the calendar supports VALARM.
 *  No patient name or medical notes included.
 */
export function visitCalendarEvent(v: Visit): string {
  if (!isDate(v.scheduled_on)) throw new Error('Invalid visit date');
  const start = v.scheduled_on.replace(/-/g,'');
  const end = addDays(v.scheduled_on,1).replace(/-/g,'');
  const clinic = cleanIcs(v.clinic.trim());
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MamaMwana//Antenatal Visit v0.2//EN',
    'CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+v.id+'@mamamwana.local',
    'DTSTART;VALUE=DATE:'+start,'DTEND;VALUE=DATE:'+end,
    'SUMMARY:Antenatal visit','LOCATION:'+clinic,
    'DESCRIPTION:Confirm your appointment time with your maternity care team.',
    'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:Antenatal appointment reminder',
    'END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
export function visitCalendarUrl(v: Visit) {
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(visitCalendarEvent(v));
}
