import {describe,it,expect} from 'vitest';
import {normalizeDisplay} from '../src/lib/a11yPreferences';
import {readFileSync} from 'node:fs';
describe('beta.2 premium display and navigation',()=>{
 it('normalizes theme with safe legacy defaults',()=>{
  expect(normalizeDisplay({theme:'dark'}).theme).toBe('dark');
  expect(normalizeDisplay({theme:'light'}).theme).toBe('light');
  expect(normalizeDisplay({theme:'corrupt'}).theme).toBe('system');
 });
 it('maintains a clinical NO-GO release boundary',()=>{
  const manifest=JSON.parse(readFileSync('docs/V200_RELEASE_SIGNOFF.json','utf8'));
  expect(manifest.productionClinicalAccess).toBe(false);
  expect(manifest.status).toBe('NO_GO');
 });
});
