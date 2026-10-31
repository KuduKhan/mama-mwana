import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
const source=(file:string)=>readFileSync(file,'utf8');
describe('live educational foundation without clinical activation',()=>{
 it('uses real Supabase auth state even when private medical records are not approved',()=>{
  const app=source('src/App.tsx');
  expect(app).toContain('const [checking,setChecking]=useState(authConfigured)');
  expect(app).toContain('const client=authSupabase;let active=true;');
  expect(app).toContain('user&&!configured');
  expect(app).toContain('LiveLearningWorkspace user={user}');
  expect(app).not.toContain('else void supabase?.auth.signOut()');
 });
 it('makes public learning accessible with no signup and preserves explicitly optional sample mode',()=>{
  const auth=source('src/components/EntryFlows.tsx');
  const app=source('src/App.tsx');
  expect(auth).toContain('Open learning library — no account required');
  expect(auth).toContain('onLearn');
  expect(app).toContain('LiveLearningWorkspace onBack=');
  expect(auth).toContain('onDemo');
 });
 it('does not import patient data clients into the live learning workspace',()=>{
  const portal=source('src/components/LiveLearningWorkspace.tsx');
  expect(portal).toContain('LibraryPage onEmergency');
  expect(portal).toContain('Private care records remain closed');
  expect(portal).not.toMatch(/from ['"]\.\.\/lib\/(?:clinical|supabase|privateExport|childHealth)/);
  expect(portal).not.toMatch(/\b(?:createClient|fetch|localStorage|sessionStorage)\s*\(/);
 });
 it('exposes email recovery without bypassing medical-access release gates',()=>{
  const auth=source('src/components/EntryFlows.tsx');
  const app=source('src/App.tsx');
  const recovery=source('src/components/AccountPasswordReset.tsx');
  expect(auth).toContain('resetPasswordForEmail');
  expect(auth).toContain('emailRedirectTo:window.location.origin');
  expect(app).toContain("event==='PASSWORD_RECOVERY'");
  expect(recovery).toContain('authSupabase.auth.updateUser({password})');
  expect(recovery).toContain('authSupabase.auth.signOut()');
 });
 it('continues to block production clinical-data authorization',()=>{
  const supa=source('src/lib/supabase.ts');
  const guard=source('scripts/clinical-release-boundary.mjs');
  expect(supa).toContain("VITE_AUTH_ACCESS_ENABLED==='true'");
  expect(supa).toContain('supabase=configured?authSupabase:null');
  expect(guard).toContain('MM_PRODUCTION_CLINICAL_NO_GO');
  expect(JSON.parse(source('docs/RC1_EXTERNAL_ACCEPTANCE.json')).clinicalRelease).toBe('NO_GO');
 });
});
