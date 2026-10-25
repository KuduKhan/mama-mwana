# MamaMwana v1.2 — Care Journey Hub

**Build status:** Release candidate; merge only after CI and interactive browser checks pass.

## User value

MamaMwana already has pregnancy, care planning, appointment records, wellbeing journals and newborn tracking. V1.2 adds one read-only **Care Journey Hub** which assembles entries from the currently selected pregnancy/baby journey.

- Unified chronological event feed from appointments, birth entry, newborn measurements, immunization entries, feeding logs and wellbeing checks.
- Filters for all, appointments, baby/growth and wellbeing; paginated in sets of 8 to avoid massive mobile lists.
- Upcoming *planned* appointments from user-entered records, with explicit instructions to confirm directly with the clinic.
- A deliberately limited visit-preparation excerpt containing a name, user-entered due/birth dates, upcoming or recently attended visits and up to three recorded growth measurements.
- The excerpt is hidden by default. The user must reveal it and opt into sensitive-information copying. Copying uses the browser Clipboard API only on a direct user action; if access fails, the preview remains available for manual selection.
- The visit excerpt deliberately excludes wellbeing notes, detailed clinic visit notes, immunization specifics, separate child profiles, medication, allergies, external records and diagnoses. It is **NOT** a certified healthcare handover or medical record.

## Privacy & clinical release boundary

- Existing journey data is read in React memory; no new API requests, database tables, persistent storage, analytics, device permissions or sharing links are introduced.
- This view never infers a missed visit, a vaccine due, medical deterioration or a clinical diagnosis. Past visits not marked attended are labelled **Confirm status**, not 'missed'. Immunizations are user-entered and unverified.
- The original v1.0 botanical styling, gradients, typography, handwritten accent and art remain untouched. The new hub uses its own scoped stylesheet.
- Production health-data access remains disabled with `VITE_AUTH_ACCESS_ENABLED=false`. Do not apply pending v0.10/v0.11 migrations or invite real patients as part of this feature.
- Separate child-profile tables, and clinical facts outside the selected journey, remain intentionally outside this hub. Future integrations need independent security and consent review.

## Quality gates

1. TypeScript, all Vitest domain/security tests and production bundle.
2. Browser journeys: 320/390/768/1440px, filter interactions, clinic visit propagation and visit-preview permission gate.
3. Original v1.0 UI screenshot/contrast and mobile navigation tests remain required.
4. Human visual review on a physical Android device and iOS Safari; clinical and Kenya data-protection reviews remain separately pending.

**Release limitation:** No offline patient-data caching or third-party export is introduced. Mobile screenshots from automated Chromium are not equivalent to physical-device acceptance. The user's on-device clipboard is outside app control after an explicit copy action.
