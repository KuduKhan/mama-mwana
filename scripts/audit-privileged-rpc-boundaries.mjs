/**
 * Read-only source contract audit. No hosted privileges or patient records are used.
 * This is not an independent security audit or an exploitation test.
 */
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const v6=read('supabase/migrations/20261024_000006_v06_authoritative_clinical.sql');
const v11=read('supabase/migrations/20261025_000011_v11_caregiver_invitations.sql');
const v12=read('supabase/migrations/20261029_000012_v12_recipient_erasure_fk.sql');
const manifest=JSON.parse(read('docs/V200_RELEASE_SIGNOFF.json'));
const checks=[
 ['Clinical RPC must be SECURITY DEFINER with fixed search path',/create or replace function public\.apply_clinical_change[\s\S]*?language plpgsql security definer set search_path\s*=\s*''/i.test(v6)],
 ['Clinical RPC must authenticate actor',/v_owner uuid\s*:=\s*auth\.uid\(\)/i.test(v6)],
 ['Clinical RPC must reject anonymous identity',/auth\.jwt\(\)->>'is_anonymous'/i.test(v6)],
 ['Clinical RPC must verify owning journey',/v_record_owner\s*<>\s*v_owner/i.test(v6)],
 ['Clinical RPC must serialize with FOR UPDATE',/where id=p_journey_id for update/i.test(v6)],
 ['Clinical RPC must explicitly revoke anonymous EXECUTE',/revoke all on function public\.apply_clinical_change\(uuid,text,text,bigint,jsonb,boolean\)[\s\S]*?from public,anon/i.test(v6)],
 ['Caregiver summary must use fixed search path',/public\.get_shared_child_summary[\s\S]*?security definer set search_path=''/i.test(v11)],
 ['Caregiver summary must bind signed-in and verified identity',/v_me uuid:=auth\.uid\(\);v_email text:=private\.mm_verified_email\(\)/i.test(v11)],
 ['Caregiver summary must require accepted recipient',/i\.accepted_by=v_me and i\.status='accepted'/i.test(v11)],
 ['Caregiver access must have future expiry',/i\.shared_until>now\(\)/i.test(v11)],
 ['Caregiver summary must reject anonymous EXECUTE',/revoke all on function public\.get_shared_child_summary\(uuid\) from public,anon/i.test(v11)],
 ['Proposed erasure migration must cascade accepted recipient',/foreign key\s*\(accepted_by\)[\s\S]*?on delete cascade/i.test(v12)],
 ['Source-level clinical release remains NO_GO',manifest.status==='NO_GO'&&manifest.productionClinicalAccess===false]
];
const missing=checks.filter(x=>!x[1]).map(x=>x[0]);
if(missing.length){missing.forEach(x=>console.error('PRIVILEGED_RPC_CONTRACT_FAIL: '+x));process.exitCode=1;}
else console.log('PASS: '+checks.length+' static privileged RPC and release boundaries checked. Human external penetration review remains PENDING.');
