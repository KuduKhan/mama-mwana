import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
const read=(p:string)=>readFileSync(join(process.cwd(),p),'utf8');
describe('v2 clinical acceptance security invariants',()=>{
 it('keeps privileged clinical mutation owner-scoped, version-checked and anonymously denied',()=>{
  const s=read('supabase/migrations/20261024_000006_v06_authoritative_clinical.sql');
  expect(s).toMatch(/create or replace function public\.apply_clinical_change\(/i);
  expect(s).toMatch(/security definer set search_path\s*=\s*''/i);
  expect(s).toMatch(/v_owner\s+uuid\s*:=\s*auth\.uid\(\)/i);
  expect(s).toMatch(/v_record_owner\s*<>\s*v_owner/i);
  expect(s).toMatch(/v_current\s*<>\s*p_expected_version/i);
  expect(s).toMatch(/revoke all on function public\.apply_clinical_change[\s\S]*?from public,anon,authenticated/i);
  expect(s).toMatch(/grant execute on function public\.apply_clinical_change[\s\S]*?to authenticated/i);
 });
 it('requires verified identity, accepted consent and expiry for privileged read-only sharing',()=>{
  const s=read('supabase/migrations/20261025_000011_v11_caregiver_invitations.sql');
  expect(s).toMatch(/create or replace function public\.get_shared_child_summary/i);
  expect(s).toMatch(/security definer set search_path\s*=\s*''/i);
  expect(s).toContain('email_confirmed_at is not null');
  expect(s).toMatch(/i\.status\s*=\s*'accepted'/i);
  expect(s).toMatch(/i\.accepted_by\s*=\s*v_me/i);
  expect(s).toMatch(/i\.shared_until\s*>\s*now\(\)/i);
  expect(s).toMatch(/revoke all on function public\.get_shared_child_summary\(uuid\) from public,anon/i);
 });
 it('keeps account erasure execution disabled until independently approved',()=>{
  const s=read('supabase/functions/process-erasure/index.ts');
  expect(s).toContain("env('ERASURE_EXECUTION_ENABLED')!=='true'");
  expect(s).toMatch(/approval\.approved_by_first===approval\.approved_by_second/);
  expect(s).toMatch(/legal_hold_checked/);
  expect(s).toMatch(/backup_retention_reviewed/);
 });
 it('retains demo-only public static asset caching rather than Auth or API caching',()=>{
  const s=read('public/demo-offline-sw.js');
  expect(s).toContain("req.method!=='GET'");
  expect(s).toContain("PUBLIC=['/','/icon.svg','/manifest.webmanifest']");
  expect(s).toContain("isAsset(url)");
  expect(s).not.toContain('supabase.co');
 });
 it('rejects fabricated local CI evidence generation',()=>{
  const r=spawnSync(process.execPath,['scripts/record-v2-technical-evidence.mjs','build'],{
   cwd:process.cwd(),encoding:'utf8',env:{...process.env,GITHUB_ACTIONS:'false'}
  });
  expect(r.status).toBe(1);
  expect(r.stderr).toContain('scoped GitHub Actions');
 });
});
