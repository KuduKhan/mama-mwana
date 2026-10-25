# MamaMwana v0.9 — distinct family/child records

## Delivered
- Separate owner-scoped child profiles under a pregnancy journey, allowing twins/multiples.
- Child-specific caregiver measurement and vaccination journals; version-checking update triggers and metadata-only record audit.
- Existing born journeys are backfilled with primary child #1; new birth transitions seed a primary profile.
- Family screen has a selected-child journal; records are not combined across children.

## Critical boundaries
The earlier v0.6 clinical tables still belong to the original journey; v0.9 does **not** silently assign those historical observations to twins. Do not present them as a certified, comprehensive child's record. Reconciliation and a single authoritative clinical view require a further tested migration. Record exports need to include newly normalized family tables before v1.0. Caregiver sharing remains disabled until granular consent, verified identity and RLS tests exist.

## No-go before beta
- Test v0.8 and v0.9 SQL in disposable database; verify all RLS read/write/denial cases using two separate Auth users.
- Test primary backfill, new birth seeding, twins, concurrent edits, cross-family updates, audit, delete cascade and backup restore.
- Clinician safety review, Kenya child-data/privacy compliance, accessibility and device tests.
- Never apply untested migrations to live MamaMwana; existing Supabase project has v0.1–v0.7, not this migration.
