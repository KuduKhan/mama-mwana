# MamaMwana — clinical, privacy, mobile and engineering release signoff

**Live status on 29 October 2026: DEMO ONLY; NO-GO FOR REAL PATIENT DATA.**
Do not interpret green CI, deployed screenshots, or installed migrations as authorization to operate a clinical service.

## Independent clinical and translation authorization (human review)
- [ ] Registered maternal/newborn care reviewer identified: name, licence number, organization and signed scope
- [ ] Content/version reviewed: ANC, postpartum, neonatal danger signs, vaccination schedule, WHO growth references, escalation and record interpretation
- [ ] English content independently signed and localized Kiswahili clinical content independently back-translated and approved
- [ ] Documented procedure to update clinical source citations and retire old advice

## Kenya privacy and legal authorization (human review)
- [ ] Data controller and processor organizations identified; ODPC registration applicability determined
- [ ] Guardian authority, consent scope, invitation/expiry/revocation and rights/erasure process legally reviewed
- [ ] Data Protection Impact Assessment for maternal/children's records, cloud hosting, subprocessors, transfer and data residence completed
- [ ] Patient-facing privacy notice, retention schedule, data deletion, incident response and breach process approved
- [ ] Tested encrypted backup and full restoration, RPO/RTO, Auth configuration and access-control continuity approved

## Engineering gates
- [x] Eleven hosted SQL migrations applied, including legacy links and caregiver invitations — confirmed in migration history 29 Oct 2026
- [x] Current production Vercel health client remains fail-closed / demo-only — production environment names audited, no production Supabase URL/key
- [x] Advisor inspection and explicit table/function privilege audit — see [SECURITY_POSTURE_20261029.md](SECURITY_POSTURE_20261029.md)
- [x] Local GoTrue two-session clinical/care-plan/family/caregiver RLS tests: **11/11 passed** plus both disposable accounts deleted with cascade cleanup — [CI run 40785256481](https://github.com/KuduKhan/mama-mwana/actions/runs/40785256481). Local-only, not hosted penetration approval.
- [ ] **Hosted v12 erasure hardening migration** (recipient FK cascade plus owner-audit cascade guard) after encrypted backup restore, change review and approved release. Source staged, local security tests pass, hosted still at 11 migrations.
- [ ] Independently reviewed privileged clinical/caregiver SECURITY DEFINER RPC exposure, expiry, ownership, concurrency and audit
- [ ] Complete physical iPhone/Android accessibility evidence — see [DEVICE_HARDWARE_ACCEPTANCE.md](DEVICE_HARDWARE_ACCEPTANCE.md)
- [x] Emulated iPhone WebKit and Android Chromium browser-engine checks: **5/5 each** — [CI run 40785256459](https://github.com/KuduKhan/mama-mwana/actions/runs/40785256459). Not physical-device acceptance.
- [ ] Hosted test environment with independently verified client sessions, rollback/expiry security and authorized signoff, if required
- [ ] All Supabase Auth security notices assessed and resolved/explicitly accepted before go-live
- [ ] Restore drill with recovery metrics, tester and data controller authorization
- [ ] Authorized clinical + legal/privacy + security release signoffs below

## Independent signatures (required; never simulated)
Clinical reviewer: ______________ Licence/organization: ______________ Signed/date: ______________

Privacy/legal lead: ______________ Organization: ______________ Signed/date: ______________

Accessibility QA lead: ______________ Physical test evidence IDs: ______________ Signed/date: ______________

Security/release lead: ______________ Hosted Auth/restore evidence IDs: ______________ Signed/date: ______________

**Release decision:** NO-GO. The operator must make a new explicit authorization decision after all evidence is available.

## References
- https://www.odpc.go.ke/rights-of-a-data-subject/
- https://www.odpc.go.ke/wp-content/uploads/2024/02/ODPC-Guidance-Note-on-Processing-of-Health-Data.pdf
- https://www.odpc.go.ke/wp-content/uploads/2025/11/ODPC-%E2%80%93-Guidance-Note-for-Processing-Childrens-Data.pdf
- https://supabase.com/docs/guides/auth/password-security
