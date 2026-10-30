import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
describe('beta.11 architecture stabilization',()=>{
 it('isolates the library route without duplicating feature JSX in App',()=>{
  const app=readFileSync('src/App.tsx','utf8'),library=readFileSync('src/features/learning/LibraryPage.tsx','utf8');
  expect(app).toContain("lazy(()=>import('./features/learning/LibraryPage'))");
  expect(app).not.toContain('function Library(){');
  expect(library).toContain('<PublicLearningV204/>');
  expect(library).toContain('<LearningAcademyV209/>');
 });
 it('keeps legacy cascade in a single designated style entry and exposes semantic tokens',()=>{
  const root=readFileSync('src/main.tsx','utf8'),entry=readFileSync('src/styles/appStyles.ts','utf8');
  expect(root).toContain("import './styles/appStyles'");
  expect(root).not.toContain("import './premium-finish-v20.css'");
  expect(entry.indexOf("import '../styles.css'")).toBeLessThan(entry.indexOf("import '../premium-finish-v20.css'"));
  expect(entry).toContain("import '../ui/system-v211.css'");
 });
});
