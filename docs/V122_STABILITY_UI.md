# MamaMwana v1.2.2 — Stability and UI Quality

## Purpose
Stabilize automatic visual checks, reduce startup JavaScript, consolidate design tokens and release labelling, and expand accessible regression coverage. Retain the original botanical colors, hero illustration, typography and clinical/privacy boundaries.

## Implementation
- UI browser job runs on `ubuntu-24.04`, avoiding incompatible Chromium installation under Ubuntu 26.04 for pinned Playwright.
- Removed unsupported `package-manager-cache` input from the Node setup action; checkout avoids stored credentials.
- Non-core React sections use `React.lazy` + `Suspense`, with an accessible loading placeholder. The Care Journey Hub, Care Planner, clinical timeline, care guidance, privacy tools, family children and baby-health section are loaded when accessed.
- A post-build startup JavaScript budget enforces a maximum 500 KiB for the application's main entry file. This is an *uncompressed* per-entry budget; total application JavaScript includes later lazy-loaded chunks and may be larger.
- Shared CSS design tokens now live in `src/design-tokens.css`. Legacy component styles retain compatible cascade and visual appearance.
- The public-facing release label is read from `package.json` by `src/lib/release.ts`, used in the sidebar and the controlled-beta notice.
- Browser tests cover token values, touch targets, keyboard navigation, language semantics and 320px reflow, as well as the previous comprehensive route flow.

## Release gate
Run `npm run security:client`, `npm run security:sql`, `npm run typecheck`, `npm test`, `npm run build`, `npm run quality:bundle`, `npm run test:ui`. Verify GitHub PR CI passes before merging, followed by Vercel deployment checks.

### Safety and privacy
- `VITE_AUTH_ACCESS_ENABLED` remains disabled by default. This release is suitable for a **non-clinical demo** only until external medical, privacy, penetration, and real-account isolation reviews are complete.
- Do not enable production maternal/child health collection or use real patients as test fixtures.
- CI browser scenarios use sample-only, in-memory data. Avoid publishing authenticated health-data traces or screenshots.

## Outstanding
- Lockfile is not committed; adding and validating `package-lock.json` requires a controlled npm install in the development environment.
- Physical-device VoiceOver/TalkBack, iOS Safari, and zoom audits remain manual acceptance steps.
