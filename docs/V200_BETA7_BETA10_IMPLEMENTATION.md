# MamaMwana — Beta.7 → Beta.10 sequential experience upgrades (October 2026)

**Application:** 2.0.0-beta.10 · visible label v2.0 Preview.
**Clinical production:** NO_GO · 10 independent gates remain pending.
**Release scope:** public educational and demo-only UI; no provider account provisioning, patient onboarding, hosted migration, clinical notification, medical advice, backup approval, DHA submission or private offline persistence.

## beta.7 — Today experience and coherent navigation
- Five mobile destinations: Home, Journey, Planner, Learn and Me. All original 13 product destinations remain accessible in the sidebar; active tab highlights its parent space.
- Added a pure testable next-step projection to Smart Home. Only self-entered checklist status and journal dates are used; nothing is interpreted as a clinician-confirmed appointment.
- Extracted journey selection logic into a small independent pure module for unit testing. No clinical data flow changes.

## beta.8 — Family and visit experiences
- Added a demo-only Family Storybook that composes only generic event kinds and self-entered dates, without raw notes, providers or identifiable details.
- Added a practical sample family-support checklist with component-memory-only progress; no network calls, local storage or private persistence.
- Added a generic post-visit follow-through checklist in the sample visit journal, with no clinical care instructions.

## beta.9 — Public bilingual academy and resilient learning
- Added 4 bilingual public literacy/organization knowledge topics, with immediate explanatory feedback, clear unreviewed medical-content status and cited reference URLs.
- Added a text-first reading toggle, no analytics or account tracking, and an explicit source/consent explanation.
- Added a separate downloadable EN/SW public learning essentials pack and allowlisted it in the demo-only service worker. No private records, authenticated responses, API or patient content are cached.

## beta.10 — Quality, privacy and acceptance
- Added a visible transparent NO_GO quality panel under Privacy showing what is tested and which independent approvals are still outstanding.
- Added static source-level release contract to CI alongside typecheck, Vitest, build and prior security controls.
- Added Playwright regression across five-destination navigation, sample-only storybook, learning questions, trust status and 320/390/768px reflow.
- Kept existing full-width Chromium, WebKit/Android mobile emulation and local GoTrue account-isolation CI gates.

## Remaining mandatory steps before stable/connected clinical release
Independent clinical and Kiswahili review, Kenyan legal and DHA scope verification, external penetration testing, verified multi-account isolation, actual hosted encrypted whole-project restore, separately approved v12 hosted erasure migration, real physical-device accessibility, operational readiness and final independently signed authorizations. All remain **pending**. Future backend clinician workspaces, growth interpretation, notifications and FHIR/HIE integrations remain locked in v2.1 architecture.

Passing automated tests is technical evidence, not medical certification. The separate source-controlled clinical production guard is unchanged.
