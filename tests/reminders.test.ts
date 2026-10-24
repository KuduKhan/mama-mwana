import { describe, expect, it } from 'vitest';
import type { Visit } from '../src/lib/domain';
import { reminderStatus, visitReminders, visitCalendarEvent, visitCalendarUrl } from '../src/lib/reminders';
const visit = (date:string,attended=false):Visit => ({id:'sample1',scheduled_on:date,clinic:'Maternity clinic',notes:'Private maternal notes',attended});
describe('v0.2 appointment reminders',()=>{
 it('distinguishes overdue, today, near and planned visits',()=>{
  expect(reminderStatus(visit('2026-10-23'),'2026-10-24')).toBe('overdue');
  expect(reminderStatus(visit('2026-10-24'),'2026-10-24')).toBe('today');
  expect(reminderStatus(visit('2026-10-31'),'2026-10-24')).toBe('soon');
  expect(reminderStatus(visit('2026-11-01'),'2026-10-24')).toBe('planned');
  expect(reminderStatus(visit('2026-10-23',true),'2026-10-24')).toBe('attended');
 });
 it('filters attended and non-urgent visits',()=>{
  const visits=visitReminders([visit('2026-10-31'),visit('2026-11-01'),visit('2026-10-23',true)],'2026-10-24');
  expect(visits).toHaveLength(1);
  expect(visits[0].scheduled_on).toBe('2026-10-31');
 });
 it('generates a calendar reminder without private medical notes',()=>{
  const event=visitCalendarEvent(visit('2026-10-24'));
  expect(event).toContain('DTSTART;VALUE=DATE:20261024');
  expect(event).toContain('DTEND;VALUE=DATE:20261025');
  expect(event).toContain('TRIGGER:-P1D');
  expect(event).not.toContain('Private maternal notes');
  expect(visitCalendarUrl(visit('2026-10-24')).startsWith('data:text/calendar')).toBe(true);
 });
});
