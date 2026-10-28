# MamaMwana v1.0-rc.1 — Production demo deployment decision

> **October 29, 2026 reconciliation:** All eleven hosted migrations, including the previously pending v1.0 legacy-link and v1.1 caregiver-invitation migrations, are now applied. Earlier statements below describe the historical release decision when those migrations were not yet applied. This remains a **demo-only production deployment**, with no production Supabase URL or publishable key, and no clinical launch approval. See [current release signoff](V10_RELEASE_SIGNOFF.md) and [security posture](SECURITY_POSTURE_20261029.md).


**Deployment scope:** GitHub `main` → Vercel project `mama-mwana`.  
**Classification:** Public-facing interactive **DEMO ONLY**. **NOT a clinical service launch.**

## Authorized deployment

- Source code includes the consolidated v0.1–v1.0 candidate UI, bilingual navigation, complete family health journal foundation, reconciliation UI, consent invitation UI and release/testing tooling.
- All production healthcare authentication/storage is **OFF** via `VITE_AUTH_ACCESS_ENABLED=false` in the Vercel production environment. The app only exposes an in-memory sample-data journey when no authenticated Supabase client exists.
- No production `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` configured at the last release inspection.
- Vercel Git integration builds from `main`; never use a preview build as proof of production deploy.
- Keep a visible 'demo/sample data only' notice and do not invite actual patients to enter clinical records.

## Database migration status

The existing MamaMwana Supabase project has applied **v0.1–v0.9**. The v0.10 legacy attribution and v0.11 caregiver sharing migrations are intentionally **NOT APPLIED** because verified-client penetration/role tests, independent approval and backup restoration are still incomplete.

All v0.10/v0.11 build, schema, role-RLS simulation, explicit revocation and source-delete cleanup tests passed in rollback-only transactions. Those tests do not establish real JWT issuance or recoverability.

This production demo must not attempt those API tables until backend integration is approved.

## Go/no-go distinction

| Scope | Status |
| --- | --- |
| Merge reviewed source into main | Authorized as source-only consolidation |
| Build and deploy the demo frontend to Vercel production | Authorized with health-data intake DISABLED |
| Run pending migrations on hosted database | NO-GO |
| Enable live patient sign-in, storage, caregiver sharing | NO-GO |
| Declare clinical or Kenyan privacy compliance achieved | NO-GO |

A future operator must obtain independent clinical, Kenyan privacy/child-health data review, actual backup recovery exercise, production JWT/Auth tests, and signed release authorization before changing the gate to true.

## Evidence

GitHub release checks include security:client, security:sql, local migration layout, TypeScript, unit tests, Vite build, and Playwright responsive demo smoke. See `docs/V10_ZERO_COST_TEST_REPORT.md`, `docs/V10_RELEASE_SIGNOFF.md`, `docs/V10_RECOVERY_DRILL.md` and `docs/V10_LOCAL_SECURITY_TEST.md`.

The running deployed commit and Vercel deployment status must be recorded separately after the merge; CI pass alone does not establish deployment success.
