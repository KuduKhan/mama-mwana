import {describe,expect,it} from 'vitest';
import {
 fileSafeLocalDate,genericReminderCalendar,isValidCalendarDate,trackerEnabled,
 trackerExport,validateTrackerDraft,type TrackerEntry
} from '../src/lib/personalTracker';

const row:TrackerEntry={
 id:'e65a00a1-033e-4000-a100-3e447f35b001',
 owner_id:'f40f34a7-55d1-4d8d-956d-ff0e92eb5003',
 kind:'reminder',
 title:'Confidential personal note',
 note:'Private details must never enter generic calendars',
 event_date:'2026-11-18',
 completed:false,
 created_at:'2026-11-01T10:00:00Z',
 updated_at:'2026-11-01T10:00:00Z'
};
describe('MamaMwana personal tracker v2.1 contracts',()=>{
 it('fails closed for absent, malformed or false rollout flags',()=>{
  expect(trackerEnabled(undefined)).toBe(false);
  expect(trackerEnabled('false')).toBe(false);
  expect(trackerEnabled('TRUE')).toBe(false);
  expect(trackerEnabled(true)).toBe(false);
  expect(trackerEnabled('true')).toBe(true);
 });
 it('rejects invalid calendar dates and accepts leap day',()=>{
  expect(isValidCalendarDate('2026-02-29')).toBe(false);
  expect(isValidCalendarDate('2028-02-29')).toBe(true);
  expect(isValidCalendarDate('2026-11-31')).toBe(false);
  expect(isValidCalendarDate('2026-11-18')).toBe(true);
  expect(isValidCalendarDate('2026-1-8')).toBe(false);
 });
 it('requires valid user-entered titles and reminder dates',()=>{
  expect(validateTrackerDraft({kind:'reminder',title:' Reminder ',note:'',event_date:null})).toMatch(/date/i);
  expect(validateTrackerDraft({kind:'journal',title:' ',note:'',event_date:null})).toMatch(/title/i);
  expect(validateTrackerDraft({kind:'progress',title:'Progress',note:'',event_date:'2026-02-30'})).toMatch(/date/i);
  expect(validateTrackerDraft({kind:'journal',title:'Journal',note:'',event_date:null})).toBeNull();
  expect(validateTrackerDraft({kind:'reminder',title:'Reminder',note:'',event_date:'2028-02-29'})).toBeNull();
 });
 it('emits date-only generic calendar events without private text or owner data',()=>{
  const ics=genericReminderCalendar(row,new Date('2026-11-10T00:00:00.000Z'));
  expect(ics).toContain('DTSTART;VALUE=DATE:20261118');
  expect(ics).toContain('DTEND;VALUE=DATE:20261119');
  expect(ics).toContain('SUMMARY:MamaMwana personal reminder');
  expect(ics).not.toContain(row.title);
  expect(ics).not.toContain(row.note);
  expect(ics).not.toContain(row.owner_id);
  expect(genericReminderCalendar({...row,event_date:null})).toBeNull();
  expect(genericReminderCalendar({...row,kind:'journal'})).toBeNull();
 });
 it('exports explicitly selected private entries but not internal owner identifiers',()=>{
  const payload=trackerExport([row]);
  expect(payload).toContain(row.title);
  expect(payload).toContain(row.note);
  expect(payload).toContain('not encrypted');
  expect(payload).not.toContain(row.owner_id);
 });
 it('constructs stable user-local dates',()=>{
  expect(fileSafeLocalDate(new Date(2026,10,10))).toBe('2026-11-10');
 });
});
