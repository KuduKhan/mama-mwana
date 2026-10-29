# MamaMwana — verified backend security posture and release boundary

Assessment date: **29 October 2026**, dedicated project: `jkazrgobphetdbfdvotf`.
Source: live Supabase advisors, read-only PostgreSQL catalog/privilege inspection, GitHub migrations and Vercel environment variable names (not values).

## Hosted database and Auth status
- All **eleven** migrations including `v10_legacy_links` and `v11_caregiver_invitations` appear in hosted migration history. Earlier documents saying these remained unapplied were outdated.
- `public.erasure_authorizations` and `public.erasure_receipts`: RLS on, zero policies, `anon` SELECT false, `authenticated` SELECT false. This is intentionally fail-closed. Two informational no-policy notices persist; don't create broad policies solely to clear lint.
- `public.apply_clinical_change(...)` and `public.get_shared_child_summary(uuid)`: SECURITY DEFINER true, `anon` EXECUTE false, `authenticated` EXECUTE true. Both explicitly use `auth.uid()` and pin search_path. They are privileged RPCs, so advisor warnings require independent review and real account-isolation tests; do not auto-switch to SECURITY INVOKER or revoke intended authenticated access without functional review.
- Supabase Auth leaked-password protection disabled. Official Auth docs say HaveIBeenPwned protection requires Pro plan or above. Do not change the plan or claim it can be enabled free of charge. Before clinical launch, operator must assess upgrading or an approved equivalent compensating control.

## Production deployment and boundary
- Production Vercel variables include `VITE_AUTH_ACCESS_ENABLED`, but there is **no production `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, or `VITE_SUPABASE_PUBLISHABLE_KEY`** in the project environment metadata inspected. Those keys exist in preview scope only.
- Client code requires BOTH an https Supabase URL and publishable/anon key, and the separate `VITE_AUTH_ACCESS_ENABLED==='true'` gate to enable patient workspace.
- Thus, the released frontend remains a demo and does not connect real health records through that client; this is not proof of complete hosting security or legal compliance.

## Evidence gate
1. Run the new `local-auth-security.yml` GitHub Actions job with a GitHub-hosted **local Supabase Docker instance**, never linked to production; it creates two separate verified GoTrue logins via a local admin fixture and cleans them afterward. Record CI run ID, result, exact commit, failed RPC read/write/owner-isolation attempts, revocation and expiry.
2. Review the SECURITY DEFINER functions line-by-line with an independent security reviewer for direct RPC authorization, impersonation, record ownership, mutation concurrency, caregiver invitation state and deleted/expired sharing. Retain logs with no PHI.
3. Test a full encrypted backup and restore to authorized disposable infrastructure and record RTO/RPO/ACL/roles and Auth settings. A `BEGIN/ROLLBACK` simulation cannot satisfy this.
4. Obtain clinical/translation, privacy/DPIA, legal and release owner signed approval. File names and dated signatures; never fill missing signatures automatically.
5. Re-run advisors and compare findings before clinical activation. Maintain **NO-GO** until all gates pass.

Advisory references:
- [Privileged signed-in function warning](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
- [RLS without policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
- [Password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

No privileged clinical DB schema change, live user creation, production data exposure or subscription change was made as part of this audit.

## 29 October 2026 local deletion finding — staging mitigation, not applied remotely
- Real local GoTrue sign-in and two-account API isolation succeeded, **11 integration assertions passed**. The initial runner nevertheless reported failed fixture-user deletion. That run is NOT acceptable proof of full erasure because its cleanup did not fail the workflow.
- The `caregiver_invitations.accepted_by` foreign key originally used `ON DELETE SET NULL`. PostgreSQL implements this as an UPDATE, which calls `private.mm_guard_caregiver_invite()`; the trigger requires a verified interactive user and rejects the FK-initiated update. Thus deleting a recipient with an accepted or revoked invitation can fail, while read-only sharing access may have been revoked.
- A **staged, not remotely applied** v12 migration changes that FK to `ON DELETE CASCADE`. Recipient account deletion then removes the invitation and does not leave an orphaned recipient email/authorization; the owner-only invitation lifecycle and explicit revoke rules remain unchanged.
- The local runner now **fails closed** if cleanup returns an error, reporting redacted diagnostics. The GitHub local Docker job destroys its disposable volumes after testing. Require a clean passing rerun including deletion and full integration suite before treating this as repaired.
- This is a privacy/erasure-path schema change requiring an approved hosted backup/recovery plan and independent reviewer signoff before any hosted deployment. No hosted migration was applied during this work.

## Verified remediation result (local, 29 October 2026)
After the FK and family-audit cascade repair in the **staged v12 migration**, [GitHub Actions run 40785256481](https://github.com/KuduKhan/mama-mwana/actions/runs/40785256481) completed successfully. It created two independent local GoTrue accounts, executed **11/11** authenticated clinical/family/caregiver/care-plan isolation assertions and **successfully deleted both accounts** with cascading records. The runner now fails on any cleanup error and the CI job destroys its local-only volumes. Earlier runs which passed integration assertions but failed user deletion are invalid as erasure evidence.

The hosted database still contains **11 applied migrations**. The v12 account-erasure fix is **source-only and not applied to the hosted project**, pending approved backup/restoration, independent security/privacy review and controlled migration rollout. Browser screenshots and local fixtures contain only disposable sample data.

Browser-engine evidence: [CI run 40785256459](https://github.com/KuduKhan/mama-mwana/actions/runs/40785256459) passed **5 WebKit iPhone-profile and 5 Android Chromium-profile tests**. Neither performs physical-device VoiceOver/TalkBack assessment.

## Independent 29 October 2026 follow-up: source-level NO-GO and adversarial checks

Read-only live catalogue checks reconfirm: every 23 public ordinary health-data tables has RLS enabled; `anon` has no SELECT grants. `public.erasure_authorizations` and `public.erasure_receipts` remain deliberately fail-closed with no client grants/policies. Hosted `caregiver_invitations.accepted_by` still uses **ON DELETE SET NULL**; v12 source-side correction is not deployed. Both public privileged RPCs have pinned empty search paths, deny anonymous execution and allow signed-in execution subject to their own identity/consent validation. This is an engineering observation, NOT an independent security signoff.

To prevent an accidental real-patient launch, `vite.config.ts` now calls `assertClinicalReleaseBoundary` before compiling: **any Vercel production build with `VITE_AUTH_ACCESS_ENABLED=true` fails**. The working production demo remains allowed. This source-level fail-safe must be changed in a separately reviewed PR only after release approval; flipping a deployment environment flag is not enough. Local/preview disposable testing remains possible.

Additional local GoTrue tests target anonymous clinical RPC access, invalid payloads, an owner forging recipient consent, recipient identity/expiry tampering, repeated acceptance, and unauthorized grant extension. These supplement the previous 11 tests, rather than pretending to constitute an independent security assessment.

This work does not run a production migration or access any patient records. The v12 migration, hosted backup/restore, independent RPC review, Auth compromised-password prevention and signed clinical/privacy/mobile approvals remain NO-GO items.
