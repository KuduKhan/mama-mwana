import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
describe('premium appearance and clinical NO-GO remain isolated',()=>{
 const css=readFileSync('src/premium-finish-v20.css','utf8');
 const main=readFileSync('src/styles/appStyles.ts','utf8');
 const svg=readFileSync('public/care-motif.svg','utf8');
 it('loads final design layer after other feature CSS',()=>{
  expect(main.indexOf("import '../premium-finish-v20.css'")).toBeGreaterThan(main.indexOf("import '../connected-services-v21.css'"));
  expect(css).toContain('--mm-finish-gap');
  expect(css).toContain('var(--mm-focus-ring)');
 });
 it('supports both reduced motion and forced color users',()=>{
  expect(css).toContain('@media(prefers-reduced-motion:reduce)');
  expect(css).toContain(':root[data-mm-motion="reduce"]');
  expect(css).toContain('@media(forced-colors:active)');
 });
 it('has accessible decorative vector geometry and no external dependencies',()=>{
  expect(svg).toContain('viewBox="0 0 360 300"');
  expect(svg).toContain('<desc');
  expect(svg).toContain('aria-labelledby=');
  expect(svg).not.toMatch(/<script|href="https?:/i);
 });
 it('retains the clinical production NO-GO',()=>{
  const release=JSON.parse(readFileSync('docs/V200_RELEASE_SIGNOFF.json','utf8'));
  expect(release.status).toBe('NO_GO');
  expect(release.productionClinicalAccess).toBe(false);
 });
});
