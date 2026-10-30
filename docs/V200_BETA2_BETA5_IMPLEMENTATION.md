# MamaMwana v2.0 Preview — beta.2 to beta.5 sequential engineering milestones

This series has **four separate ordered commits** on the same reviewed feature branch. Final application version: 2.0.0-beta.5. Clinical production remains NO-GO and all ten independent signoffs remain pending.

## beta.2 — Premium Experience
- Studio design tokens, persistent system/light/dark preference, smart home summary, searchable sidebar, responsive focus and reduced-motion support.
- Current journey summary and user-entered dates are display-only; no clinical interpretation.

## beta.3 — Family Journey Intelligence
- Demo-only family timeline with event-type filters and search, safe summary projections without copying private notes, open-journey navigation.
- Demo-only appointment question-pack checklist and user-initiated generic text download.
- New signed-in private-account family intelligence and visit kit remain unavailable until independent review.

## beta.4 — Learning & Offline Excellence
- Public general-purpose bilingual EN/SW learning cards, each explicitly unreviewed for medical use and accompanied by external source references.
- Downloadable public learning guide is pre-cached only by the public-demo service worker; private data, authenticated API responses and patient records are excluded.

## beta.5 — Quality, Privacy & Trust
- Permission explanation describes demo-only entries, caregiver consent and clinical release boundary.
- Generic error messages prevent server exceptions leaking into Privacy UI.
- CI release:privacy-safety checker rejects disabled gates, unapproved medical claims and private offline caching.
- Focused Playwright journeys across display theme, navigation, timeline, visit questions, public learning and privacy.

## Deployment conditions
Require typecheck/unit tests, client SQL/release safety, production build/bundle, responsive Chromium, mobile/WebKit emulation and local GoTrue isolation, including successful synthetic cleanup. Device emulations do not count as physical assistive-technology acceptance.

No hosted SQL migration, Auth configuration, clinical production toggle, patient intake, independently approved medical translation, production backup restoration, or real caregiver role changes were performed by this series.
