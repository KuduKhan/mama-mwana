import {describe,it,expect} from 'vitest';
import {prefersLowData} from '../src/lib/lowDataDisplay';
import {readFileSync} from 'node:fs';
describe('beta.12 low-bandwidth presentation policy',()=>{
 it('does not infer personal information and honors explicit data saving',()=>{
  expect(prefersLowData({saveData:true})).toBe(true);
  expect(prefersLowData({effectiveType:'2g'})).toBe(true);
  expect(prefersLowData({effectiveType:'slow-2g'})).toBe(true);
  expect(prefersLowData({effectiveType:'4g'})).toBe(false);
  expect(prefersLowData(null)).toBe(false);
 });
 it('keeps public learning separate from optional private clinical record storage',()=>{
  const code=readFileSync('src/lib/lowDataDisplay.ts','utf8');
  expect(code).not.toMatch(/fetch\(|localStorage|indexedDB|supabase|auth\.users/i);
  const app=readFileSync('src/App.tsx','utf8');
  expect(app).toContain("import('./components/FamilyExperienceV208')");
  expect(app).toContain("import('./components/FamilyIntelligenceV203')");
 });
});
