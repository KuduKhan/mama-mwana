import {describe,it,expect} from 'vitest';
import {safeFamilyDigest,demoVisitKit,DEMO_VISIT_QUESTIONS} from '../src/components/FamilyIntelligenceV203';
import {makeJourney} from '../src/lib/domain';
describe('beta.3 family timeline and personal visit kit',()=>{
 it('returns safe, chronological generic labels excluding private notes',()=>{
  const j=makeJourney('Sample Parent','2027-03-01');
  j.visits=[{id:'test',scheduled_on:'2026-11-01',clinic:'confidential facility',notes:'SECRET TEST NOTE',attended:false}];
  const rows=safeFamilyDigest([j]);
  expect(rows).toHaveLength(1);
  expect(rows[0].label).toBe('Visit journal entry');
  expect(JSON.stringify(rows)).not.toContain('SECRET TEST NOTE');
  expect(rows[0].journeyId).toBe(j.id);
  // The public event projection has no pointer to notes or personal data fields.
 });
 it('exports only selected generic questions',()=>{
  const output=demoVisitKit([0,0,2,99,-1],'2026-10-30');
  expect(output).toContain(DEMO_VISIT_QUESTIONS[0]);
  expect(output).toContain(DEMO_VISIT_QUESTIONS[2]);
  expect(output).not.toContain(DEMO_VISIT_QUESTIONS[1]);
  expect(output.match(/What should I prepare/g)?.length).toBe(1);
 });
});
