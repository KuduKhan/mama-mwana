import {describe,expect,it} from 'vitest';
import {evaluateReleaseChecks,isReleaseReady} from '../src/lib/releaseSecurity';
import {validateCareDraft} from '../src/lib/carePlanner';
const draft={kind:'question' as const,title:'What should I ask?',detail:'',due_on:null,visit_source_id:null};
describe('v0.8 secure release contracts',()=>{
 it('must fail closed when any mandatory gate is incomplete',()=>{
  const yes={migrationsApplied:true,isolationVerified:true,clinicalApproval:true,privacyApproval:true,backupRestoreVerified:true,productionSmokeVerified:true};
  expect(isReleaseReady(evaluateReleaseChecks({...yes,privacyApproval:false}))).toBe(false);
  expect(isReleaseReady(evaluateReleaseChecks(yes))).toBe(true);
  expect(isReleaseReady([])).toBe(false);
 });
 it('care draft rejects invalid visit associations',()=>{
  expect(validateCareDraft({...draft,visit_source_id:'a-foreign-visit'},[])).toMatch(/already recorded/);
 });
 it('care draft rejects leap-day and other impossible dates',()=>{
  expect(validateCareDraft({...draft,due_on:'2026-02-30'},[])).toMatch(/valid follow-up date/);
  expect(validateCareDraft({...draft,due_on:'2028-02-29'},[])).toBeNull();
 });
});
