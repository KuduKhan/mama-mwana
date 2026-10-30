import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {assessV200Acceptance} from '../scripts/v200-acceptance-core.mjs';
const matrix=JSON.parse(readFileSync('docs/V200_ACCEPTANCE_MATRIX.json','utf8'));
const manifest=JSON.parse(readFileSync('docs/V200_RELEASE_SIGNOFF.json','utf8'));
describe('v2.0 independent acceptance cannot be inferred from CI',()=>{
 it('generates only sanitized fail-closed ten-gate status',()=>{
  const x=assessV200Acceptance(manifest,matrix);
  expect(x.decision).toBe('NO_GO');expect(x.gatesPending).toBe(10);
  expect(x.patientDataAccessAllowed).toBe(false);
  expect(x.independentApprovalVerified).toBe(false);
  expect(x.matrixDigestSha256).toMatch(/^[a-f0-9]{64}$/);
 });
 it('rejects modified approval status or gate inventory',()=>{
  expect(()=>assessV200Acceptance({...manifest,status:'GO'},matrix)).toThrow();
  expect(()=>assessV200Acceptance({...manifest,requiredGates:manifest.requiredGates.slice(1)},matrix)).toThrow();
  expect(()=>assessV200Acceptance(manifest,{...matrix,clinicalLaunchAuthorization:'YES'})).toThrow();
 });
 it('never certifies even completely self-filled review metadata',()=>{
  const filled={...manifest,requiredGates:manifest.requiredGates.map(g=>({...g,status:'approved',reviewer:'claimed reviewer',signedAt:'2026-10-30',evidence:'unverified'}))};
  const x=assessV200Acceptance(filled,matrix);
  expect(x.gatesPending).toBe(0);expect(x.independentApprovalVerified).toBe(false);
  expect(x.decision).toBe('NO_GO');
 });
 it('refuses approval override flags',()=>{
  const x=spawnSync(process.execPath,['scripts/generate-v200-acceptance.mjs','--approve'],{encoding:'utf8'});
  expect(x.status).not.toBe(0);expect(x.stderr).toContain('NO_GO');
 });
});
