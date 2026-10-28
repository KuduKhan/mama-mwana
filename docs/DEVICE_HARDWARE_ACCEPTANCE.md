# MamaMwana — physical-device and assistive-technology acceptance

**Status: PENDING REAL HARDWARE QA — emulators do not complete this sheet.**
Use only the in-memory sample-data demo. Never include names, dates of birth, medical records, private account information or real clinic details in screenshots or recordings.

## Purpose and environment

Record the exact MamaMwana production commit and release, tester name, date/time and locale, device manufacturer/model, OS version, display scaling, browser version, connectivity and viewport, and any third-party keyboard/AT version. Test the actual HTTPS deployment, not only local Vite.

Production demo: https://mama-mwana.vercel.app

## Required physical matrix

| Evidence ID | Device / browser | Required checks | Status |
| --- | --- | --- | --- |
| A1 | Android 360–390 CSS px / Chrome | Globe-only EN/SW control, sample onboarding, all nav items, phone header/footer, scroll, fixed dock, forms, contrast, screenshots | NOT RUN |
| A2 | Android larger ~430 CSS px / Chrome landscape and portrait | Short landscape urgent dialog, Android keyboard overlay, 200% font scale, bottom tabs, tap targets at least 44×44 | NOT RUN |
| A3 | Android / TalkBack | Accessible labels and spoken states for globe, settings, navigation drawer, save state and emergency warning; correct reading order and focus restoration | NOT RUN |
| I1 | Physical notched iPhone / Safari | Safe-area/header/footer, native language select, keyboard and date inputs, navigation, native 200% zoom, landscape, screenshot | NOT RUN |
| I2 | Physical iPhone / VoiceOver | Explore by touch, rotor headings/landmarks, state announcements, focus trap, Escape/close alternatives, emergency dialog and language control | NOT RUN |
| T1 | Physical tablet / iPad Safari or Android Chrome | 760/768 breakpoint, rotate, split-view, footer, input width, focus navigation and text wrapping | NOT RUN |
| D1 | Desktop Chrome/Firefox/Safari/Edge | Keyboard-only navigation, 200% and 400% browser zoom, forced colors/high contrast, reduced motion, screen magnification | NOT RUN |

## Step-by-step scenarios
1. Clear app site storage only if using a dedicated QA browser profile, open demo, confirm sample-data notice and visible privacy restrictions.
2. Complete sample onboarding; do not use personal health information. Screenshot full home and all representative cards.
3. Tap globe on phone, choose Kiswahili, then English; confirm both control usability and explicit clinical translation warning.
4. Open full navigation, visit all 13 sections, try nested forms and long labels. Record any clipped content, horizontal overflow or unreachable controls.
5. Open display preferences; select largest text, high contrast and reduced motion. Retest menus, home, planner, family, privacy, dialogs.
6. Test primary buttons with touch and a hardware keyboard where available; check visible focus and 44×44 CSS pixel target sizes.
7. Test screen-reader name, role, state, reading order, rotor/heading, drawer close focus and urgent-help dialog. Record any trap or inaccessible element.
8. In portrait and landscape, focus date/numeric/text inputs and inspect on-screen keyboard occlusion, safe-area insets and navigation.
9. On desktop and mobile browsers, verify reduced-motion actually suppresses decorative floating and underline animation, and no animation conveys a clinical alert.
10. Close/open the footer's privacy/safety disclosure. Confirm medical-disclaimer text remains readable and the floating dock never covers footer content.

## Evidence record (one per device)
- Evidence ID / issue ID:
- Tester (authorized QA):
- Device / OS / browser / version / viewport / orientation:
- Locale / text scaling / contrast / motion / assistive tech:
- Reference commit and production deployment:
- Screenshots or screen recordings (sample-only, protected):
- Passed controls and failures with exact reproduction:
- Accessibility result (pass/fail/blocked):
- Tester signature / date:
- Independent review signoff / date:

### Exit conditions
**No physical acceptance claim without signed device records and accessibility evidence.**
Any critical issue in urgent care, privacy, caregiver consent, data isolation, input accessibility or 320px reflow blocks signoff.

For the automated *simulation-only* checks use GitHub Actions workflow `mobile-platform-qa.yml`; WebKit on Linux is a Safari-engine proxy, not Safari on a real iPhone. Browser/device emulation does not exercise VoiceOver or TalkBack.
