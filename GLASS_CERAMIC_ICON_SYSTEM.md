# MamaMwana glass-ceramic icon language

This iteration is presentation-only. It does not change Supabase, authentication, journals, reminders, health guidance, clinical interpretation, release gates, or consent boundaries.

## Architecture

- `src/ui/GlassCeramicIcon.tsx`: accessible reusable React/TypeScript primitive with Lucide vector silhouettes, a dimensional edge, a gloss highlight and a botanical color map. No animation engine, textures, WebGL, canvas or remote assets.
- `src/ui/glass-ceramic.css`: light/dark material tokens, studio lighting, optical depth, hover/press/focus/selection and motion preferences, adaptive icon sizing and forced-colors fallback.
- `src/ui/navigation.ts` remains the source of truth for navigation labels, targets and Lucide glyphs. `toneForTab()` provides only a decorative color mapping. Every major section is covered.
- Semantic navigation labels remain real text in the owning button. Icons are `aria-hidden` by default; pass `label` only when an icon has no adjacent semantic text. Icons never receive their own keyboard focus.

## Usage

```tsx
import {Baby} from 'lucide-react';
import {GlassCeramicIcon} from './ui/GlassCeramicIcon';

// A real button and visible text supply the accessible name.
<button type="button" onClick={openBabyJournal}>
  <GlassCeramicIcon Icon={Baby} tone="rose" size="lg" />
  <span>Baby journal</span>
</button>

// Standalone artwork may be named explicitly.
<GlassCeramicIcon Icon={Baby} tone="rose" label="Baby" mode="symbol" />
```

Tones: sage, teal, rose, peach, amber, lilac, blue. Sizes: xs, sm, md, lg. Modes: tile (major destinations) and symbol (compact utility locations).

## Safeguards

- Keep emergency, warning and danger-sign presentation unmistakable; the ceramic accent must not imply a diagnosis, safety assessment, certification, or positive health status.
- Never replace labels with decorative 3D artwork, suppress focus outlines, animate while motion reduction is enabled, or shrink a control's touch target below 44px.
- Decorative embellishment should be reduced for tiny dense controls. Maintain existing flat, familiar utility icons for form actions and clinical warning controls.
- Preserve all readable text and route semantics; do not use the icon palette as the only source of status information.

## Review matrix

1. Light, dark and system theme.
2. English and Kiswahili strings with long labels.
3. 320px, 360px, 390px, tablet, laptop and desktop widths at 100% and 200% zoom.
4. Android touch navigation, 44px tap targets, keyboard Tab/Enter and visible focus.
5. `prefers-reduced-motion: reduce`, user-set reduced motion, forced-colors and high-contrast display options.
6. Screen reader: nav item announces one textual name; decorative SVG not duplicated.
7. Slow device: no extra rendering frameworks or unnecessary activity.
8. Verify `npm run typecheck`, `npm test`, `npm run build`, browser visual QA and all release acceptance checks before merging.

This work is **not** a claim that the release is clinically or legally authorized; existing fail-closed production gates remain unchanged.
