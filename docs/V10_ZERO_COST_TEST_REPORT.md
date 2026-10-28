# MamaMwana — Zero-additional-infrastructure security validation

> **Historical report (25 October 2026):** Migration and approval statements in this report are accurate to their original test date but **superseded** for current hosted migration state. Supabase project migration history on 29 October confirms all eleven hosted migrations were applied. The new cross-account local GoTrue workflow and current security/advisor posture are tracked in [SECURITY_POSTURE_20261029.md](SECURITY_POSTURE_20261029.md). This historical report must not be interpreted as current clinical-release approval.


**Test date:** 25 October 2026 (Africa/Nairobi)  
**Scope:** Dedicated MamaMwana Supabase project `jkazrgobphetdbfdvotf`, GitHub PR #10.  
**Environment policy:** No paid branch or project was created. The database was tested with transaction-local synthetic fixtures and explicit `ROLLBACK`.

## Results — performed

| Check | Outcome | Verification method |
| --- | --- | --- |
| v0.10 clinical attribution migration DDL | PASS | PostgreSQL schema creation in BEGIN/ROLLBACK transaction; two new tables created within transaction |
| v0.11 caregiver invitation migration DDL | PASS | PostgreSQL schema creation in BEGIN/ROLLBACK transaction; two new tables created within transaction |
| v0.10 ownership and audit | PASS | Synthetic parent A could attribute own growth entry; B could not read A attribution or audit |
| v0.10 clinical-record deletion | PASS | Deleting authoritative source via clinical RPC removed stale attribution |
| v0.11 invitation acceptance | PASS | Simulated recipient B accepted owner's pending invitation after test email was marked verified |
| v0.11 minimal data exposure | PASS | B could access child-specific read-only summary after acceptance but could not directly SELECT the owner's underlying family child row |
| v0.11 revocation | PASS | Owner A revoked; B's subsequent read-only summary RPC was rejected |
| No persisted fixtures | PASS | After rollback: 1 pre-existing Auth user, 0 journeys and 0 new v0.10/v0.11 tables |
| SQL authorization contract CI | PASS | GitHub Actions `Check clinical SQL authorization contracts` from run 40199527054 |
| GitHub typecheck, unit tests, build | PASS | GitHub Actions run 40199527054 |

**Important scope limitation:** The A/B tests used synthetic `auth.users` rows, `SET LOCAL ROLE authenticated` and `request.jwt.claim.sub` inside a single database transaction. They validate RLS SQL semantics and triggers, **not** actual Auth GoTrue sign-in, validated JWT issuance, session lifecycle or two distinct network clients. No synthetic Auth records or test data were retained.

## Permanently applied schema

Supabase migration history currently contains **v0.1–v0.9**, including successfully applied v0.8 and v0.9 migrations. Migrations v0.10 and v0.11 remain **unapplied** while clinical, privacy, recovery and authentic-user tests are incomplete.

## Free-of-new-infrastructure verification gate

`npm run security:sql` now runs automatically as part of CI. It fails a build if planned v0.10/v0.11 migrations lose mandated RLS, default grants revocation, owner/source consistency, version conflict checks, verified-email checks, revocation or expiry logic.

The protected `database-security-test` workflow has an explicit production-project denylist. Even if someone accidentally supplies this project's URL as fixture credentials, integration tests refuse to run. Additional firewall rules and true Supabase account isolation remain necessary before enabling it.

## Release-critical items that are NOT approved or completed

1. Real sign-up/login with two independently verified, disposable Auth accounts and unauthorized REST/RPC attempts. The protected integration workflow intentionally refuses to skip when those secrets are missing.
2. Full backup export and an actual restoration drill, including data and Auth configuration. A transactional rollback test is **not** a backup-restore exercise.
3. Independent sign-off by registered maternal/child healthcare reviewers, Kiswahili medical translators, qualified privacy/legal advisers and the authorized service operator.
4. Kenya children's data, health data, guardian authority and ODPC/DPIA compliance determinations and appropriate policy documentation.
5. Security review of privileged Supabase clinical and sharing RPC functions and production Auth security configuration; the leaked-password protection warning remains unresolved.
6. Completion and review of all patient-facing Kiswahili health and urgent-care content.
7. Deployment of verified database migrations **only after** an authorized, recoverable release plan.

## Safe next actions

- Keep PR #10 in **draft**, with v0.10/v0.11 unapplied and production live health-data authentication disabled.
- Conduct the independent approvals and verify a backup recovery solution before any release promotion.
- Do not silently substitute SQL simulation or CI success for authenticated security tests.
- No paid Supabase branch/project should be created: its hourly cost was explicitly rejected.

Reproduce offline CI checks: `npm run security:sql && npm run typecheck && npm run test && npm run build`.

GitHub review: https://github.com/KuduKhan/mama-mwana/pull/10

## New local verified-Auth test route (prepared, not yet executed)

Added `scripts/prepare-local-migrations.mjs` to copy all eleven nonstandard historical migrations into ignored `.mamamwana-local/supabase/migrations` with correctly formatted 14-digit CLI timestamps. The original tracked schema and remote migration history remain unchanged.

Added `scripts/run-local-security.mjs` and `npm run test:local:security`, which refuse non-loopback endpoints, create temporary **genuine verified Auth** test identities using only the local Supabase administrative key, seed a newborn, run all four RLS integration suites through signed-in REST clients, and delete identities afterward. Loopback rejection has regression tests. User can run this with Docker Desktop and the instructions in `docs/V10_LOCAL_SECURITY_TEST.md` without renting a separate Supabase branch.

**This full local Auth suite has not been executed here.** The developer container does not have an operational Docker-backed Supabase runtime. Continue to classify real two-account Auth as **PENDING** until its run log is available.
