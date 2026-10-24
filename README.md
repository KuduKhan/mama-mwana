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
