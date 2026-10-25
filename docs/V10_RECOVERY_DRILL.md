# MamaMwana — backup restoration exercise

**Not complete.** Rollback-only migration tests are not a substitute for restoring a real backup.

1. Identify subscription tier and available backup method in the dedicated MamaMwana Supabase project. Supabase documentation states managed daily backups are included on Pro, Team and Enterprise; Free tier operators should create independent logical dumps.
2. Use an authorized Supabase CLI version (check `supabase --version` and `supabase db dump --help`) to export a schema and data dump over an authenticated, encrypted connection into a protected local backup directory. Never store a database connection string, backup or patient information in GitHub or the browser.
3. Record the backup hash, UTC timestamp, operator, row counts by table, protected storage location and encryption controls. Retain old dumps according to reviewed policy.
4. Provision a **disposable** restore destination with explicit cost authorization. Restore schema, Auth metadata and only synthetic/disposable records, then restore data with the official supported tooling and validate ACLs, RLS, foreign keys and schema migration history. Storage objects and Auth settings may require separate restoration.
5. Use two independently signed-in disposable accounts: verify family journals, visits, vaccines, care plans, child attribution and any caregiver permissions survived the restore without crossing owners.
6. Re-run SQL advisors, typecheck, unit tests, clinical mutation RPC checks and browser smoke. Record recovery point objective (RPO), actual recovery time (RTO), errors and any manual reconfiguration.
7. Drop the disposable destination after documented confirmation and cost review.

**Current evidence:** rollback-only CREATE TABLE/trigger and synthetic RLS assertions passed for v0.8/v0.9; post-rollback user and row counts matched originals. This does **not** satisfy a backup recovery drill.

Docs: https://supabase.com/docs/guides/platform/backups and https://supabase.com/docs/guides/platform/clone-project
