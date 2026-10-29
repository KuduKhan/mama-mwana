# MamaMwana v2.0.0 — Production Care Platform readiness (NO-GO)

**Assessment date:** 30 October 2026  
**Production release authorized:** **NO**  
**Current live product:** v1.6.0 safe demo (once merged and deployed). The Vite production clinical build guard remains intact.

## Purpose
A staged production-readiness evidence register, not a clinical deployment or compliance certification. Never equate a successful CI build, self-filled manifest, staging RLS tests or visual polish with approval to handle real patient/child health information.

## Independent signoff gates
1. **Clinical and pediatric safety:** Qualified named maternal and child-health reviewers sign current guidance, danger signs, postpartum escalation, education content, source versions, country applicability and risk mitigations.
2. **Bilingual clinical accuracy:** Named independent clinician and professional Kiswahili medical editor validate translations and approve source/content versions; unreviewed language cannot be marked clinically approved.
3. **Kenya privacy and legal:** Independent counsel and privacy lead assess ODPC regulatory position, DPIA, children's information, guardian verification, lawful basis, data minimization, retention/deletion, processor agreements, incident reporting and consent provenance.
4. **Penetration and backend security:** Independent pentest; privilege/RLS, SECURITY DEFINER functions, account isolation, token/session checks, consent forgery, export and erasure audit. Document severity, owner, corrective work and verified closure.
5. **Data isolation:** Two or more verified production-like users and cross-account/child/caregiver boundary tests, signed results, replay protections, revocation, expiry, deliberate denial of anonymous RPC access. Use synthetic data only.
6. **Encrypted restore:** Exercise actual encrypted point-in-time backup to isolated authorized infrastructure; document recoverability, RTO/RPO, decryption, restore of Auth/RLS/roles, logs and data destruction.
7. **Migration approval:** Hosted v12 recipient account-erasure FK correction remains staged and not remotely applied. Require independent privacy/security review, restore rehearsal and controlled migration rollout.
8. **Physical accessibility:** Signed device QA per docs/DEVICE_HARDWARE_ACCEPTANCE.md: iPhone Safari/VoiceOver, Android Chrome/TalkBack, tablet and desktop, screen magnification, keyboards, 200–400% zoom, emergency dialogs and 320px reflow.
9. **Operations:** Named release owner; production Auth+verified SMTP; least-privilege reviewer roles; security logging without PHI; support and incident-response drills; safe escalation, retention and breach workflows.
10. **Final release approval:** Every independent signoff references the exact candidate commit, production configuration, release decision and rollback plan. Record real reviewer identity, date, evidence location and signature.

## Stop conditions
- No live patient data intake, hosted schema activation, background clinical notifications or clinical AI until all ten gates are independently signed and reviewed.
- Do not change \`VITE_AUTH_ACCESS_ENABLED\` in Production. The existing \`vite.config.ts\` block deliberately fails production builds that try to enable clinical access.
- Public demo offline caching must be retired and re-reviewed before clinical activation; do not cache PHI in a service worker, localStorage or browser notifications.
- Never add real patients to test accounts, CI logs, screenshot artifacts or unencrypted exports.
- No clinician, privacy lead, legal counsel or physical-device tester signature is simulated or inferred.

## Operator commands
- \`npm run release:v2:status\` — prints outstanding gate list without changing access or making a compliance claim.
- \`npm run release:v2:authorize\` — **intentionally fails closed** until a separately reviewed release process exists; a JSON file never authorizes release on its own.
- \`npm run typecheck && npm run test && npm run security:client && npm run security:sql && npm run build\` — necessary engineering checks, not clinical approval.

## Release sequencing
1. Deploy v1.6.0 safely as demo and maintain no-patient-data gates.
2. Collect independent signed clinical, bilingual, privacy/legal, physical-device, penetration and recovery artifacts.
3. Review and roll out v12 account erasure safely in a controlled environment after restore rehearsal.
4. Independently verify evidence, test a production-like environment, document risks, and obtain final signed release approval.
5. Only then propose a separate, reviewed v2.0.0 release PR that alters clinical access controls, with rollback and monitoring. This readiness branch **does not** do step 5.
