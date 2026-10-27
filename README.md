# MamaMwana 🌿

**Every little beginning matters.** React + TypeScript + Vite + Supabase.

A responsive mother-and-child companion built directly in the GitHub repository KuduKhan/mama-mwana (not Lovable).

## Included in v0.1

Pregnancy profile (clinician supplied due date); weekly education (weeks 4–42); pregnancy-stage daily-care checklist; antenatal appointment journal; birth-preparation checklist; birth transition preserving pregnancy history; postpartum care; newborn growth measurements and age-based milestone tracker; private Supabase authentication/persistence and per-account database Row Level Security; responsive mobile/tablet/desktop UI; and a clearly marked in-memory interactive demo.

## Start locally

Prerequisite: Node.js 20.19+ (or a compatible later supported LTS), npm.

1. Clone the repository: git clone https://github.com/KuduKhan/mama-mwana.git
2. Enter it: cd mama-mwana
3. Install: npm install
4. Run: npm run dev
5. Open the localhost URL shown by Vite.

When environment variables are absent, select **Explore interactive demo**. Demo is IN-MEMORY ONLY (not saved, resets on reload). **Use sample details only**; do not input real medical data.

## Configure Supabase Auth + database

1. Create a dedicated Supabase project.
2. Execute supabase/migrations/20261024_000001_foundation.sql using Supabase SQL Editor.
3. Set Supabase Authentication Site URL and allowed Redirect URLs for localhost and production. Configure verified email delivery and email confirmation.
4. Copy .env.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (public/publishable key). NEVER place a service-role or secret key in a Vite client variable.
5. Restart npm run dev and create/verify an account.
6. Test private persistence, sign-out/sign-in, and cross-account access using two test accounts.

### Deployment

Import this GitHub repository into Vercel using **Vite**, build command **npm run build**, output **dist**. Set the two public environment variables and include your Vercel URL in Supabase Auth settings. A Vercel SPA rewrite is included. No Lovable tooling is used.

### Quality checks

- npm run typecheck
- npm run test
- npm run build

## Database architecture (v0.1)

The journeys table has per-user RLS. Each owner has **one journey** with typed due/birth fields and JSONB lists for visits, daily checks, birth readiness, baby measurements and milestones. The birth transition updates the same row, preserving pregnancy context. This is a first vertical slice, NOT a multi-pregnancy or twins architecture. Future migrations must normalize children, visits, milestones, audit history, caregiver roles and conflict resolution for simultaneous writes.

## Medical and privacy safeguards

**Prototype, not medical advice, a diagnostic tool, a medical device, or an emergency service.** Week information and milestone examples are educational approximations. A clinician must interpret scans and growth using appropriate standards. The daily plan does not issue medication, exercise or fluid prescriptions. The app displays urgent warning signs and directs users to immediate medical care, not chatbot reassurance.

Sources for professional review:
- WHO Antenatal Care: https://www.who.int/publications/i/item/9789241549912
- WHO Postnatal Care: https://www.who.int/publications/i/item/9789240045989
- CDC Milestones: https://www.cdc.gov/act-early/milestones/index.html
- CDC Maternal Warning Signs: https://www.cdc.gov/hearher/maternal-warning-signs/index.html
- AAP Safe Sleep: https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx

Before collecting real patient data: independent clinician validation; current Kenya healthcare/ODPC legal assessment; privacy notice and consent basis; secure backups; retention, export and deletion workflows; accessibility and penetration tests; content versioning; RLS isolation checks; patient safety review; abuse protection; and emergency-response localization. Clinical professionals—not this app—determine ANC visit schedules and emergency plans.

## Next steps

v0.2: multi-child schema, normalized clinical records, scheduled notifications, professional review workflow.
v0.3: clinician-approved WHO growth plotting, corrected age for preterm infants, and current location-specific vaccine calendars.
v0.4: evidence-constrained AI assistant with strict non-AI emergency escalation and medical governance.

GitHub remains the source of truth.

## v0.2 upgrade — October 2026

The v0.2 release supports multiple pregnancy-to-child journey records per account, in-app seven-day and overdue appointment reminders, opt-in calendar export, optional private wellbeing check-ins, and newborn feeding logs. Each journey currently tracks one baby; twins and normalized child records remain planned.

**Required database upgrade:** Run `supabase/migrations/20261024_000002_v02_journey_history.sql` after the original `20261024_000001_foundation.sql`. The migration removes the original unique-per-user limit and adds two optional JSONB log fields; it preserves existing records. For a fresh database execute both migrations in order.

Reminders only display when the app is open; no background push/email notifications are claimed. `.ics` calendar exports provide an all-day reminder only, so users must confirm the actual appointment time with their clinic. Exported events may be shared with external calendar providers.

The feeding log is not a clinical feeding plan. The wellbeing check-in is not a mental-health screening or crisis-support system. Content still needs clinical validation and a Kenyan data-protection/security review before real patient use. Future releases should normalize pregnancies, children, visits and clinical measurements with robust auditing and concurrency controls.

## v0.3 child health — October 2026

### New features
- Child profile with optional sex and clinician-recorded gestation at birth.
- Visual, accessible timelines for the child's measured weight and length (NOT WHO percentile classifications).
- Sex-specific WHO reference charts linked directly from the World Health Organization. Reference choice is disabled when sex is unknown.
- Kenya immunization diary with age-reference checklist and caregiver-recorded administration dates, facilities, and notes. Records can be edited/removed.
- Age-appropriate newborn and infant education cards with danger sign guidance.
- Cross-version compatibility, migration, and tests.

### Important required migration
Run `supabase/migrations/20261024_000003_v03_child_health.sql` after the v0.1 and v0.2 migrations, in that order. The script adds nullable child fields and an empty immunizations list; existing journeys and pregnancy/baby records remain intact. The v0.3 frontend requires the migration for authenticated sessions. In-memory demo mode remains independent of Supabase.

### Clinical governance and boundaries
A personal measurement trend is *not* a WHO growth chart. MamaMwana opens WHO-published clinical reference PDFs and does not calculate child growth z-scores, percentiles, malnutrition diagnoses, or individualized catch-up vaccine schedules. A clinician must interpret each child's growth and confirm vaccinations, county-level immunization differences, extra vaccines, preterm corrected-age handling, and schedule changes. A birth record here is not certified medical documentation. Child vaccination records entered by caregivers are not verified by a clinician.

Current source links: https://www.who.int/tools/child-growth-standards and https://health.go.ke/sites/default/files/2025-04/Clinical%20Guidelines%20for%20Level%201%20Community%20Health%20Services.pdf

Before a real-patient production rollout: medical review, Kenya data protection assessment, consent/export/delete workflows, RLS E2E testing, secure backups, normalized child and encounter models, and age-appropriate usability testing are still mandatory.

## MamaMwana v0.4 — Clinical, privacy and review foundations

**Not a medical device or live emergency system. This release requires migration and safety validation before using real patient data.**

### Included

- Normalized, account-protected clinical timeline tables: `journey_visits`, `child_measurements`, `child_immunizations`. They are read-only synchronized projections; the existing JSONB journey remains the authoritative write model.
- Privacy & Records page: in-app reminder preference, optional stage-only local guidance, export of all family journeys to unencrypted JSON, and individually confirmed deletion of a journey.
- Source-linked, deterministic guidance engine that does not call a large language model, store question history, or diagnose illness. Keyword escalation is not reliable clinical triage; always seek immediate help for concerning signs.
- Clinician content review foundations: manually provisioned reviewer accounts, draft review desk, approved-source filtering, and reviewed article status with reviewer ID and timestamp. No articles are automatically marked clinician-approved.
- Unit tests for safety-gate behavior, trusted source URLs and private exports.

### Database setup / non-destructive migration

Back up the current database. Existing v0.3 projects must run:

`supabase/migrations/20261024_000004_v04_clinical_privacy_review.sql`

New projects run ALL migrations in filename order (v0.1, v0.2, v0.3, v0.4). Do not apply to a production project without testing on a disposable copy. The v0.4 migration does not drop old journey data; a trigger populates the normalized read models from it. Writes still occur through `journeys` in v0.4.

### Clinical review and authorization

An authorized database administrator must verify a real reviewer and insert their authenticated UUID into `public.clinical_reviewers`. Clients have no write permission on that assignment table. The reviewer UI only appears for provisioned users. Before publishing content clinically, establish credential checks, independent editorial approvals, evidence update processes and a proper audit trail. Reviewer self-approval is still possible for provisioned reviewers in this prototype, so an independent signoff policy is needed.

### Security and privacy boundaries

- Sensitive maternal/child records are account-scoped via PostgreSQL RLS. Validate isolation between two test users before real use.
- Exported JSON is not encrypted by the application; user must store it privately. Export and deletion concern active application records, not historical backups or certified health records.
- Whole-account Auth deletion is **not yet implemented**; never expose service-role credentials or use client-side admin.deleteUser.
- Optional stage context is OFF by default. In-app reminders are visible only while using the app; there is no email or push delivery.
- No analytics SDK, externally hosted AI inference, or personalized medical diagnosis is added.
- Kenyan ODPC assessment, lawful-basis notice, documented retention and erasure flow, clinician governance, data-subject requests, encryption/backups, accessibility and security audit remain launch blockers.

### Validation checklist

1. Run `npm run typecheck`, `npm run test` and `npm run build`.
2. Apply migration to a disposable Supabase project and verify the trigger backfill and per-user SELECT isolation.
3. Confirm normal accounts cannot assign themselves clinical reviewer rights or approve content.
4. Test consent preferences, multi-journey export, one-journey deletion, and continued function of v0.3 growth/vaccination screens.
5. Validate urgent-escalation behavior, including missed-keyword emergency scenarios.

References: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://www.odpc.go.ke/rights-of-a-data-subject/ ; https://www.cdc.gov/hearher/maternal-warning-signs/index.html ; https://www.who.int/publications/i/item/9789240045989

### Deferred beyond v0.4

Authoritative normalized clinical writes with transaction audit, full account deletion, independent reviewer approval, clinician EHR interoperability, real medical triage, and any external AI model integration.

## v0.5 — Independent clinical governance and data-rights workflow

### Implemented
- **Independent clinical approval.** A database-assigned reviewer submits an article; the author cannot approve their own content. RLS and an update trigger enforce provenance, signed-in reviewer identity, original-content immutability, and approval from another authorized reviewer.
- **Immutable publication.** Approved content cannot be silently changed via client UPDATE. Publication of a revised article requires a distinct content-version workflow in a future release. Legacy pending records without author provenance cannot be approved until an authorized operator resolves them.
- **Review audit events.** Submitted/approved actions generate database records in education_review_events. Public clients have read-only reviewer access to these events.
- **Data-subject rights intake.** Authenticated users can submit and track access, correction and erasure requests with duplicate-open-request protection. No browser action actually erases the Auth user or retained backups.
- **Better mobile presentation** for rights requests, clearer workflow boundaries and test coverage for author/reviewer separation.

### Migration
Back up the target database, then apply supabase/migrations/20261024_000005_v05_governance_rights.sql after the v0.1–v0.4 scripts. Existing maternal and child journey records are not intentionally changed. Test this migration first against a disposable database with multiple accounts.
No dedicated MamaMwana Supabase project was available to the assistant, so the SQL is committed in source control but has NOT been executed or validated against a live database. Passing TypeScript and Vite CI cannot verify RLS policy behavior.

### Required pre-production gates
1. Confirm all v0.1–v0.4 migrations have been applied, then test v0.5 on an isolated Supabase database.
2. Verify two distinct, appropriately credentialed reviewer accounts. Author A must not approve their own submission; reviewer B may approve; non-reviewers must not submit or approve; approved content must remain immutable.
3. Confirm audit events are generated and client roles cannot tamper with them.
4. Confirm data rights requests cannot cross account boundaries and no user can falsely resolve their own request.
5. Staff must implement verified erasure/correction request procedures, legal retention handling, backup retention rules, clinical review, incident response and independent security testing.
6. Deploy only the verified main branch on Vercel, not stale feature commits.

### Boundaries
v0.5 does not introduce clinical diagnosis, AI triage, prescriptions, verified medical records, automatic Auth account deletion, automatic backend erasure or certified reviewer accreditation.
Source: https://supabase.com/docs/guides/database/postgres/row-level-security

## MamaMwana v0.6 — canonical clinical records and controlled erasure

### Code delivered
- Canonical, versioned PostgreSQL visits, growth measurements and vaccination entries. v0.6 removes the legacy JSONB-to-normalized mirror trigger and rejects old-style clinical array edits; historical JSONB snapshots remain preserved but no longer authoritative.
- Authenticated clinical mutations use one narrowly scoped Supabase RPC (`apply_clinical_change`) with account ownership verification, atomic version check, row locking, validation, and metadata-only audit events. Direct client writes to normalized clinical tables are revoked.
- Frontend hydrates journeys from canonical clinical tables, creates and edits clinical entries through the versioned RPC, and refreshes after optimistic-lock conflicts rather than overwriting another session's edits.
- Ordinary journey persistence omits clinical arrays and distinguishes inserts from updates. If v0.6 canonical records cannot load, an authenticated user sees a migration error rather than an empty first-time onboarding screen.
- Two-person authorization for erasure requests and a server-only Supabase Edge Function at `supabase/functions/process-erasure/index.ts`, disabled by default. No service-role key is placed in browser code.
- CI unit tests for canonical-row hydration, optimistic lock conflict identification, and no clinical-array leakage in profile writes. An opt-in *real database* integration test exercises two test users, RLS, version retries and audit metadata.

### Required upgrade sequence and deployment gates
**Nothing has been run on a MamaMwana Supabase project.** Back up the database and test the full chain of v0.1–v0.6 scripts against a disposable dedicated database. Existing v0.5 installations apply only `supabase/migrations/20261024_000006_v06_authoritative_clinical.sql` after checking migrations v0.1–v0.5.

Only after SQL migration tests pass and users have upgraded their clients should `main` be deployed to Vercel. An old client will be unable to write the legacy clinical JSONB fields; forcing an old build on a v0.6 database risks failed writes.

### Safe erasure operator instructions
Read [docs/ERASURE_RUNBOOK.md](docs/ERASURE_RUNBOOK.md). The erasure executor MUST remain disabled until staff authorization, independent approvals, backup retention and lawful-basis review are in place. Deleting a Supabase Auth user cascades appropriately configured database rows but does NOT erase archived backups, external processors or already-exported JSON files. An accountable staff process remains mandatory.

### Automated tests
`npm run typecheck`, `npm run test`, `npm run build` execute in GitHub Actions. The database-level tests in `tests/clinical.integration.test.ts` run ONLY with `MAMA_TEST_CONFIRM_DISPOSABLE=true` and dedicated `MAMA_TEST_*` secrets for two disposable test accounts and a fixture journey. Do not use real users or production credentials.

### Pending
Live Supabase migration execution, independent RLS integration test results, browser/mobile E2E, Vercel deployment, medical review, legal compliance assessment, and erasure function activation. These are not demonstrated by a passing Vite build.

## v0.7 — Private Care Planner & Visit Preparation

### Shipped to the codebase

- New **My care planner** navigation destination with three caregiver-authored item types: questions to ask clinicians, things to prepare for a visit, and personal follow-up actions. Optional association to an actual visit already recorded in the journey, due dates, written notes and open/completed states.
- A responsive activity dashboard, quick-start editable suggestions, filtered lists, completed/reopened status and deletion confirmation. **No automatic medical decisions, appointments or push notifications.**
- **Private visit brief:** locally compose current open questions and follow-ups, scoped to the chosen recorded visit (plus general items). Clipboard export requires explicit confirmation; there is no automatic network sharing or medical-record certificate.
- New owner-isolated `public.care_plan_items` table with strict RLS, server-side title/content constraints, version-bumped updates for optimistic concurrency and metadata-only audit via protected `public.care_plan_events`.
- Signed-in users see only server-loaded private records. Demo data is ephemeral and in-memory. Every failed write shows an error; stale version conflicts force a reload rather than silently overwriting a newer item.
- Unit tests validate care-plan drafts, sorting, scoped visit summaries and multi-line text handling.

### Required migration and database validation

Before deploying this authenticated UI, apply `supabase/migrations/20261025_000007_v07_care_planner.sql` to a **disposable, backed-up** MamaMwana test database after successful migrations v0.1 through v0.6. The migration does not intentionally modify existing maternal/child journey data.

No MamaMwana database was connected for this work. Backend RLS and trigger behavior are **not verified by GitHub TypeScript CI**. Required security tests: two test accounts must be unable to list/create/update/delete one another's plans or audit events, versioned concurrent updates must reject stale writes, a care item cannot be reassigned to a different owner or journey, and on-delete cascades must preserve remaining journeys.

### User privacy and clinical limitations

All care questions and notes are caregiver-authored and educational. They are not diagnoses, appointments booked with a provider, treatment plans or prescriptions. Clipboard content can be read by other apps, so only copy into trusted channels. If no migration has been applied, the app will not claim records are saved; do not use real patient data until clinical and data-protection review has been completed.

### Deployment dependencies

v0.7 depends on v0.6 canonical clinical API and should be deployed after v0.6 data migrations have been verified. Vercel deployment and live Supabase testing were not performed by this release branch.

## v0.7 premium interface refresh (October 2026)

The full screen system now uses a consistent botanical design palette, an improved icon set, elevated cards, expressive editorial headings, and handwritten-style visual accents in a few short headings. Instructional, clinical, and form text remains a readable system sans-serif. The typography uses system/local fonts only—**no third-party font request or personal health context is sent to a font CDN**.

The app layout and navigation were refined on small phones, tablets, short-height laptops, desktops, and narrow panes. Sidebar navigation is scrollable without hiding sign-out, and five mobile quick-navigation destinations include the Care Planner. Page context appears in the top bar; the mobile menu supports Escape and accessibility attributes. The responsive layer lives in `src/premium.css` and is loaded after v0.7 styles to avoid altering clinical and data-rights behavior.

Design tokens:
- forest `#153f36`, botanical green `#277b5e`, warm ivory `#faf9f4`, coral `#c07567`, lilac `#76678e`.
- System text stack `Avenir Next / Segoe UI / Inter / sans-serif`; display serif `Iowan Old Style / Baskerville / Georgia`; short decorative script `Segoe Print / Bradley Hand / cursive`.
- Safe mobile navigation + container min-width rules, responsive grid breakpoints at 1200/1000/760/570/400 px, small viewport height adaptation, high-contrast and reduced-motion alternatives.

**Verification boundary:** CI checks type safety, unit tests and production build. A successful build is not a guarantee of pixel-perfect rendering. Manually inspect 320, 360, 390, 430, 768, 1024, 1280, 1440 and 1920 px widths, with Safari/iOS, Chrome/Android and desktop browsers. Test longer translated/custom names, zoom to 200%, focus indicators, keyboard tab order, menu/scrolling, complex clinical/timeline tables, and font fallback. Run real-browser visual regression and accessibility audits before production release. All clinical/privacy approval gates remain mandatory and the production project is unchanged.

### Automated UI/layout regression suite

The repository includes real Chromium checks for the interactive demo in `e2e/responsive.spec.mjs`, run automatically from `.github/workflows/ui-responsive.yml` on pull requests. The suite exercises 320, 360, 390, 430, 570, 768, 1024, 1280, 1440 and 1920 px widths. It checks visible card bounds, horizontal document overflow, all main app sections at representative breakpoints, five-item mobile navigation, Escape-to-dismiss, and handwritten fallback typography.

For local development: `npm install`, `npx playwright install chromium`, then `npm run test:ui`. The tests use in-memory demo content and do not create real healthcare records. Browser screenshot/trace artifacts are uploaded only on CI failures. The suite does **not** replace human visual review, zoom/assistive-technology testing, real Auth sessions or medical content/privacy approvals.


## v1.2.1 release polish — October 2026

This refinement preserves the original botanical visual system and all existing care features while increasing Care Journey Hub text legibility, small-screen summary-card space and touch targets. Sensitive visit-brief reveal and copy approval reset when switching the active journey. The private excerpt is excluded from print output, even when visible on screen. Mobile Chromium browser regression coverage checks the refreshed text sizes, interaction controls, and overflow.

**Deployment safety:** Vercel may host the public **demo** with `VITE_AUTH_ACCESS_ENABLED=false`. Do **not** enable live intake of identifiable maternal/child health information or apply pending migrations without independent clinical, legal/privacy, database security, and release signoff. Add public Supabase identifiers only for an approved controlled deployment; never expose privileged keys in client-side environment variables.


## v1.2.2 — Stability and UI Quality (October 2026)

See [docs/V122_STABILITY_UI.md](docs/V122_STABILITY_UI.md) for browser CI recovery, route-level lazy loading, startup entry budget, shared design tokens, release-version consistency, accessibility testing, and retained clinical safety restrictions.


## v1.3.0 — Premium Experience (October 2026)

Improves the Today dashboard hierarchy, groups 13 destinations into three scannable navigation sections, adds local-only care-timeline search/status/sort/detail controls, and extends 320px–desktop responsiveness without altering clinical safety or private-note consent. See [docs/V130_PREMIUM_EXPERIENCE.md](docs/V130_PREMIUM_EXPERIENCE.md).


## v1.3.1 — UI Quality and Device QA (October 2026)

Improves focus-safe mobile navigation, 44px mobile actions, harmonized botanical components, contrast/reduced-motion behavior and Chromium simulated Android/iPhone checks. Physical-device Safari/Chrome and TalkBack/VoiceOver checks remain a separate, unverified release gate. See [docs/V131_DEVICE_QA.md](docs/V131_DEVICE_QA.md). No clinical-data access changes.


## v1.4.0 — Personalized Family Experience (October 2026)

Family-specific journey selection and read-only summaries, editable local display preferences, nonclinical English/Kiswahili interface strings, and clearer two-sided caregiver consent acknowledgements. Clinical Kiswahili content is **not** externally reviewed and remains in English pending authorized independent clinical/linguistic signoff; public deployment remains demo-only. See [docs/V140_FAMILY_CONSENT_A11Y.md](docs/V140_FAMILY_CONSENT_A11Y.md).


## v1.4.0 — unified premium visual consistency (October 2026)

The previously displayed v0.4/v0.5/v0.7 labels are now sourced from the current app version, alongside cohesive botanical icon headers, refreshed clinical timeline/rights/care-planner cards, mobile spacing and release-copy tests. Historical internal component and migration identifiers remain unchanged for compatibility. See [docs/V140_UNIFIED_PREMIUM.md](docs/V140_UNIFIED_PREMIUM.md).
