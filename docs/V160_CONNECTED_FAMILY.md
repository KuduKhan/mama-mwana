# MamaMwana v1.6.0 — Connected Family Experience

## Scope implemented (safe public/demo release)
- A consent-controlled **in-app** notification center driven by the current journey's user-entered visit dates. No operating-system push, email, server scheduler, notification history storage or inferred clinical care schedule. No private notes or clinic names in generated notices.
- Event-driven network status and reconnect warning. The browser's online flag is only a *hint*, not evidence of confirmed backend connectivity or successful synchronization.
- Public-demo-only service worker caches the generic app shell, public favicon/manifest and fingerprinted local assets. It never caches Supabase/Auth/API, patient responses or writes. The shell is registered only when no Auth endpoint is configured. When Auth is configured, the app unregisters demo service workers and purges demo caches.
- An account-scoped family activity timeline derived from existing in-memory journeys. It shows generic event summaries, not private notes or clinical findings, and is never persisted by this component.
- Bilingual interface labels for connected-family components and a transparent public WHO educational source register. **Clinical approval and independent Kiswahili medical translation are pending**, not misrepresented as completed.
- Owner and invited caregiver permission presentation shows granted scope, status, expiry and revocation. Database RLS/RPC checks remain authoritative; visual status does not confer rights.

## Remain disabled
- Live patient-data collection, push/email, background sync, encrypted offline patient storage, new medical rules, AI diagnosis/triage, caregiver rights extension and any hosted migration.
- Service worker support for future live clinical mode requires separate security review and a documented migration plan.
- No reviewed Kiswahili clinical advice is published without independent qualified clinical and language signoff.

## Verification
Typecheck, unit, client and SQL security checks, production build/budget, responsive Chromium, simulated WebKit/Android and isolated two-account RLS remain mandatory. Human physical-device QA is still outstanding.

## v2.0
Release-readiness documentation and fail-closed checks are separate from permission to launch. Production patient-data features must stay blocked until independent clinical, Kenyan privacy/legal, physical accessibility, penetration, backup restoration, isolation, and release-owner signatures are obtained.
