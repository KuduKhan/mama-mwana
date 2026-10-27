import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {APP_VERSION} from '../src/lib/release';

const root=process.cwd();
const ui=[
 'src/App.tsx',
 'src/components/CarePlannerV07.tsx',
 'src/components/ClinicalRecordsV04.tsx',
 'src/components/GuidanceV04.tsx',
 'src/components/DataRightsV05.tsx',
 'src/components/PrivacyV04.tsx',
 'src/components/FamilyChildrenV09.tsx',
 'src/components/LegacyAttributionV10.tsx'
];
describe('current release visual and operational copy',()=>{
 it('uses package.json as the only current UI release label',()=>{
  const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
  expect(APP_VERSION).toBe(pkg.version);
  const component=readFileSync(join(root,'src/components/CurrentFeatureHeading.tsx'),'utf8');
  expect(component).toContain('APP_VERSION');
 });
 it('has no old application release headings or obsolete end-user migration prompts',()=>{
  for(const path of ui){
   const text=readFileSync(join(root,path),'utf8');
   expect(text,path).not.toMatch(/(?:VERSION\s+0\.|MAMAMWANA[^\n]*\bV0\.|ACCOUNT-LEVEL[^\n]*\bV0\.)/i);
   expect(text,path).not.toMatch(/(?:apply\s+(?:and\s+verify\s+)?(?:the\s+)?v0\.|check your connection and v0\.|migration v0\.|v0\.\d+ database migration)/i);
  }
 });
 it('disambiguates record and article revision numbers from the application version',()=>{
  const guide=readFileSync(join(root,'src/components/GuidanceV04.tsx'),'utf8');
  expect(guide).toContain('Reviewed article · revision {a.version}');
  const record=readFileSync(join(root,'src/components/ClinicalRecordsV04.tsx'),'utf8');
  expect(record).toContain('not a certified electronic health record');
 });
 it('preserves legacy selectors and explicitly loads the compatibility layer last',()=>{
  const imports=readFileSync(join(root,'src/main.tsx'),'utf8');
  expect(imports.indexOf("import './premium-current.css'")).toBeGreaterThan(imports.indexOf("import './premium-v14.css'"));
  const styles=readFileSync(join(root,'src/premium-current.css'),'utf8');
  expect(styles).toContain('.v4-record-stats');
  expect(styles).toContain('.care07-metrics');
 });
});
