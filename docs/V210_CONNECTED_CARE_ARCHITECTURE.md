# MamaMwana v2.1+ — Connected Healthcare Services architecture (POST-APPROVAL ONLY)

**Implemented:** a strictly locked, read-only design catalogue and workflow previews under Privacy & records. No new database schema, clinical roles, care-provider accounts, push/SMS/email integration, FHIR endpoint, growth algorithm, referral API or sensitive-data processing.

## Service contracts
| Service | Approved-backend responsibilities before any activation | Independent acceptance |
| --- | --- | --- |
| Clinician workspace | Verified professional and facility identity, assigned case access, explicit scope, audit, review/sign workflows and clinical accountability | Clinical governance, role/RLS and penetration review; clinical operations signoff |
| Child growth interpretation | Governed standard versions, exact measurement and age context, prematurity handling, uncertainty, independent pediatric validation; never diagnose in browser | Reference and algorithm validation, adverse-case tests, clinical reviewer signatures |
| Clinical reminders | Clinician-prescribed schedules, consent capture/expiry/revocation, privacy-neutral delivery, opt-out, delivery idempotency and audit; emergency escalation separate | Content, language, safety, privacy, provider and integration tests |
| Care coordination | Facility identity, assigned referrals, lawful sharing purpose, guardian verification, minimum-necessary exchange, revocation and audit | Legal/clinical approval, verified participants and adversarial testing |
| HIE / FHIR interoperability | Backend gateway, signed provider credentials, DHA and facility-specific permissions where applicable, terminology/FHIR conformance, compartment policies, audit, vendor contracts | DHA/laboratory conformance and facility go-live approvals, integration sandbox with synthetic fixtures |

## Security architecture
Use server-enforced policy, not browser metadata. Never authorize from editable user_metadata, or an unverified clinician badge. Use verified staff enrollment, application-managed role assignment, scoped organization and patient authorization, strict RLS, session freshness, deny-by-default grants, audited provider enrollment, narrowly defined services, and separate service role inaccessible from browser bundles. Do not send patient records into GitHub tests, client logs or third-party telemetry.

Each provider/hospital must have verified institutional approval and contract. All operations have purpose binding, consent where required, explicit expiry, provenance and recorded revocation. The browser must receive only minimum approved data. Export requests must be authorized server-side and independently reviewed before returning any data.

## Sequence after v2.0 clinical release actually approved
1. Establish named clinical, legal, privacy, security and interoperability owners with documented DHA applicability and facility go-live requirements.
2. Specify each service's data contract, safety case, authorized actor matrix, exact tenant/guardian linkage, retention, cancellation and incident handling.
3. Build isolated backend staging with synthetic accounts and data; peer review schema and RLS migrations separately. Keep patient data disabled in production.
4. Perform independent clinical and adversarial validation (including real devices), recovery, monitoring, clinician usability and integration conformance.
5. Obtain signed production authorization and a separately reviewed activation PR scoped to one service; observe and rollback safely before expanding.

## Guardrail in current implementation
src/lib/connectedServicesV21.ts exports five LOCKED services and requireConnectedCareAuthorization, which always throws MM_V21_CLINICAL_NO_GO regardless of any client-provided flags or purported clinician roles. ConnectedServicesReadinessV21 is a public architectural exploration only. It never connects to EHR/HIE services or returns clinical decisions. Production Vite medical-data block remains independently enforced.
