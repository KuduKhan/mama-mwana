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
