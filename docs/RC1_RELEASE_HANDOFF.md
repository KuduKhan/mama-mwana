# MamaMwana 2.0.0 RC.1 — Controlled Release Acceptance / v2.1 Backend Contracts

**RC.1 means engineered acceptance candidate, NOT authorized clinical production.**
As of this source revision: ten independent signoffs PENDING; official DHA scope decision, independent specialist assessment, hosted v12 erasure migration, actual encrypted hosted backup/restore, field RTO/RPO and physical VoiceOver/TalkBack acceptance NOT VERIFIED.

## Release freeze
- Feature scope frozen after beta.12; fixes limited to defects, security, accessibility, recovery and acceptance evidence.
- Maintainers run `npm run release:rc:status`, `npm run release:v2:status`, `npm run release:v2:privacy-safety`, `npm run release:v2:acceptance-packet`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run quality:bundle`, `npm run quality:routes`, `npm run quality:experience`.
- CI must pass on exact RC source commit, plus Chromium 320–1440px, Android/Chromium and iOS/WebKit emulation, independent physical mobile devices, accessibility keyboard/screen reader testing and authorized account-isolation cases.
- No downgrade or bypass of `scripts/clinical-release-boundary.mjs` or `requireConnectedCareAuthorization()`. A green CI never enables clinical production.
- Defects and evidence use protected reviewer vault; public GitHub can contain work packages and sanitized non-clinical test receipts, never PHI, passwords, private audits or raw exploit reports.

## Required real-world acceptance procedures (pending)
1. Name independent maternal, pediatric and Kiswahili clinical reviewers and formally authorize their work. Review source version, translations and red flags, signing precise revisions.
2. Commission Kenya privacy/DPIA and DHA applicability classification. Obtain written legal decision, registration/contracting evidence, and any appropriate regulator/facility approval.
3. Independent scoped penetration test: case ownership, caregiver expiry/revocation, SECURITY DEFINER RPCs, JWT/session freshness and sensitive API authorization. Close/retest all blocking findings.
4. Cost-authorized, encrypted **hosted** Supabase backup in isolated target. Verify schema, Auth users/roles, Storage, RLS, triggers, extensions, audit/redaction and data integrity. Record RTO and RPO as *measured numbers*, never synthetic estimates. Enforce destruction/retention controls.
5. Only after (4), use a separately reviewed operations change to apply staged migration `supabase/migrations/20261029_000012_v12_recipient_erasure_fk.sql` to hosted staging, run verified synthetic erasure including accepted invite/owner cascade, and authorize controlled deployment to hosted production.
6. Independent actual Android TalkBack, iPhone VoiceOver, zoom, keyboard, switch-control and Kiswahili text growth acceptance; provide real device and OS metadata.
7. Complete incident response, secure SMTP, no-PHI telemetry, role provisioning, authorized provider workflows, support SLAs and rollback rehearsals.
8. Collect all 10 original gates in independently protected evidence vault, clinical/privacy/security/release owner signatures on exact deployment commit and config. Applicable DHA approvals and facility legal authorization separately verified.

## v2.1 Connected Healthcare (locked contract foundation)
Types and human-review contract schemas exist for clinician workspace, pediatric growth reference, consented communications, referral coordination and FHIR/HIE integration in `src/lib/connectedCareContractsV21.ts`. Every contract is backend-only and LOCKED; their source is intentionally **not** an API, data pipeline, provider integration, algorithm, caregiver authorization system or clinical messaging service.

For each connected service: create a dedicated independently reviewed backend + policy/RLS design, synthetic environment, role/consent tests and external approval in its own activation PR. Do not add provider tokens or admin secrets to the Vite browser.

## Stable release condition
**BLOCKED.** Do not change package version to `2.0.0` and do not set clinical approval to GO until independently validated written evidence satisfies the operational, clinical, privacy and regulatory release gate. This candidate intentionally stays `2.0.0-rc.1`.

## RC.1 source regression audit (engineering only)

The CI job runs `npm run security:v21`: the pure `scripts/audit-v21-locked-boundary.mjs` audit and adversarial Node regression tests. It checks the five v2.1 locked source contracts, rejects unexpected browser integration primitives, verifies ten pending independent gates, prevents unreviewed version and hosted-migration claims, and checks the production clinical-data build guard remains present. The audit uses repository source and sanitized release metadata only; it does not read private data or make provider/network calls.

This is **defense in depth**, not proof that all software paths are safe, not a penetration test and not independent clinical, legal, regulatory or device approval. Clinical `NO_GO` and package `2.0.0-rc.1` remain unchanged. No source-level audit can authorize stable release. Only a separately scoped approval and activation process with independently validated evidence can do so.
