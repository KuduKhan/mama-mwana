# MamaMwana beta.12 — Low-bandwidth and accessibility hardening

- Split public LibraryPage, FamilyIntelligence/VisitPreparation and FamilyExperience/VisitFollowThrough into distinct lazy-loaded chunks. Preserve existing Suspense error/retry fallback, auth boundaries and navigation behavior.
- Documented machine-checkable Vite manifest and CI assertions for these route chunks, with per-feature 250 KiB generated JS budget and existing 500 KiB main-entry budget. These are **build-size** budgets, not measured field network speeds.
- Introduced optional data-saver display based on navigator.connection.saveData and effectiveType (2G), and CSS prefers-reduced-data. Never hide medical warnings, text, controls or accessibility indicators to save data.
- Added 320px visual reflow and keyboard smoke tests; keep all existing cross-engine/browser emulation and verified local GoTrue isolation.
- Existing `ConnectionStatusV16` already gives an offline safety message. Private clinical data, user records and authenticated endpoints remain excluded from demo caching.

Out of scope: offline patient records, real Android hardware and network throttle lab certification, production observability vendor integrations; these require independent approvals.
