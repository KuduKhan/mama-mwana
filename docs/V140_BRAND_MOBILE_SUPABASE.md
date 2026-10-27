# MamaMwana v1.4 — unified mobile layout, reference-matched logo, footer and Supabase staging

## Scope
- Preserve the mother's embrace and two-child-dot mark shown in the user-supplied reference photo using a crisp, locally-served SVG (`public/icon.svg`) that scales from favicon to desktop header without third-party image requests. The source reference is a raster screenshot; the SVG is a faithful vector styling of the existing MamaMwana icon, not a pixel-identical copy of the screenshot.
- Reuse this canonical icon on sidebar, mobile header, onboarding, sign-up/sign-in, main footer and PWA manifest. Wordmark remains unchanged.
- Fixed-width 44px touch controls, flexible text truncation on tablets, icon-first controls and a minimal 320px layout avoid obscuring the hamburger or clipping text.
- Refined action, metrics and feature cards using shared botanical tokens and contrast-aware focus styles. No health record model changes.
- Rebuild both sidebar and app footer with logo, version, actual navigation actions and clear non-clinical safety text; footer remains visible above safe-area-aware mobile tab bar.

## Supabase connection and safety
The Supabase project is `jkazrgobphetdbfdvotf` (MamaMwana). The application uses **Vite**, so env names must start with `VITE_`, not `NEXT_PUBLIC_`.
A URL + publishable API key allows **account-only** auth operations in controlled previews. It must not grant access to clinical data automatically. `VITE_AUTH_ACCESS_ENABLED=false` remains the default and sets `supabase=null` for all sensitive record operations. Signup/signin can still be displayed through the separate `authSupabase` client when preview credentials are available.
**Do not enable `VITE_AUTH_ACCESS_ENABLED=true` in Production** until independent authorization, clinical, privacy and legal review plus two-account RLS testing pass.

## Database schema and operational status
Repository migrations 000010 (owner-attributed historical child links) and 000011 (verified-email scoped caregiver invitations) have been applied and are RLS-enabled. Earlier migrations were already present. No actual patient records were migrated.
Review Supabase database advisors regularly and remediate any flagged SECURITY DEFINER function exposures and leaked-password protection settings. Maintain owner authorization checks, expiry and audit history on all sharing RPCs.

## Validation outstanding for release of live health-data features
- Confirm Auth Email provider, confirmation requirement, allowed Site URL and redirect allowlist and reliable SMTP; test two new disposable accounts through normal signup and email verification.
- Test two-account ownership denial, caregiver wrong-email denial, select-only shared summaries, revoke and expiry; CI integration security suites require protected disposable test environment.
- Obtain clinical, legal and privacy authorization for real personal data. Direct physical-device Safari/VoiceOver and Chrome/TalkBack remain manual sign-off.
- Preview Vercel credentials must not include Supabase secret or service-role keys; only publishable browser settings.
