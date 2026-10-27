# MamaMwana v1.3.1 — Visual consistency, accessibility & physical-device QA

## Release scope
A quality-only release on top of v1.3.0. No new health-record collection, diagnoses, tracking, or database migrations. Keep the restricted patient-data gate off by default.

## Changes
- Harmonize card borders/radii, form heights, focus rings, muted type and mobile spacing using shared design tokens.
- Correct sub-44px mobile topbar/menu/family controls and desktop/sidebar focus surfaces.
- Make closed mobile navigation `inert`, so invisible offscreen links are not reachable by assistive tech or Tab.
- Move focus to the opened drawer close button; wrap Tab/Shift+Tab inside it; return focus on Escape and close; react to portrait/desktop resize.
- Close the drawer before opening the urgent-warning dialog to avoid competing keyboard focus traps.
- Support small-height landscape screens, safe-area insets, reduced motion, high contrast and forced-colors indicators.
- Add Chromium Playwright device-emulation checks for Android/Pixel 7 and iPhone 13 viewport, with *sample-only* screenshots and no patient data.
- Regression tests include drawer keyboard management, warning-modal entry, focus and text contrast, 320–desktop reflow from earlier suites, release label and reduced-motion behavior.

## Test gates
1. GitHub CI: client-secret and SQL contract checks, TypeScript, domain tests, bundle build/initial JS budget.
2. Chromium UI CI: all existing responsive, keyboard, privacy and Care Journey tests plus the new v1.3.1 tests.
3. Vercel: confirm matching commit from GitHub status; direct live domain verification requires authorized access.
4. **Physical-device QA is required and is NOT fulfilled by Playwright device emulation.** Do not assert physical-device pass without manually verified hardware results.

## Physical hardware test matrix (awaiting execution)
| Device | Browser / assistance | Required checks | Status |
|---|---|---|---|
| Android phone, small (~360px) | Chrome + TalkBack | Onboarding, drawer focus, bottom tabs, gestures, text scaling, screen-reader names | NOT RUN |
| Android phone, large (~430px) | Chrome, portrait + landscape | Sideways overflow, keyboard overlay, 44px targets, short landscape modal | NOT RUN |
| iPhone (notched) | Safari + VoiceOver | Safe areas, mobile drawer inert/focus restoration, zoom, inputs/keyboard, sharing | NOT RUN |
| Tablet (8–11 inch) | Safari / Chrome | Sidebar breakpoint, rotation, landscape/portrait and reading order | NOT RUN |
| Laptop/desktop | Chrome, Firefox, Safari/Edge | 200%/400% browser zoom, focus order, keyboard-only completion, forced colors | NOT RUN |

### Acceptance protocol
Use only synthetic/demo sample entries. For each device and orientation, capture screen width/height, OS/browser version, assistive technology, screenshots that include **no personal health data**, contrast or touch failures and signed tester/result. Run screen-reader reading-order assessment, browser text-only zoom and 200%/400% zoom manually. Failure blocks declaring hardware QA complete; track issues in GitHub with a reproducible viewport and steps.

## Boundaries
- Public deployments remain a **non-clinical demo**; do not enable `VITE_AUTH_ACCESS_ENABLED` until independent clinical, legal/privacy, authenticated multi-account security and database releases are authorized.
- Playwright Chromium mobile presets simulate viewport/input/user-agent; they do **not** test Android Chrome on hardware, real iOS WebKit/Safari or actual VoiceOver/TalkBack.
- Browser screenshots are generated using sample-only in-memory demo records and should be handled as internal test artifacts.
