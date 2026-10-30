import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
describe('beta.10 privacy and experience release contract',()=>{
 it('keeps independent clinical approval pending and experience checks green',()=>{
  const r=spawnSync(process.execPath,['scripts/check-v2-experience.mjs'],{encoding:'utf8'});
  expect(r.status,r.stderr).toBe(0);expect(r.stdout).toContain('NO_GO');
 });
 it('only caches the public education allowlist',()=>{
  const sw=readFileSync('public/demo-offline-sw.js','utf8');
  expect(sw).toContain('mamamwana-public-demo-v2.0.0-beta.10');
  expect(sw).toContain("'/learning/mamamwana-learning-essentials-v209.txt'");
 });
});
