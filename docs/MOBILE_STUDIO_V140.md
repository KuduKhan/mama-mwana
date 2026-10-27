# MamaMwana — Mobile Studio (v1.4 desktop-preserving redesign)

## User goal
Deliver mobile parity with the established desktop botanical UI. This is a presentation and responsive-navigation change **only**. No health data, clinical content, authentication roles, Supabase RLS or approval switches changed.

## Mobile decisions
- One two-row mobile masthead: 44px menu, canonical icon and wordmark, 44px language/preferences in the first row. Current page, preview/private label, and a clearly labeled safety shortcut in the second row. Family navigation remains in the accessible sidebar and footer; no five-way crowding in a single header row.
- A floating, safe-area aware, five-destination mobile dock with active selection, consistent touch targets and clear labels.
- Shared rhythm: 12–20px phone gutters; 16–22px botanical card rounding; legible 13px descriptive copy; rebalanced Today, hero and metrics layouts. Larger title treatment and softer, hierarchy-preserving elevation.
- Reworked mobile sidebar header, section navigation and help card, with inert hidden drawer and focus trapping retained.
- Forms, clinical timeline, family cards, planner actions and safety dialog obey narrow containers; floating bottom bar no longer obscures footer.
- The desktop header/sidebar/cards are not changed. `mobile-studio.css` only includes media rules at `max-width:760px`, and is imported last to resolve legacy responsive cascade conflicts.

## Quality gates
- Chromium Playwright: 320/360/375/390/430/540/760px, landscape 667x375, desktop 1366px preservation.
- Verify accessible 44px header targets, absence of target overlap and horizontal scroll, menu focus, page navigation, warning dialog, preferences and bottom dock.
- Existing 320–1920 responsive suite, unit/security/typecheck/bundle CI remain required.
- Physical iOS Safari, VoiceOver, Android Chrome, TalkBack and browser-zoom/manual device QA remain unverified until an authorized hardware pass.
- Controlled nonclinical preview: real health records remain disabled in Production until legal, medical, privacy and two-account security gates are approved.
