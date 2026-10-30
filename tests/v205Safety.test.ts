import {describe,it,expect} from 'vitest';
import {spawnSync} from 'node:child_process';
describe('beta.5 release safety',()=>{
 it('checks preview scope and leaves clinical production disabled',()=>{
  const result=spawnSync(process.execPath,['scripts/check-beta-privacy-safety.mjs'],{encoding:'utf8'});
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('clinical NO-GO');
 });
});