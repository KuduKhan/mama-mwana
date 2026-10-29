import {describe,expect,it} from 'vitest';
import {assertClinicalReleaseBoundary} from '../scripts/clinical-release-boundary.mjs';
describe('production clinical NO-GO release boundary',()=>{
 it('blocks enabling live patient-data mode in Vercel production',()=>{
  expect(()=>assertClinicalReleaseBoundary({VERCEL_ENV:'production',VITE_AUTH_ACCESS_ENABLED:'true'}))
   .toThrow(/MM_PRODUCTION_CLINICAL_NO_GO/);
 });
 it('allows the production demo with patient-data access disabled',()=>{
  expect(()=>assertClinicalReleaseBoundary({VERCEL_ENV:'production',VITE_AUTH_ACCESS_ENABLED:'false'})).not.toThrow();
  expect(()=>assertClinicalReleaseBoundary({VERCEL_ENV:'production'})).not.toThrow();
 });
 it('allows disposable test and local previews without authorizing production',()=>{
  expect(()=>assertClinicalReleaseBoundary({VERCEL_ENV:'preview',VITE_AUTH_ACCESS_ENABLED:'true'})).not.toThrow();
  expect(()=>assertClinicalReleaseBoundary({VERCEL_ENV:'development',VITE_AUTH_ACCESS_ENABLED:'true'})).not.toThrow();
  expect(()=>assertClinicalReleaseBoundary({VITE_AUTH_ACCESS_ENABLED:'true'})).not.toThrow();
 });
});
