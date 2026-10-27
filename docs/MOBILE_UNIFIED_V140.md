# MamaMwana Mobile Experience — structural simplification, 27 Oct 2026

## Goals
- Remove repeated phone dashboard data, repeated "Preview" notices, repeated navigation targets, and extra section-label chrome without removing any feature.
- Keep the established premium desktop experience unchanged.
- Consolidate the previous mobile-studio and phone-chrome stylesheet imports into one active `mobile-experience.css`, loaded last after shared component-fit rules. Historical source files are retired.
- Restore a predictable mobile hierarchy: brand/actions and current section in the masthead; single sample-data warning; Today's 3 real actions; illustrated journey summary; only the distinct due-date metric; practical task entry; five-tab dock; drawer for all 13 sections.
- Preserve all safety and consent controls. Hide only **duplicate mobile entry points**, not the features they open: Care Journey remains available in the Today's action and drawer; care/visits are in the Today's actions and five-tab dock.
- Keep the phone footer as canonical brand, expandable full safety/privacy statement and current release; remove footer links that duplicate the 13-item menu. Desktop still has those links.
- Text sizing, long labels, drawers, 44px targets, safe area, accessibility focus and short landscape remain release gates.

## Validation
- New Chromium 320/360/390/430/570/760 checks, accessibility preference, mobile footer/drawer actions, short landscape and desktop regression.
- Existing 13-section fit, all other responsive, keyboard, growth/clinical demo tests retained.
- Physical iPhone Safari/VoiceOver and Android Chrome/TalkBack still require device QA and screenshots. No medical/patient-data access gates changed.
