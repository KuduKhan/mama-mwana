# MamaMwana — v2.0 Independent Acceptance Desk

**Release decision: NO-GO.** Version 2.0.0-beta.10 is a public educational preview, not certified v2.0 clinical production.

## What the engineering release proves
The checked-in docs/V200_ACCEPTANCE_MATRIX.json lists 10 reviewer work packages. GitHub CI produces a strictly sanitized .mamamwana-evidence/v200-acceptance-readiness.json, preserving manifest and matrix SHA-256 digests, commit/run linkage when verified, and pending gate IDs. It records NO_GO and independentApprovalVerified:false even if reviewers self-fill every field. It never generates signatures, records, approval, or patient data.

Operator command: npm run release:v2:acceptance-packet. The packet must never be presented as an external audit, approval, recovery drill or DHA certificate. Artifact retention is limited, and the independent evidence vault must be protected separately.

## Independent work packages and required evidence
1. Clinical: independent obstetric/midwifery, pediatric and emergency professionals review actual versioned guidance, red flags, intervention boundaries and safety cases; sign exact source revisions.
2. Bilingual: appropriately qualified clinician and Kiswahili medical editor validate clinical semantics, red flags and versioned source-to-target mapping; do not infer approval for draft translations.
3. Kenyan legal/privacy: qualified counsel assess applicability of ODPC and DHA requirements, DPIA, guardian identity and minors, lawful basis, consent, retention, erasure, transfer and processor contracts.
4. Penetration: authorized independent assessor performs synthetic-data adversarial testing of authentication, privilege escalation, cross-owner/child, consent spoofing, role/JWT/session freshness and authenticated SECURITY DEFINER RPC behavior.
5. Isolation: verified separate synthetic users and independent reviewer check owner/caregiver revocation, expiry, negative authorization and fixture cleanup in production-like infrastructure; local CI alone does not meet this gate.
6. Recovery: independent exercise restores a real encrypted backup into an approved disposable environment; measure RTO/RPO, inspect keys, roles, Auth, storage references, RLS, triggers and data integrity; destroy fixtures securely.
7. Erasure: only after signed security/privacy/recovery approval, apply and verify v12 recipient erasure FK migration via a separate controlled operational change with restore, rollback and full synthetic account deletion.
8. Devices: physically test real iPhone VoiceOver, Android TalkBack, tablet, keyboard, reduced motion, magnification, 200–400% zoom and narrow reflow; sign reproducible results.
9. Operations: named responders validate secure SMTP and Auth, incident escalation, client privacy, audit logging without PHI, production support, backup policy, monitoring, redaction and rollback drill.
10. Release: independent named clinical/privacy/security/release owner signatures reference the exact tested Git SHA, deployment config, risks and evidenced regulatory approvals, with no outstanding critical findings.

## Gating rules
Clinical production access remains disabled in scripts/clinical-release-boundary.mjs and vite.config.ts. The docs/V200_RELEASE_SIGNOFF.json manifest still says NO_GO and does not become an authorization engine. Changing package version or passing tests never grants permission. Only a **separate reviewed activation PR** after independently verified external evidence and required regulatory go-live authorizations may propose a clinical production release. Do not create or migrate any hosted patient data as part of acceptance preparation.

## Current hosted blockers (read-only check, 30 October 2026)
11 database migrations applied; source-only v12 erasure FK still pending. Supabase security advisor still reports two authenticated SECURITY DEFINER RPCs requiring independent review, two deliberately policy-free service-only erasure tables, and leaked-password protection disabled. These metadata observations are not an exploitation test or proof of certified isolation.

## Regulatory references (verify with qualified Kenyan counsel)
Kenya Digital Health Agency certification: https://certification.dha.go.ke/
Certification framework and regulatory guide: https://certification.dha.go.ke/regulatory-guide
Digital Health (Health Information Management Procedures) Regulations 2025: https://new.kenyalaw.org/akn/ke/act/ln/2025/76/eng@2025-04-11/source
Supabase security advisors: https://supabase.com/docs/guides/database/database-advisors
