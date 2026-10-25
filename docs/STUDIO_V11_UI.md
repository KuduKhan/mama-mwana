# MamaMwana Studio v1.1 — Premium UI & Interaction Standard

**Scope:** A single, consistent interface across the existing MamaMwana app; no changes to clinical logic, migrations, medical text, account permissions, or Supabase release state.

## Design language

- **Botanical Garden** is the default: deep forest, soft sage, ivory, warm coral and quiet plum, with editorial hierarchy and subtle depth.
- **Gentle Bloom** and **Golden Morning** are visual-only atmosphere options. Their selection is stored locally as `mamamwana-atmosphere`, and never includes a medical record or personally identifying data.
- Typography uses a system sans family for UI controls, labels and health education, a book-like serif for headings, and a script-like system font only for *decorative accents*. Actual care instructions must never depend on handwriting legibility.
- Lucide icons are semantic and consistent; the care planner uses a notebook/pen, guidance a clinical symbol, and privacy a shield rather than ambiguous AI imagery.
- All interactive controls maintain visible keyboard focus rings, touch targets and reduced-motion support. The high-contrast mode retains panel borders and readable text.

## Navigation

- Persistent sidebar (desktop), off-canvas dismissible navigation (narrow devices), five-item mobile action bar.
- Search icon opens **local-only page navigation**; keyboard shortcut Ctrl+K / Cmd+K. This only filters known page names. No clinical notes or user data are indexed, uploaded or sent to a third-party search service.
- Escape dismisses the command palette and atmosphere menu. A skip link jumps to the main application landmark.
- Appearance customization is a **user preference**, not a patient-data processing feature.

## Responsive and content-fitting rules

| Width | Primary treatment |
| --- | --- |
| 320–370 px | Compact header, icon-first controls, single-column forms and panels, two-up compact metrics |
| 390–570 px | Comfortable cards and readable labels, stacked long forms, child-specific record stacks |
| 571–760 px | Tablet-width adaptive cards, visible mobile quick navigation and safe-area-aware footer |
| 761–960 px | Narrow desktop sidebar; compressed header controls; adaptive data grid |
| 961–1200 px | Comfortable tablet/laptop shell; balanced line length and panel hierarchy |
| 1201–1920+ px | Broader dashboard grid, spacious cards, magazine-style editorial headings |

All nested panels, care planner forms, record lists, long user-entered names, table rows and action groups must remain within their containers. Never solve layout collisions by reducing health education text to unreadable sizes. Text must wrap or surfaces must stack.

## Automated verification

- Existing `e2e/responsive.spec.mjs` retains original 10-viewport navigation/overflow coverage.
- New `e2e/studio-premium.spec.mjs` adds nine-viewport layout checks, visual theme persistence, keyboard command palette and mobile navigation interactions.
- `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:ui` gate the frontend. Any failure blocks merge.
- Device and screen-reader exploratory testing is still recommended before declaring full accessibility compliance.

## Production safety

Production remains **demo-only** with `VITE_AUTH_ACCESS_ENABLED=false`. No migration is applied by this UI work. Healthcare clinical and privacy release signoff remains pending; Vercel deployment quota may block promotion even if GitHub merges.
