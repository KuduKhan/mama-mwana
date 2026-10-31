import {describe,it,expect} from 'vitest';
import {blankTrackerDraft,normalizeTrackerDraft,validLocalDate,orderedTrackerItems,reminderCalendarEvent,reminderDue,exportTrackerJson} from '../src/lib/personalTracker';
import type {TrackerItem} from '../src/lib/personalTracker';
const entry:TrackerItem={
 id:'11111111-1111-4111-8111-111111111111',owner_id:'22222222-2222-4222-8222-222222222222',
 kind:'reminder',subject:'baby',title:'Private child clinic details',details:'Private test note',
 recorded_on:'2026-10-31',remind_on:'2026-11-04',completed:false,
 value_number:null,value_unit:'',source_kind:'self',
 created_at:'2026-10-31T10:00:00Z',updated_at:'2026-10-31T10:00:00Z'
};
describe('personal tracker non-diagnostic contract',()=>{
 it('rejects impossible dates and invalid calendar rollovers',()=>{
  expect(validLocalDate('2026-02-29')).toBe(false);
  expect(validLocalDate('2028-02-29')).toBe(true);
  expect(validLocalDate('2026-13-01')).toBe(false);
  expect(validLocalDate('2026-10-31')).toBe(true);
 });
 it('allows a personal journal without requiring medical values',()=>{
  const d=blankTrackerDraft('journal');
  expect(normalizeTrackerDraft({...d,title:'Family milestones',recorded_on:'2026-10-31'}))
   .toMatchObject({kind:'journal',value_number:null,remind_on:null});
 });
 it('rejects empty, excessive and malformed data before save',()=>{
  const d=blankTrackerDraft('progress');
  expect(()=>normalizeTrackerDraft({...d,title:'',recorded_on:'2026-10-31'})).toThrow();
  expect(()=>normalizeTrackerDraft({...d,title:'A',details:'x'.repeat(2001),recorded_on:'2026-10-31'})).toThrow();
  expect(()=>normalizeTrackerDraft({...d,title:'A',recorded_on:'2026-10-31',value_number:'6.4',value_unit:''})).toThrow();
  expect(()=>normalizeTrackerDraft({...d,title:'A',recorded_on:'2026-10-31',value_number:'-1',value_unit:'kg'})).toThrow();
 });
 it('stores raw progress values without diagnostics or health classifications',()=>{
  const d=blankTrackerDraft('progress');
  const p=normalizeTrackerDraft({...d,subject:'baby',title:'Weight logged',recorded_on:'2026-10-31',value_number:'6.2',value_unit:'kg',source_kind:'provider_supplied'});
  expect(p).toMatchObject({value_number:6.2,value_unit:'kg',source_kind:'provider_supplied'});
  expect(JSON.stringify(p)).not.toMatch(/diagnos|normal_range|underweight|risk_level/);
 });
 it('requires an actual date for every reminder',()=>{
  const d=blankTrackerDraft('reminder');
  expect(()=>normalizeTrackerDraft({...d,title:'Appointment',recorded_on:'2026-10-31'})).toThrow();
  expect(normalizeTrackerDraft({...d,title:'Appointment',recorded_on:'2026-10-31',remind_on:'2026-11-05'}).remind_on).toBe('2026-11-05');
 });
 it('reminders are local in-app due indicators, not remote notifications',()=>{
  expect(reminderDue(entry,'2026-11-04')).toBe(true);
  expect(reminderDue(entry,'2026-11-02')).toBe(false);
  expect(reminderDue({...entry,completed:true},'2026-11-04')).toBe(false);
 });
 it('calendar exports never leak the private title, content, subject or measurements',()=>{
  const c=reminderCalendarEvent(entry);
  expect(c).toContain('SUMMARY:MamaMwana reminder');
  expect(c).not.toContain(entry.title);
  expect(c).not.toContain(entry.details);
  expect(c).not.toContain('baby');
  expect(c).toContain('DTSTART;VALUE=DATE:20261104');
  expect(c).toContain('DTEND;VALUE=DATE:20261105');
 });
 it('sorts due open reminders ahead of other progress entries',()=>{
  const progress={...entry,id:'other',kind:'progress' as const,remind_on:null};
  expect(orderedTrackerItems([progress,entry])[0].id).toBe(entry.id);
 });
 it('labels exported data as private and not a certified medical record',()=>{
  const bundle=exportTrackerJson([entry]);
  expect(bundle).toContain('Not a certified medical record');
  expect(JSON.parse(bundle).items).toHaveLength(1);
 });
});
