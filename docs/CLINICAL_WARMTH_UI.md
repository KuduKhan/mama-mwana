# MamaMwana — Clinical Warmth UI quality refinement

## Scope and design
Preserve the verified MamaMwana mother-and-child emblem and clinical safety boundaries. Advance the maternal-care visual language through legible clinical card surfaces, meaningful medical iconography, expressive but restrained handwritten annotation, underline flourish, custom vector care motif, cohesive form controls, and subtle hover and section-motion.

## Mobile language control
The global header retains a native EN/SW select with accessible name "Language / Lugha" but the phone view displays only a 44×44 globe icon. The selector is visually transparent and fills the button; it is not removed from the accessibility tree. The desktop select remains visibly labeled by EN/SW options. Tested in both directions and alongside safety, navigation and display settings.

## Experience polish
- New late-imported `clinical-warmth.css` for consistency rather than rewrites to individual module CSS; establishes shared elevation, focus, icon and surface treatments.
- Updated Home hero with a static decorative maternal-care SVG and a short original handwritten caption, plus a stroke underline SVG beneath handwritten text and section titles.
- Highlighted current-feature headers, charts/clinical records, family cards, planner and privacy sections using a consistent green/cream/coral visual grammar. Icons are styled as meaningful visual anchors rather than decorative clutter.
- Hover lift is pointer-and-hover gated. The floating illustration and underline reveal are disabled by native prefers-reduced-motion and in-app reduced-motion preference. Controls continue to work with keyboard and high-contrast.
- Responsive quality checks cover 320/360/390/430/768/1024/1440px and all 13 feature sections at representative widths. Test the long data forms, toggled menus, and private-state disclaimers. No hidden clinical feature is activated.

## Constraints
No changes to RLS, sign-in availability, live patient data, clinical advice, translations of unreviewed medical content or privacy consent. Device-specific iOS Safari/VoiceOver and Android Chrome/TalkBack remain manual validation gates.
