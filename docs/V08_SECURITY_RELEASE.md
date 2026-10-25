# MamaMwana v0.8 — Security-first release candidate

**Status: NOT APPROVED FOR REAL PATIENT DATA.** This milestone is software and documentation only; it is not a claim of medical, regulatory or penetration-test approval.

## Work delivered
- A fail-closed, health-data-safe React error boundary.
- Restrictive Vercel response headers (CSP, clickjacking, content-type and permissions).
- Server-side care-plan visit/journey reference enforcement. Previously UI-only validation could be bypassed with a direct REST call.
- A pure release readiness policy with tests that never substitute for real human approvals.
- A checklist for release verification and migration sequencing.

## Mandatory staging exercise before changing production
1. Confirm the dedicated MamaMwana Supabase project and a verified recovery point; never use KhanHomes/KHANIVERSITY for these migrations.
2. Apply v0.8 SQL **on a disposable copy first**. Test user A linking a visit owned by B; it must fail. Test same-journey visit insertion and update; they must succeed.
3. Test v0.6 authoritative clinical RPC via two verified disposable accounts and check metadata audit integrity; assess security-definer ownership and EXECUTE exposure.
4. Test v0.7 care-plan actions, 250-record paging behavior, concurrent browser edits, account deletion and erasure edge cases.
5. Verify privileged erasure stays disabled until separate audited human review. Test backup restoration and retention policy.
6. Run browser accessibility checks on Safari/iOS, Android Chrome, 200% zoom, reduced-motion and keyboard-only use. Ensure no clipboard contents go to logs.
7. Configure Vercel only with the **publishable** Supabase key and URL. Verify CSP on the built production response; permit extra origins only when justified.
8. Obtain signed clinician validation, Kenya privacy/ODPC legal review, and operational release authorization.

## Post-install checks
- npm run typecheck
- npm run test
- npm run build
- npm run test:ui
- Protected database-security GitHub workflow with two disposable accounts, not production identities.

## Open issues to resolve
- The repository currently uses `npm install` in CI and has no reproducible lockfile. Generate and commit a correct npm lockfile from a supported online environment; change CI to `npm ci` only after that lockfile has been verified.
- Existing single-child journey views must not silently interpret more than one newborn. v0.9 family profiles will be kept distinct from legacy one-child clinical charts until migration verification.
- Data export is currently plaintext JSON; storage and transfer guidance must remain explicit.
- Clinical content cannot be labelled approved without verified human reviewer evidence.
- Security Advisor findings should be reviewed and resolved/justified, including exposed authenticated clinical RPC, password-leak checks and deliberately inaccessible erasure tables.

## Go/no-go
Release is **NO-GO** until: real RLS test evidence; migration test evidence; clinician/privacy approval; working rollback and backup restoration; verified deployed commit and authenticated smoke test.
