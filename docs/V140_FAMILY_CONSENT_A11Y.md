# MamaMwana v1.4.0 — Personalized Family Experience

## Delivered scope
1. **Family-specific dashboards**: selected-journey overview with direct family switching, due/birth date, and counts of future user-entered appointments. Only in-memory, owner-selected journey data; no new child/clinical fields or cross-profile joins. Existing separate child journals remain isolated.
2. **Display accessibility**: a topbar preferences dialog with focus containment, text size, higher contrast, and reduced motion. Only these three nonclinical values are stored in localStorage on the current browser. No health identifiers are saved with display settings. Preferences reset.
3. **Expanded English/Kiswahili interface coverage**: family overview, quick-switcher, display settings, and caregiver-scope labels. Review scope is **nonclinical UI copy only**; tests verify keys and safe fallback for unreviewed clinical text.
4. **Consent-controlled caregiver experiences**: existing Supabase verified-email, time-limited read-only invitation and narrowly scoped RPC remain unchanged. Owner must attest parental/legal authority **and** acknowledge minimum share scope; recipient must explicitly acknowledge read-only scope before accepting. Child profile changes reset owner draft consent. Leaving/revoking clears currently rendered shared summaries.

## Language review register
| Material | English | Kiswahili | Review status |
|---|---|---|---|
| Navigation / display / family summary UI | Implemented | Implemented | Internal code and test review; independent native-language editorial review pending |
| Caregiver consent overview / checkbox | Implemented | Implemented (additional labels) | Independent legal and linguist review pending; do not rely on translation for legal consent |
| Clinical education / urgent symptoms / danger-sign advice | Existing English | Intentionally still English | **Independent clinical translation and medical approval NOT COMPLETED** |

The existing Kiswahili banner clearly identifies the clinical review boundary. Do not claim comprehensive clinically reviewed bilingual coverage until a named medical/linguistic reviewer signs the content register with source, version, review date and approval.

## Consent and security gate
- Guardian attestation in the UI is **not** verified legal authority.
- Existing database RLS and secure trigger/RPC are authoritative, never UI checkboxes alone.
- Sharing only includes the child name/date of birth and child-specific user-entered growth and immunization entries. No pregnancy, wellbeing, care planner, sibling or clinical narrative data are shared.
- Invitations expire in 7 days and accepted read-only grants expire in 30 days, with owner revocation. No automatic caregiver email delivery.
- Before activating real accounts, execute the protected two-account disposable-database suite: wrong email, unverified recipient, cross-child access denial, access expiry, revocation, revoked summary read denial, and blocked writes. Tests are skipped on ordinary CI intentionally.
- Independent local regulatory/legal review, healthcare safety, guardian authorization process, security signoff and clinical review remain blockers.

## QA
- CI: TypeScript, unit tests, security scans, JS budget, Chromium browser accessibility and responsiveness.
- Real iOS Safari/VoiceOver, Android Chrome/TalkBack and cross-account Supabase runtime tests remain manual/protected acceptance.
- Public app stays a non-clinical demo with `VITE_AUTH_ACCESS_ENABLED=false`.
