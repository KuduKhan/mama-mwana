import {describe,it,expect} from 'vitest';
import {buildExport,DEFAULT_PRIVACY,exportFilename} from '../src/lib/privacy';
import {makeJourney} from '../src/lib/domain';
describe('v0.4 privacy export',()=>{
 it('defaults contextual guidance to off and reminder controls to on',()=>{
  expect(DEFAULT_PRIVACY.guidance_context).toBe(false);
  expect(DEFAULT_PRIVACY.in_app_reminders).toBe(true);
 });
 it('exports all supplied journeys with version and privacy warning',()=>{
  const one=makeJourney('Amina','2027-01-15');
  const two=makeJourney('Halima','2027-03-15');
  const result=buildExport([one,two],DEFAULT_PRIVACY,new Date('2026-10-24T08:00:00Z'));
  expect(result.schema).toBe('v0.4');
  expect(result.journeys).toHaveLength(2);
  expect(result.notice).toMatch(/Sensitive personal/);
  expect(result.exported_at).toBe('2026-10-24T08:00:00.000Z');
 });
 it('names the export unambiguously',()=>expect(exportFilename(new Date('2026-10-24T08:00:00Z'))).toBe('mamamwana-private-export-2026-10-24.json'));
});
