import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
describe('v2.0.0 production NO-GO readiness',()=>{
 const gate=JSON.parse(readFileSync(join(process.cwd(),'docs/V200_RELEASE_SIGNOFF.json'),'utf8'));
 it('preserves explicit NO-GO and ten independent gates',()=>{
  expect(gate.status).toBe('NO_GO');expect(gate.productionClinicalAccess).toBe(false);
  expect(gate.requiredGates).toHaveLength(10);
  expect(new Set(gate.requiredGates.map((x:{id:string})=>x.id)).size).toBe(10);
  expect(gate.requiredGates.every((x:{status:string;evidence:null;reviewer:null;signedAt:null})=>x.status==='pending'&&x.evidence===null&&x.reviewer===null&&x.signedAt===null)).toBe(true);
 });
 it('keeps the source-enforced production clinical build guard unchanged',()=>{
  const vite=readFileSync(join(process.cwd(),'vite.config.ts'),'utf8');
  expect(vite).toContain('assertClinicalReleaseBoundary');
  const boundary=readFileSync(join(process.cwd(),'scripts/clinical-release-boundary.mjs'),'utf8');
  expect(boundary).toContain('VITE_AUTH_ACCESS_ENABLED');
 });
});
