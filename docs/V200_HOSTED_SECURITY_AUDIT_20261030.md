# MamaMwana hosted security baseline — metadata-only verification

**Assessment date:** 30 October 2026. **Clinical release: NO-GO.**
Evidence sources: read-only PostgreSQL catalog/privilege queries, Supabase Security Advisor and migration history for the dedicated MamaMwana project. **No patient data, health records, secrets or account identifiers queried.**

| Control | Observed baseline | Interpretation |
| --- | --- | --- |
| Ordinary public tables | 23 total, 23 RLS enabled | Defense in depth; effective row-level authorization must be tested separately |
| Anonymous direct SELECT | 0 public tables with anon SELECT grant | Direct table read denied; RPC risk remains separate |
| Public apply_clinical_change RPC | SECURITY DEFINER; empty pinned search_path; anon EXECUTE false; authenticated EXECUTE true | Intentional privileged mutation endpoint; independent reviewer and adversarial testing required |
| Public get_shared_child_summary RPC | SECURITY DEFINER; empty pinned search_path; anon EXECUTE false; authenticated EXECUTE true | Intentional consented read endpoint; expiry, revocation and subject checks require independent review |
| Erasure authorizations/receipts | RLS enabled with no policies | Deliberate service-role-only design; advisor INFO is not a reason to add broad policies |
| Compromised-password protection | Disabled; Supabase advisor WARN | Independent security decision on paid-tier protection or justified alternative before live clinical launch |
| Hosted schema migrations | 11 applied | Source-only v12 erasure FK correction is not hosted |
| Recipient accepted_by foreign key | ON DELETE SET NULL | Documented account-deletion blocker risk; source v12 proposes CASCADE after proper migration review |

## Engineering action register
**P0 / blocked:** Independent privileged-RPC code audit, actual encrypted restore, authorization/erasure testing, signed privacy/legal and clinical review, approved v12 hosted migration, real-device accessibility acceptance.

**P1 / pending:** Auth hardening and leaked-password decision, production monitoring without PHI, staff privileges, SMTP verification, incident response, retention and access-control ownership.

**No changes have been made to the hosted schema or Auth configuration in this phase.** The metadata inventory is a starting point, not an independent penetration test. A new read-only audit must run against the final release candidate.

References:
- https://supabase.com/docs/guides/database/database-advisors
- https://supabase.com/docs/guides/auth/password-security
- https://supabase.com/docs/guides/database/postgres/row-level-security
