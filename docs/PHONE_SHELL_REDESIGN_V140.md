# MamaMwana v1.4.0 — Phone Header & Footer Redesign

## Mobile structure
- Header, first row: 44px menu control; scalable canonical logo and MamaMwana wordmark as a single lockup; 44px English/Kiswahili selector; 44px accessibility settings.
- Header, second row: readable current-section title with ellipsis only for genuinely long names, plus dedicated 44px urgent-health-information control.
- Non-demo saving/private state remains clearly visible. In demo mode the redundant Preview chip is omitted; the non-saving **Sample data only** notice remains present below the header.
- Footer: compact full-color brand mark, MamaMwana name/tagline, version chip, and native disclosure for medical/privacy boundaries.
- All desktop header and footer content is preserved; mobile-only footer replaces the previous hide/show styling of desktop columns. No redundant phone footer nav.
- Safe area clearance for fixed navigation preserved *outside* the footer.

## Design acceptance
- Clean, uncluttered botanical visual hierarchy, consistent 14–15px header text, soft sage and cream surfaces, precise borders, recognizable coral safety icon.
- No clipping or overlap at 320, 360, 375, 390, 430, 570, and 760 CSS pixels.
- 44px hit targets and keyboard-focus visibility; 320px modal focus and full 13-section menu preserved.
- Portrait + short landscape and 1366px desktop regressions required before merge.
- Unit/type/security/build/bundle and Chromium responsive CI remain release gates.
- Physical iPhone/Android screen-reader QA and live clinical-data authorization tests remain outstanding.
