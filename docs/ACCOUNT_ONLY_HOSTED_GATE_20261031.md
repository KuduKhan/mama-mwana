# Live account-only backend isolation — applied 31 October 2026

## Objective and actual status
Enable real **Supabase Auth** accounts for public educational use without allowing any signed-in account to view or mutate pregnancy/newborn records, clinical information, caregiver invitations, data-rights case records, or privileged clinical RPCs. The clinical release state is still **NO_GO**.

**Project:** MamaMwana Supabase `jkazrgobphetdbfdvotf` (Mumbai). **Vercel project:** `mama-mwana`.

### Host-level technical changes performed
- Vercel Production and Preview: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` configured; values are public browser credentials, no service/secret key.
- Production and Preview: `VITE_AUTH_ACCESS_ENABLED=false` maintained.
- Hosted database: revoked direct `anon` / `authenticated` permissions on **all 23 public tables** and public sequences; revoked public function `EXECUTE` grants for `PUBLIC`, `anon`, `authenticated` across the three current public functions.
- **Post-change SQL verified:** `authenticated_read_tables=0`, `authenticated_write_tables=0`, `authenticated_callable_functions=0`, `anon_callable_functions=0`. RLS remained enabled on all 23 public tables.
- Source SQL: `ops/ACCOUNT_ONLY_CLINICAL_DENY.sql`. This is a record of applied access-control changes, not a new migration that should be applied twice by CI.

### What is and isn't functional
- Public educational browsing, EN/SW lessons, quiz and download functionality can operate without a Supabase session.
- A production user can attempt Auth registration and sign-in through the real Auth client once the new Vercel build is READY. **Delivery and correctness of signup confirmation, custom SMTP, password recovery, two-account session tests and real-device acceptance have NOT been verified.** These are not automatically proven by configuration.
- The account-only learning workspace can identify a signed-in user. It must not read or submit any clinical data, and the database currently denies all direct public-table/RPC access even if a browser is modified.
- Do **not** reverse SQL grants, turn on clinical env flags, use clinical RPCs or market MamaMwana as an authorized medical-records system until all ten independent acceptance gates in issue #52 and regulator/partner approvals are completed.

### Integration and authorization dependencies
- Clinical content review and qualified bilingual sign-off (reviewer identities, scope, sources, version).
- Applicable Kenya ODPC, DPIA, guardianship, lawful basis, privacy/retention, processor contracts, and Digital Health Agency approvals.
- Independently validated application threat model and privileged-RPC audit; production-like synthetic cross-account abuse cases with session expiry/revocation.
- Encrypted hosted restore plus RTO/RPO evidence, authorized v12 erasure migration and verified deletion.
- Real hardware accessibility QA, SMTP authentication and incident/rollback operations.
- Only then: staged and separately licensed provider connectors, signed contracts, scoped service access, supported FHIR exchange where applicable.

### How to verify without patient data
1. Read grants using the verification query in `ops/ACCOUNT_ONLY_CLINICAL_DENY.sql`, ensuring all counts stay zero and 23 tables have RLS.
2. Use a *verified synthetic* test email and isolated test account to exercise sign-up, confirmation, login, refresh, password reset and signout; test accounts must never contain real pregnancy or child data.
3. Run the account-only negative tests against `journeys` and the `apply_clinical_change` RPC, both of which must return permission-denied responses (not successful data access).
4. Validate public learning, keyboard navigation and mobile viewport, then verify release-boundary CI and the exact deployed SHA.

### Release management
The grants restrict an existing live hosted project. Any future permission expansion must be an explicit, reviewed migration restoring **only** approved per-table/function grants; do not run `GRANT ALL ON ALL TABLES`. A Vercel `READY` build is not proof of operating account email or approved healthcare.
