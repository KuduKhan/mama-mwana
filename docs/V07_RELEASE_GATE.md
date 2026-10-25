# MamaMwana v0.7 — release gate & deployment checklist

Status: **BLOCKED — requires project cost confirmation, isolated Supabase migration tests and authorized clinical/privacy sign-off.**

## Ownership and deployment target

- Supabase organization visible to owner: `H4K3R-2000's Org` (`mykvrwbvzxlooekddbnn`). This must be explicitly confirmed by the owner and Supabase may require cost-confirmation even at a quoted $0/month.
- Create a new **MamaMwana** project only. Do not apply a MamaMwana migration to KHANIVERSITY, KhanHomes, or any similarly named Supabase project.
- Selected region: `ap-south-1`, pending operator acceptance of personal data transfer, residency and supplier assessment.
- Existing Vercel project: `mama-mwana` in `mufasa-khans-projects`, framework Vite. As of initial readiness inspection, no configured Vercel environment variables were listed.

## Technical database gates — all must pass on a disposable instance

- [ ] Confirm the dedicated project ID and baseline PostgreSQL version.
- [ ] Apply these scripts in order, recording each applied migration and outcome:
    1. `20261024_000001_foundation.sql`
    2. `20261024_000002_v02_journey_history.sql`
    3. `20261024_000003_v03_child_health.sql`
    4. `20261024_000004_v04_clinical_privacy_review.sql`
    5. `20261024_000005_v05_governance_rights.sql`
    6. `20261024_000006_v06_authoritative_clinical.sql`
    7. `20261025_000007_v07_care_planner.sql`
- [ ] Assert RLS enabled and policy owner checks for `journeys`, `journey_visits`, `child_measurements`, `child_immunizations`, `care_plan_items`, `care_plan_events`, `privacy_preferences`, `data_rights_requests`.
- [ ] Create *two disposable test accounts* through the normal Supabase Auth flow; confirm each owns a different journey and both have verified identities.
- [ ] Prove account A cannot read, insert, update or delete account B's clinical rows, care-plan rows, rights requests or audit records.
- [ ] Prove outdated version writes fail for v0.6 canonical visits, growth and immunizations and v0.7 care-plan rows. Confirm no overwritten records or cross-journey reassignment.
- [ ] Test empty account onboarding, profile edits, care planner create/edit/complete/delete, private visit brief, records export, individual journey deletion, and multi-session refresh.
- [ ] Run manually dispatched `database-security.yml` tests against an explicitly approved disposable instance with protected CI secrets; a successful ordinary CI build does NOT execute this workflow.
- [ ] Review Supabase security/performance advisors and remediate critical findings. Confirm backups, monitoring, appropriate access logging and disaster recovery.

## Human clinical and privacy gates — not automated

- [ ] Identified licensed clinical reviewers approve source accuracy, immunization content, symptom escalation boundaries, and accessible warning/disclaimer UX. Record approving individuals, date, scope and signed outcome.
- [ ] Responsible data controller and privacy counsel assess Kenyan Data Protection Act, ODPC registration, DPIA, child health records, parental/caregiver authorization, cross-border transfers and vendor/processor contracts.
- [ ] Document lawful basis, privacy notice, retention/deletion procedures (including backups and third-party exports), breach response, contact points and access-control incident escalation.
- [ ] Data-rights processing operators are explicitly authorized. Keep the `process-erasure` Edge Function disabled pending separate security/legal sign-off; two-person DB attestations alone do not prove erasure completeness.
- [ ] Obtain a documented production release sign-off from an authorized individual. No assistant, TypeScript CI check, or synthetic test can substitute for this authorization.

## Deployment gates

- [ ] Configure **only public** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the intended Vercel deployment environment. Never place `service_role` or other administrator keys in a Vite variable, GitHub source or browser bundle.
- [ ] Verify `feat/mamamwana-v0.7` CI passed; test the built preview with disposable users against the migrated test database.
- [ ] Confirm Vercel production Git branch `main`, project/team ID, and release commit. Do not redeploy earlier feature branch commits.
- [ ] After migration and human approval, merge PR #6 and verify the deployed commit and `/` app. Run signed-in smoke tests for both user accounts and document rollback.
- [ ] Keep production health data intake disabled until all above checks are recorded as passed.

## Evidence and official references

- Technical PR: https://github.com/KuduKhan/mama-mwana/pull/6
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Kenya ODPC health data guidance: https://www.odpc.go.ke/wp-content/uploads/2024/02/ODPC-Guidance-Note-on-Processing-of-Health-Data.pdf
- Kenya Digital Health Agency certification: https://certification.dha.go.ke/regulatory-guide

**Rule:** Release blockers remain blockers until the named authorized person or independent test result demonstrates completion. Do not mark a checkbox on expectation alone.
