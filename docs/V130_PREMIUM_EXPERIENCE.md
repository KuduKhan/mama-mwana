# MamaMwana v1.3.0 — Premium Experience

## Scope
Premium presentation, not a clinical feature or privacy-policy change. Retains botanical palette, artwork, typography, journal semantics, and private-note reveal/copy controls.

### Daily dashboard
A new top-priority strip shows three destinations: today's personal care checklist, next planned journal visit, and care journey. Each action navigates to a working existing section and uses in-memory selected-journey context. No automated medical conclusion is implied by due dates or checklist completion. Previous hero illustration, health-warning shortcut, care cards and source links remain.

### Navigation
All 13 existing destinations remain accessible, now grouped under Daily essentials, Family & milestones, and Records & support. Page names and route IDs are unchanged. Browser history still includes only public page IDs, never patient or journey identifiers. Mobile bottom navigation, menu Escape dismissal and skip link remain. Group headers and new Today actions have English/Kiswahili UI labels.

### Care journey
In-memory search, planned/recorded/confirm status filtering, newest/oldest ordering and collapsible detail/source disclosure. Filters clear when switching journeys. Search text and selections are never included in URL, localStorage, exported notes, or Supabase state. Private visit notes remain behind deliberate reveal and explicit copy consent; no private preview appears in print.

### Responsive and accessibility
New scoped CSS handles 320px–desktop widths, ≥44px primary touch targets, visible keyboard focus, strong text contrast and reduced motion. The browser suite checks new actions, grouped navigation, statuses, disclosure and mobile/tablet reflow.

### Gate and patient-data restrictions
Run client-secret and SQL authorization scans, TypeScript, domain unit tests, build + startup JS budget and Chromium browser suite. The existing restricted clinical, privacy and database security review is still required before real user data intake. Keep VITE_AUTH_ACCESS_ENABLED=false for public demo; no database migration, new data collection or remote analytics is part of this release.
