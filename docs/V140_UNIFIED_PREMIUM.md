# MamaMwana v1.4.0 — unified premium experience

## What was corrected
The platform release is v1.4.0, sourced from package.json. A visual audit identified hard-coded legacy section labels — v0.4 clinical timeline, v0.5 guidance and account-rights requests, and v0.7 care planner — despite the main product displaying v1.4.0.

A shared `CurrentFeatureHeading` now presents an icon-led, accessible header and dynamic release badge for Care Planner, Clinical Timeline, Guidance and Privacy & Records. Account Rights also displays the current application version, and article revisions are identified as **article** revisions rather than app versions.

Obsolete public-facing prompts telling users to apply particular 0.x schema migrations were replaced with current, task-specific connectivity and permissions guidance. The app **does not silently migrate a database** or assert backend security is correct because text changed. The database requires independent versioned migrations and protected RLS tests.

Clinical timeline copy has been corrected: it remains a caregiver-entered / read-only journal projection, not a certified EHR. It does not falsely describe later SQL migrations as future work.

## Visual refinement
- Original cream/sage/peach/lilac branding, icons and typography retained.
- A single additive style layer standardizes card spacing, rounded corners, muted text contrast, outlined focus-visible interactions, hover elevation, icons, timeline cards and action states.
- Existing component class names (v4, v5, care07 etc.) are **internal compatibility selectors**, not visible application releases. Their renaming would risk losing styles and test coverage.
- No change to API calls, authenticated roles, consent permissions, medical guidance, private-note disclosure, or data schema.

## Verification
- TypeScript, security scans, unit tests, build + entry budget, and responsive Playwright 320/390/768/1280px.
- Retain protected two-account Supabase permission suite and manual TalkBack/VoiceOver hardware QA as separate outstanding gates.
- Do not enter real patient information until independently reviewed clinical, legal, privacy and security approval.
