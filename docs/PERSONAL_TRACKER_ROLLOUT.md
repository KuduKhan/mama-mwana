# MamaMwana — tracker-first product release proposal (31 October 2026)

## Intended use and boundaries
MamaMwana is a **consumer family organizer and non-diagnostic educational companion**. Account holders can privately enter journals, raw progression logs (measurements without growth classification), and dates for reminders. Parents may transcribe information from licensed professionals; the app labels this **provider-supplied, NOT verified by MamaMwana**.

Not in scope: differential diagnosis, treatment recommendations, automated risk classification, professional growth interpretation, certified medical records, facility messaging, caregiver sharing, FHIR exports, clinic scheduling, emergency response or unsolicited push/SMS/email reminders.

A tracker should not be marketed as exempt from all regulation just because it does not diagnose. Obtain Kenyan privacy/DHA/PPB applicability advice based on actual deployment and data categories.

## Architecture and storage
- Public EN/SW education remains anonymous. Signed-in accounts can access the tracker **only after** `VITE_PERSONAL_TRACKER_ENABLED=true` is compiled in a new reviewed deployment.
- Clinical `VITE_AUTH_ACCESS_ENABLED=false` stays **unchanged**.
- Separate `public.personal_tracker_items` table. Strict owner_id = auth.uid() RLS on SELECT/INSERT/UPDATE/DELETE, explicit grant ONLY on this table to authenticated role. No privileged functions, no direct grants to the 23 previously locked clinical tables.
- Owner ID defaults to `auth.uid()`, references `auth.users(id)` and cascades on deletion. All other person/family values are entry labels only, not third-party access permissions.
- No localStorage for tracker content. The existing authenticated session persists as configured by Supabase Auth.
- No push, SMS, background jobs, analytics, cloud notifications or health-context transmission. Reminders are visible when a user opens their signed-in app. Optional user-initiated .ics calendar export uses a generic title.
- User-controlled JSON export and record deletion; deleting all reports incomplete attempts and reloads from the server.
- The server owns authoritative access control; hiding UI is never enough.

## Database migration
File: `supabase/migrations/20261031_000013_personal_tracker.sql`.
This migration is **NOT applied to production just by merging code**. It has explicit grants limited to the new table and must be exercised in a staging/fork environment before live application. Do not run an automatic process that applies all pending migrations: `20261029_000012_v12_recipient_erasure_fk.sql` is independently gated, not yet reviewed for hosted production.

Before applying v13 on a production backend, resolve its dependency order and validate v12 independently or use a separately reviewed, non-contiguous/manual staging rollout. Use controlled DBA operations rather than blindly updating migration history.

## Required acceptance before activation
1. **Account:** verified delivery and user confirmation, SMTP and callback URLs, sign-in/reload/refresh/sign-out/password recovery; strict no-unconfirmed-user writes.
2. **Privacy:** retention/deletion and parent/child legal basis, required ODPC/DPIA/DHA assessment, consent and support incident procedure. New tracker schema must be covered by export/deletion scope and restore plan.
3. **Authorization:** use two verified synthetic accounts A and B on actual REST endpoints. A can CRUD only A entries; B cannot SELECT/UPDATE/DELETE A; anonymous client denied. Test owner_id overwrite, forged JWT/subject, service key absence in client, archived sessions and concurrent requests.
4. **Recovery:** restore a backed-up, encrypted production-like test environment and verify RTO/RPO, ownership policies, role grants, Auth configuration and representative synthetic tracker records.
5. **Operational:** supported mobile/tablet/desktop browser and keyboard/screen-reader checks; safety copy, export correctness, error UX, monitoring without private payloads, and rollback rehearsal.
6. **Release:** independent accountable operator records PASS against exact Git commit, Supabase schema hash, environment variables and Vercel deployment ID. **Do not flip the flag on promises or untested assumptions.**

## Deployment controls
- `VITE_PERSONAL_TRACKER_ENABLED`: default disabled unless explicitly configured to `true`.
- `VITE_AUTH_ACCESS_ENABLED`: must remain `false` for the clinical workspace.
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`: browser-safe values only. Never use privileged service_role keys in Vite.
- New migration must not add grants for `public.journeys`, `public.child_measurements`, `public.child_immunizations`, other clinical tables or privileged RPCs.
- Run CI `node scripts/check-personal-tracker-security.mjs`, `npm run test`, `npm run build`; then synthetic-user REST tests and audited restore tests in a disposable environment.

## Rollback
Set `VITE_PERSONAL_TRACKER_ENABLED=false` and redeploy a reviewed build. Disable access to the new table if needed with `REVOKE ALL ON public.personal_tracker_items FROM authenticated`; preserve records for authenticated data-subject deletion/export as legally required, rather than destructively dropping data without a reviewed plan. Explicitly log rollback timing and notify the responsible operator.

## Current declaration
**Engineering code: proposed, subject to CI. Hosted tracker schema: not applied. Vercel tracker feature: OFF. External acceptance: NOT VERIFIED.** This proposal makes no representation that consumer health-data legal/privacy or recovery obligations have been met.
