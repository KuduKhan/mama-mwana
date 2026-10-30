# MamaMwana v2.0 — Technical Blocker Remediation, 30 October 2026

**Current status: Clinical NO-GO. No hosted mutation, activation, approval or real patient data access was performed.**

## Verified hosted metadata baseline
- Dedicated Supabase project ref: `jkazrgobphetdbfdvotf`; PostgreSQL 17. Organization tier: Free.
- 23 public ordinary tables; 23 with RLS enabled. This does not prove correct RLS policies.
- `public.apply_clinical_change` and `public.get_shared_child_summary`: intentional SECURITY DEFINER, pinned empty search_path, signed-in EXECUTE, anonymous EXECUTE denied. Independent assessor must test ownership, bypass, JWT freshness, concurrency, input handling, consent, expiry and revocation.
- Erasure-support `erasure_authorizations`/`erasure_receipts` intentionally have RLS with no regular-account policies. Do not add permissive policies.
- Leaked-password protection remains disabled. Supabase's documented breached-password option requires a paid Pro or higher tier; **no upgrade was purchased or security configuration modified**.
- Hosted migration history still has 11 applied migrations, and accepted-recipient FK remains `ON DELETE SET NULL`; the existing v12 migration is not hosted.
- Release manifest remains `NO_GO`, ten independent signoffs pending.

## Actions completed as engineering work
1. New `npm run security:rpc-review` checks 13 explicit source contracts for auth, owner binding, revocation/expiry, privileged RPC grants, fixed search paths and staged v12 data-deletion semantics; complements authenticated Docker integration tests.
2. New GitHub Actions disposable Postgres drill creates synthetic records and an authentic `pg_dump` archive, seals it with AES-256-GCM, performs authenticated decryption and restores into a second isolated PostgreSQL 17 container. Checks RLS and applies the actual source v12 migration on **synthetic reduced-schema data**. It checks both the pre-v12 deletion failure and post-v12 account deletion.
3. All generated reports include explicit non-equivalence to a **real hosted backup / whole project recovery / independent pen test / external authorization**. GitHub stores no database dump, keys, tokens or personal data, only sanitized metadata.
4. Independent reviewer/DHA intake and consent evidence templates are prepared, not signed.

## Technical blockers still to resolve
- Decide and authorize Supabase Pro billing for leaked-password protection, or obtain written independently justified alternative, and enforce password policy, MFA, verified SMTP and reviewed session policy. Use Dashboard Auth settings; never expose administrative credentials.
- Commission *independent* source/hosted privilege assessment of the two RPCs, all exposed APIs, caregiver impersonation and session freshness. Resolve every high/critical finding and retest.
- Commission encrypted backup of the *actual hosted* project using approved access and infrastructure, and restore a separate cost-authorized environment, including Auth, custom roles, RLS, storage objects, extension and SMTP configuration. Capture real RTO/RPO, integrity and destroy disposable copy under procedure.
- After that restore and written legal/security/change approval, deploy and verify v12 on hosted only in a separately reviewed migration PR/change. This branch does not apply it.
- Obtain physical-device and independent clinical/legal/operations release signatures before patient onboarding; repository reports alone are never approval.

## References
- https://supabase.com/docs/guides/auth/password-security
- https://supabase.com/docs/guides/platform/backups
- https://certification.dha.go.ke/
