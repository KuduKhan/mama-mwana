# MamaMwana v0.6 — authorized erasure operations

**Never activate this function for real accounts without a completed legal, clinical, privacy, database and security review.** No MamaMwana Supabase project was available in the connected account. Nothing here has been deployed or run against user records.

## Preconditions

1. Provision an isolated Supabase project seeded with the v0.1–v0.6 migrations, at least two unrelated learner accounts, an appropriate pregnancy journey, and three independent privacy operator accounts.
2. Validate that user A cannot read or alter user B's clinical rows; run the opt-in v0.6 integration tests in `tests/clinical.integration.test.ts` using disposable credentials passed only through protected CI secrets.
3. Approve the lawful basis, data retention, pending clinical/financial/legal holds, external backups, exported files, and breach response procedures with an appropriate data protection professional.
4. Have an authorized database administrator (not an end-user) assign staff to `public.privacy_operators`. Do not grant normal browser users write access to this table.
5. The requester submits an `erasure` item via Privacy & Records. Staff must verify the person's identity using an approved out-of-band method, then mark the specific request as `in_review` through privileged tooling.
6. Two DIFFERENT credential-verified privacy operators must each review the request. Authorized staff enter their distinct UUIDs into `public.erasure_authorizations`, and attest to `legal_hold_checked=true` and `backup_retention_reviewed=true`. Do not check these booleans without doing the actual work.
7. `supabase/functions/process-erasure/index.ts` contains the server-only executor. Deploy this Edge Function with JWT verification enabled and `ERASURE_EXECUTION_ENABLED` **unset** initially. Keep `SUPABASE_SERVICE_ROLE_KEY` exclusively in server-side Edge secrets; NEVER in frontend Vite environment variables.
8. Supply `ERASURE_RECEIPT_SALT` as a securely generated secret of at least 32 characters. Rotate it under a documented retention process; losing the salt prevents linking old pseudonymous receipts to their requests.
9. Only after independent test signoff, set `ERASURE_EXECUTION_ENABLED=true` in the Edge Function's server-side environment. Limit operator endpoint access with monitoring, networking constraints and credential/device security.

## Execute only an independently authorized request

The authorized operator must be signed in with their own Supabase staff session JWT. POST a JSON body like `{ "request_id": "<approved request UUID>", "confirm": "ERASE_APPROVED_ACCOUNT" }` to `functions/v1/process-erasure` with a bearer access token. Do not paste tokens into logs, chats or issue comments.

The endpoint verifies the JWT with Supabase Auth, a current operator assignment, in-review erasure request, two distinct active approvers, hold/retention attestations, and a compare-and-set processing claim. It inserts a pseudonymous processing receipt before calling `auth.admin.deleteUser`, then marks it completed. The response never contains the account ID or personal data.

**Limitations:** Auth deletion removes rows only where foreign keys cascade correctly. It does not automatically erase external processors, downloaded JSON exports, database point-in-time backups, offline archives, or data retained under law. If deletion or receipt finalization fails, authorized staff must investigate and reconcile the partial state. No silent retry or automatic assumption of complete erasure.

## SQL tests

Run `npm run test` and the opt-in `tests/clinical.integration.test.ts` tests against disposable Supabase only. CI unit tests do not execute migrations or verify SQL RLS. Use `supabase db reset` and `supabase test db` under a correctly configured local Supabase CLI to run a full migration and security test suite before enabling erasure.

Source: https://supabase.com/docs/reference/javascript/auth-admin-deleteuser ; https://supabase.com/docs/guides/database/postgres/row-level-security
