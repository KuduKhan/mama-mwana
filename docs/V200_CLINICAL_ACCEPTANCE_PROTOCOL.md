# MamaMwana v2.0.0 — Controlled Clinical Acceptance Protocol

**Current decision: NO-GO.** Engineering hardening and evidence collection are allowed. No live patient onboarding, clinical data activation, erasure executor deployment, hosted migration or medical-language approval is authorized by this document.

## Distinguish evidence from approval
| Class | Mechanism | What it establishes | What it does not establish |
| --- | --- | --- | --- |
| Automated CI | GitHub Actions technical evidence JSON, immutable run link, SHA and job result | Engineering checks completed in the referenced workflow | Pentest, legal, clinical, hardware, restore or production clearance |
| Isolated Auth/RLS | Docker/GoTrue two-user tests with required fixture cleanup | Synthetic local account and caregiver isolation | Hosted patient isolation or independent pen test |
| Live metadata snapshot | Read-only catalog queries and Supabase security advisors | Observed schema, grants, RLS, migration and Auth advisory posture | Security certification or correctness for all data access |
| Independent signed review | Restricted document, reviewer identity, dated scope and hash | Independent verification within that reviewer's expertise | All other release gates |
| Real-world acceptance | Physical devices, synthetic fixtures, isolated encrypted restore | Specific tested real-device and recovery outcomes | Unexecuted scenarios |

## Execution phases
1. Freeze a candidate Git SHA and deployment configuration. Record version, exact tested code, tools, synthetic fixture plan and environment.
2. Run four GitHub CI suites: TypeScript/test/build/security, responsive Chromium, cross-engine mobile emulation, local authenticated GoTrue RLS tests. Only green runs can produce positive technical evidence. Check cleanup in local run logs.
3. Perform read-only database catalog/advisor audit. Independent security reviewer checks every exposed SECURITY DEFINER RPC, Auth access, JWT/session freshness, idempotency, owner isolation, anonymous denial, caregiver expiry/revocation and SQL concurrency.
4. Qualified, independent maternity, pediatric and emergency clinical professionals review and sign all pregnancy/postpartum/newborn education and red-flag material against versioned authoritative sources. Independently verify Kiswahili clinical translations.
5. Obtain Kenyan privacy/legal counsel and specialist review of DPIA, ODPC obligations, child-data handling, guardian identity, lawful basis, retention, erasure, processors, international transfers and breach response. Signed decision only.
6. Independently test threat models and adversarial RLS/IDOR, authentication, consent impersonation, expiry/revocation, privileged RPC and edge functions on **authorized isolated environments with synthetic data**. Close every high/critical defect with retest evidence.
7. Exercise actual encrypted backup and restore in separately authorized disposable infrastructure, including Auth, DB roles, constraints, RLS, policies, functions and any storage/config gaps. Measure RTO/RPO and collect integrity checks. Rollback-only tests do not count.
8. Only after independent restore/privacy/security approvals, schedule the hosted v12 caregiver-recipient FK erasure migration under a separate change, backup, preflight verification, rollback and post-migration account-deletion test. Do not apply it as part of this milestone.
9. Perform real iPhone/VoiceOver, Android/TalkBack, tablet, desktop, keyboard and 200–400% zoom acceptance using **sample-only** data. Sign results per the hardware QA matrix.
10. Independent release owner verifies evidence, signed findings, exact production SHA and configuration, failure rollback plan, runbooks, incident response and clinical owner signoffs. Only after this stage should a new activation PR be proposed for code review.

## Required independent evidence form (one per gate)
- Gate ID and reviewer role/qualifications:
- Exact source commit, environment and deployment:
- Date, process, scope and synthetic-data controls:
- Evidence reference in an approved access-controlled repository and SHA-256, excluding PHI:
- Findings, severity, remediations and dated verification:
- Independent named reviewer + signature:
- Outcome: INCOMPLETE, REJECT, or ACCEPT (default INCOMPLETE)
- Expiry and criteria for repeat review:

A GitHub artifact cannot sign for a human. Human reviewers must not paste patient information, passwords, tokens, connection strings, raw clinical records or sensitive outputs in GitHub issues, PRs, CI artifacts or screenshots.

## Go / No-Go
A failure in danger-sign education, unexpected family/caregiver disclosure, unauthorized access, missing restore proof, inability to delete accounts correctly, insufficient data protection grounds, high/critical pentest findings or missing real-device screen-reader acceptance is NO-GO.

Maintain the source-enforced production clinical gate and V200_RELEASE_SIGNOFF.json as NO_GO. The release:v2:authorize command intentionally refuses authorization. Independent evidence must be genuine and stored safely; the app version remains 1.6.0 until a separately reviewed clinical release is approved.
