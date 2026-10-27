import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
describe('auth-only preview and consent-based clinical release gate',()=>{
 const s=readFileSync(join(process.cwd(),'src/lib/supabase.ts'),'utf8');
 it('preserves independent clinical-data opt-in',()=>{
  expect(s).toContain("VITE_AUTH_ACCESS_ENABLED==='true'");
  expect(s).toContain('supabase=configured?authSupabase:null');
  expect(s).toContain('VITE_SUPABASE_PUBLISHABLE_KEY');
  expect(s).not.toMatch(/service_role|VITE_SERVICE_ROLE/i);
 });
 it('does not expose a secret or enable live data via .env.example',()=>{
  const env=readFileSync(join(process.cwd(),'.env.example'),'utf8');
  expect(env).toContain('VITE_AUTH_ACCESS_ENABLED=false');
  expect(env).not.toContain('SUPABASE_SERVICE_ROLE_KEY=');
 });
 it('uses one vector icon for app manifest, sidebar and auth',()=>{
  const a=readFileSync(join(process.cwd(),'src/App.tsx'),'utf8');
  const p=JSON.parse(readFileSync(join(process.cwd(),'public/manifest.webmanifest'),'utf8'));
  const m=readFileSync(join(process.cwd(),'public/icon.svg'),'utf8');
  expect(a.match(/src="\/icon.svg"/g)?.length).toBeGreaterThanOrEqual(3);
  expect(p.icons.every((x:{src:string})=>x.src==='/icon.svg')).toBe(true);
  expect(m).toContain('MamaMwana mother and child embrace');
 });
});
