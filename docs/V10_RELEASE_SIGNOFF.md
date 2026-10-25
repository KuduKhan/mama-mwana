# MamaMwana — Clinical, privacy, security and release approvals

**Status: NO-GO for unrestricted patient data.** Do not interpret a green CI run or deployed frontend as approval to operate a health service.

## Independent clinical authorization
- Clinical safety lead (name, professional licence, organization): **PENDING**
- Version and date of reviewed content: **PENDING**
- Signed review covering ANC, postpartum, newborn danger signs, growth charts, immunization timetable, emergency escalation and record-language clarity: **PENDING**
- Independent Kiswahili medical translation, back-translation and signoff: **PENDING**
- Protocol for reviewing new sources and superseding outdated material: **PENDING**

## Kenyan privacy and legal assessment
- Identified data controller, processor arrangements, ODPC registration applicability and designated contact: **PENDING**
- Documented lawful basis and child guardian-authority verification for recording/sharing child data: **PENDING**
- Completed DPIA covering health and child data, data residency, cloud subprocessors and transfer safeguards: **PENDING**
- Reviewed privacy notice, specific sharing authorization, informed revocation, access/correction/erasure requests and defined retention periods: **PENDING**
- Approved incident response, backup/restore testing and breach reporting: **PENDING**

Authoritative references:
- https://www.odpc.go.ke/wp-content/uploads/2024/02/ODPC-Guidance-Note-on-Processing-of-Health-Data.pdf
- https://www.odpc.go.ke/wp-content/uploads/2025/11/ODPC-%E2%80%93-Guidance-Note-for-Processing-Childrens-Data.pdf
- https://www.odpc.go.ke/rights-of-a-data-subject/
- https://certification.dha.go.ke/regulatory-guide

## Engineering signoff
- MamaMwana Supabase v0.1–v0.9 migrations: **APPLIED**.
- Rollback-only SQL synthetic two-owner RLS + trigger checks: **PASSED** for v0.8/v0.9.
- Authenticated end-to-end API test with two verified real signup sessions: **PENDING**.
- New reconciliation and sharing migrations v1.0 hardening: **NOT APPLIED, SQL validation pending**.
- Security-advisor privileged clinical RPC reviewer approval: **PENDING**.
- Auth leaked-password protection: **NOT ENABLED** at last observed check.
- Vercel production project and READY commit: **VERIFIED**; production health Auth is disabled/no production Supabase variables.
- Tested recoverable full SQL backup restoration and recovery time target: **PENDING**.
- Real-device accessibility and full Kiswahili clinical material signoff: **PENDING**.

## Governance signatures (required, not simulated)
**Clinical reviewer:** Name ______ Registration/licence ______ Signed ______ Date ______

**Data controller/privacy lead:** Name ______ Organization ______ Signed ______ Date ______

**Security/release owner:** Name ______ Test report ______ Signed ______ Date ______

**Release decision:** NO-GO until signed evidence is filed. Never fill these fields based on automated checks.
