# MamaMwana v1.0.1 — Original Visual Design Quality Gate

## Scope

This is an **incremental accessibility and navigation maintenance release**, not a visual redesign. The original v1.0 botanical artwork, hero orbit, colors, handwritten decorative accents, cards, shadows, spacing language, mobile navigation and all clinical features remain.

### Implemented

1. **Text legibility:** Darken specific small secondary labels on white cards and bump selected captions to 12px. Preserve backgrounds, font families, handwriting style, accent tones and component geometry. Restore readable date text on compact screens (previously icon-only at <=520px).
2. **Mobile content fitting:** Allow panel headings, long greetings, user-entered words and date badges to wrap at small widths. Retain original art and responsive grids.
3. **Navigation history:** Only the **public page key** is stored in browser history; no patient ID, note, child detail or clinical data is serialized to URLs or navigation state. Android/browser Back and Forward now restore the prior page, with native scrolling respecting reduced-motion settings.
4. **Keyboard access:** A focus-visible Skip to main content link and tab order/focus rings. Warning and birth dialogs receive focus on opening, trap Tab and Shift+Tab, close with Escape, and return focus to the previous control.
5. **Visual QA:** New Playwright tests verify unchanged signature gradients and script fonts, card shape, demo-only original art; numeric 4.5:1 minimum contrast for selected body labels; 320px date labels and long names; Back/Forward navigation; dialog focus behavior. CI uploads demo screenshots at 390px and 1280px for human review, not automated pixel goldens.

## Acceptance and limits

- Existing responsive suite exercises the onboarding and up to 12 app sections at 320, 360, 390, 430, 570, 768, 1024, 1280, 1440 and 1920px.
- The additional maintenance suite targets browser history and accessibility interactions that the original suite omitted.
- Screenshots are **synthetic demo** data only and expire after 3 days in CI.
- Screenshot capture alone is **not** a pixel-diff visual regression baseline; human side-by-side review is required before claiming visual equivalence. A formal golden image approval process can be added later.
- A simulated Chrome viewport is not equivalent to testing physical Android devices, iPhone Safari, screen readers or real 200% OS accessibility text zoom.
- The existing partial Kiswahili interface is preserved; **clinical translations must undergo independent clinical review**, not automatic expansion.
- Healthcare security, Supabase migrations, caregiver permissions, real-patient auth and emergency advice are **unchanged**. Production `VITE_AUTH_ACCESS_ENABLED=false` stays in force.
- Vercel production activation requires an appropriately authorized deployment. A successful GitHub CI build is not proof that the URL is updated.

## Source baseline

The latest exact pre-Studio source restoration on `main` was commit `ab3b66d77a598dc788c818dac9655ec711acf339`, whose tree matched the original v1.0 baseline. All present maintenance diffs must be reviewed against that commit to prevent cosmetic drift.
