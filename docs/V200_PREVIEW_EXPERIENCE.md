# MamaMwana v2.0 Preview — Premium Experience and Release Label

**Version:** 2.0.0-beta.1 (visible label **v2.0 Preview**)
**Clinical release:** NO-GO. No authorization for real patient data, clinical workflows, caregiver sharing activation, or hosted migrations.

## Why the app previously displayed v1.6
The UI reads `APP_VERSION` from `package.json`, which remained at 1.6.0 after the v2 readiness and security hardening work. Engineering readiness is not the same as a production clinical v2 release.

## Improvements
- Bump semver to v2.0.0-beta.1 and centralize the display label via `src/lib/release.ts`; sidebar, footer, feature headings and welcome experience use v2.0 Preview. Avoid a misleading full v2.0.0 clinical GA label.
- Add a premium, responsive, accessible home showcase with working Family and Education actions, visible privacy messaging, and sample-data boundaries.
- Refine layout hierarchy, card elevations, responsive containment, buttons, copy rhythm, focus and reduced-motion interaction.
- Refresh public demo offline cache key to ensure old v1.6 shell is retired on service worker activation; no sensitive caching or backend support is added.
- Add unit and Playwright verification of version metadata, clinical NO-GO and 320/390/768/1440px fit.

## Release restrictions
Do not alter `vite.config.ts` clinical build fail-safe, Supabase project, hosted v12 migration, privacy settings, Auth configuration, patient records, medical claims or the ten independent evidence gates. Only a separately authorized and reviewed future clinical release may change those restrictions.
