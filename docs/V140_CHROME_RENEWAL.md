# MamaMwana v1.4.0 — premium app chrome rebuild

### Problem
The prior phone layout used a large bordered secondary header card, repetitive chrome and a weak footer hierarchy. On 320px devices these surfaces competed for space despite the primary page contents being responsive.

### Changes
- Rebuild **visual hierarchy** of mobile header: one clean brand/control row (44px menu and accessible language/preferences) followed by a quiet border-separated current section, unsaved/private status and 44px safety shortcut.
- Keep the reference mother-and-child icon and wordmark centered within available flexible left-side space; avoid clipping and overlapping the actionable buttons. Keep full wording in the navigation drawer and accessible element labels.
- Compact branded footer: logo and wordmark, one-line supporting caption, native privacy-and-safety disclosure, and live package-sourced copyright/version.
- No repeated footer navigation on phones: five quick nav destinations in the dock; all 13 sections in accessible drawer. Desktop retains explicit footer navigation.
- Maintain safe-area clearance **outside** the footer so mobile dock never overlaps its trust disclosure.
- Improve desktop/tablet footer spacing, link treatment and responsive two-column behavior for intermediate widths, preserving the existing desktop navigation.
- No health-content, credentials, clinical data, Supabase permissions, caregiver sharing, or live-data release switch modifications.

### Validation
- Dedicated Playwright at 320, 360, 375, 390, 430, 570, 760, 768, 1024, 1440 CSS px and 667×375 landscape.
- Test geometric spacing, 44px targets, current-page visibility, drawer and dialogs, alternate language, footer height and dock clearance, as well as 13-section responsive suite.
- Manual physical-device Android Chrome/TalkBack and iOS Safari/VoiceOver must still be checked.
