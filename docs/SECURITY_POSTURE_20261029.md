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
