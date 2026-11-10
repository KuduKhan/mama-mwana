# MamaMwana v2.1 — Premium Foundation & Personal Tracker Integrity

## Scope and release boundary
This branch improves the non-diagnostic personal tracker and botanical presentation. It does **not** approve patient-data collection, clinical features, prescriptions, triage, professional interpretation or medical-device claims.

**Clinical release is NO-GO.** Do not enable VITE_AUTH_ACCESS_ENABLED, alter production clinical build assertions, privileged RPCs, patient records, reviewer gates, or the hosted erasure migration.

## Included in this branch
- Dedicated namespaced responsive tracker design layer instead of more global card overrides
- Owner-account tracker create, read, edit, delete; done/pending reminders; clear saving, unavailable and conflict states
- Server-side paginated history (20 rows/page), kind filtering, title search, newest/oldest ordering, manual refresh
- Read-only upcoming reminder dates, without disclosing private notes on external-facing cards
- Opt-in generic date-only calendar export, with no user-entered title, content, names, symptoms or clinic details
- Opt-in complete tracker JSON export; warn users this file is unencrypted and avoid exporting account-owner identifiers
- Compare-and-set on updated_at to reject stale writes rather than silently overwrite concurrent changes
- Fail-closed VITE_PERSONAL_TRACKER_ENABLED==='true' gate, separate from the clinical release switch
- Unit tests for feature-gate strictness, dates, private export/calendar contracts and draft validation

## Tracker availability
The tracker may be rendered only after **all** of these external acceptance gates:
1. Approved Supabase project is online with personal_tracker_entries and strictly scoped owner RLS
2. Synthetic two-account SELECT/INSERT/UPDATE/DELETE access-denial checks, owner spoofing and grant reviews
3. Verified encrypted backup and restore, account recovery and verified email delivery
4. Kenya privacy and children-data lawful-basis review for limited non-clinical journals and data subject requests
5. Independent rollout owner authorizes a distinct production configuration release with VITE_PERSONAL_TRACKER_ENABLED=true

The clinical lock VITE_AUTH_ACCESS_ENABLED=false remains mandatory. The public education and sample-data demonstration may deploy without clinical access.

## Verification required
- npm run typecheck
- npm run test
- npm run build
- npm run security:client
- npm run security:sql
- npm run release:rc:status
- npm run test:ui with Chromium installed
- Physical Android Chrome/TalkBack and iOS Safari/VoiceOver accessibility acceptance
- Approved disposable two-account Supabase integration and backup-restoration exercise

Test at 320, 360, 375, 390, 430, 768, 1024, 1440 and 1920 CSS pixels. Verify keyboard focus, forms, long entries, 200% zoom, loading/error states, keyboard safe areas, both locale settings, reminder completion and pagination.

## Follow-on milestones (not implemented here)
- v2.2: cross-section journey continuity, edit audit trail, scheduled notifications and consent
- v2.3: clinically reviewed Kenya-first content and medical translation, verified immunization references and accessible public learning
- v2.4: caregiver consent and provider coordination only after security/privacy acceptance
- v2.5: clinically governed functions only after the ten independent evidence gates and written authorization

No successful build or automated test constitutes clinical approval.
