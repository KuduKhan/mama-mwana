# MamaMwana v1.0 — acceptance matrix and controlled beta

**CURRENT STATUS: 1.0.0-rc.1 only. Not authorized for real patient data or public healthcare launch.**

## Delivered code
v0.7 private Care Planner and premium responsive UI; v0.8 error recovery, restrictive headers and server-enforced care/visit links; v0.9 multiple-birth child profiles with separately owned observation journals; v1.0 export covering parent journeys, child profiles, child measurement and vaccination journals, private care plans, rights requests and related record audit metadata. Export fails without producing a partial JSON file.

## Mandatory go/no-go evidence
- [ ] In disposable Supabase, apply v0.8 and v0.9 migrations after the deployed v0.1–v0.7 schema. Test rollback, verified backups and actual restoration.
- [ ] Real two-account signed-in RLS tests across journeys, child profiles, child observations, care plans, clinical rows, metadata audit and rights requests. Include denied mutations and stale-version updates.
- [ ] Independently review the authenticated SECURITY DEFINER clinical RPC and all privileged audit triggers.
- [ ] Test primary-child backfill, future birth seeding, twins, old-record non-misattribution, concurrent sessions, pagination and entire export.
- [ ] Verify Vercel team access, production config, commit, security headers, email confirmation, session behavior, password protection and monitoring with no health data in logs.
- [ ] Test keyboard, 200% zoom, Safari/iOS, Android Chrome, screen reader, low bandwidth and accessible emergency guidance.
- [ ] Qualified independent clinicians sign off on sources, warnings, milestones, growth and vaccination content.
- [ ] Kenyan privacy counsel assesses child/health data, parental authorization, data-controller/ODPC obligations, DPIA, supplier/transfer terms, data rights, breach response and retention.
- [ ] Authorized release owner signs controlled beta approval and documents a tested rollback path.

## Explicitly not yet built or proven
Full Kiswahili/localization and reviewed health translations; granular caregiver sharing/consent; harmonization of legacy primary-child clinical data into the new per-child model; secure push delivery; independent safety/regulatory certification; production QA evidence.

## Version and deployment rule
Keep the source label `1.0.0-rc.1` until every required gate is documented. Do not automatically merge draft PRs or apply untested migrations. The banner intentionally warns users that the candidate is not ready for live medical data.
