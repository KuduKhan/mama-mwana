# MamaMwana — Live Product Foundation (public education + real account session)

## Functional changes
- A visitor can open the actual bilingual public learning library **without** creating a synthetic pregnancy or signing in. Existing public lesson downloads and learning quizzes remain available; no patient data is generated or stored.
- If the production Supabase URL and **publishable** browser key are independently configured, Supabase Auth sessions can be established even while the medical-record data gate stays locked. Email confirmation and password recovery flows are implemented in the client and still require independently verified production Auth configuration. A signed-in account enters the public educational workspace and can securely sign out.
- Existing sample journeys remain an explicitly separate optional demonstration for acceptance testing only.

## Unchanged restrictions
- `VITE_AUTH_ACCESS_ENABLED=false` in production: private pregnancy, child, clinical data, caregiver record sharing and medical exports cannot be activated by this branch.
- No new hosted migration, privileged RPC, clinical provider access, FHIR exchange, SMS dispatch, medical AI, real patient data or clinical claims.
- All five v2.1 connected-care services remain LOCKED, and all ten independent v2.0 release gates remain pending.

## Why this does not constitute clinical go-live
Production currently lacks the required **Auth** connection variables and the release still has unsatisfied independent clinical, translation, security, legal/privacy, real-device, recovery, erasure and operational approvals. A real account registration flow cannot safely be marketed as an approved patient portal. Never use real mother/child health details in public learning, optional sample mode or QA accounts.

## Account-only production setup (separate reviewed change)
1. Verify production Auth email verification, approved SMTP sender, safe confirmation/reset URLs, rate limiting, non-sensitive privacy notice, access logging and account support/erasure pathways.
2. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel Production (public values only). Never expose service role/secret keys or use the deprecated anon credential where modern key is supported.
3. Keep `VITE_AUTH_ACCESS_ENABLED=false`, `MM_V21_CLINICAL_NO_GO` and production build guards unchanged.
4. Validate real signup, email confirmation, sign-in, session refresh, sign-out, password recovery, cancellation and cross-account isolation using authorized **synthetic** accounts. Check any problems against current Supabase Auth configuration and privacy notice.
5. Only after these checks, independently review and release account-only mode to a verified production build. Do not accept clinical records.
6. Later, issue #52 is the separate set of ten independent prerequisites for a clinical-data release.

## Acceptance smoke
- `npm run typecheck && npm run test && npm run build`
- `npm run security:v21 && npm run release:rc:status`
- `npm run test:ui -- e2e/live-learning.spec.mjs` in a browser runner
- Confirm accessible keyboard navigation, content source links and bilingual content; account state must be recovered after reload once Auth is configured.
- A READY deployment and green CI are **not** evidence of independent clinical approval.

## Known limitations
Public lessons and Kiswahili medical translations still need independent clinical review before being endorsed as clinical guidance. General quiz progress is saved only on the current device as allowlisted answer indices, is not synced to accounts, and may be cleared from the learning screen. Neither signed-in nor anonymous education has approved private record persistence. Live provider services have not been implemented.
