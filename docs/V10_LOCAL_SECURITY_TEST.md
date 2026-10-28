# MamaMwana — Real two-account testing on local Supabase (no paid branch)

> **October 29, 2026 update:** All eleven hosted migrations are now applied. This guide still deliberately tests against a completely local Supabase stack; it must **never** connect to the hosted project. An automated local GoTrue two-account test workflow has been added at `.github/workflows/local-auth-security.yml`; its test report is valid only after GitHub Actions completes successfully. See [current signoff](V10_RELEASE_SIGNOFF.md).


This workflow uses the Supabase CLI and a Docker-compatible local container runtime. It does **not** connect to the hosted MamaMwana project and requires no new Supabase paid development branch.

## Prerequisites

- Node.js 22 and the existing MamaMwana repository checked out on the draft release-hardening branch.
- Docker Desktop (Windows), or a Docker-compatible local runtime.
- Local disk capacity and network access to download Supabase container images.
- Development dependencies installed with `npm install`. No additional cloud database project is necessary.

## Run from the MamaMwana repository directory

```powershell
npm install
npm run test:local:prepare
npx supabase --workdir .mamamwana-local init
npx supabase --workdir .mamamwana-local start
npm run test:local:security
```

Run local init only once, if `.mamamwana-local/supabase/config.toml` does not yet exist. Preparation copies the existing eleven SQL source files into this ignored local workspace with 14-digit CLI migration timestamps. This avoids migration-version conflicts and never renames tracked sources or changes hosted migration history. Later runs only need to start the same local workdir.

**Do not link to the hosted MamaMwana project.** No `supabase link`, `db push` or hosted project connection is required.

The Supabase CLI reads `.mamamwana-local/supabase/migrations` and initializes a completely local database. The runner reads local keys directly from `supabase status -o env`, refuses any non-loopback API URL, creates two different random verified test users using only the **local** administrative key, seeds one clinical journey, checks birth-to-child creation and runs the existing Vitest integration suites.

The suites exercise:
- Genuine separate Auth sign-ins via the local GoTrue API;
- Owner vs non-owner clinical table/RPC permissions and optimistic versioning;
- Independent private care-planner rows and audit isolation;
- Twin/multiple child RLS and child-specific measurement/vaccination restrictions;
- Invitation acceptance, read-only sharing and immediate revocation.

Fixture accounts are deleted in a `finally` block, triggering normal cascade deletion of their records. If cleanup fails, do not reuse that disposable local database without inspecting and resetting it.

## Safety and status

**As of 25 October 2026, this local Auth test runner has been committed but NOT executed in this chat environment**, which has no Docker-supported local Supabase runtime or downloadable dependencies. Running the script yourself or through a separately authorized GitHub runner is required to obtain a real, independent-session test report. The earlier rollback-only PostgreSQL impersonation tests passed but do not substitute for this.

- This runner does not restore a backup. A recovery drill remains independently mandatory.
- It must not be pointed at hosted Supabase for any reason. The exact URL must be localhost/127.0.0.1 with HTTP and explicit port.
- It intentionally makes no Vercel deployment and no app Auth enablement changes.
- It requires all local migrations, including the **still-unapplied-on-host** v0.10/v0.11, to succeed locally.
- It uses existing GitHub/Vitest dependencies and runs only when explicitly invoked, avoiding extra recurring CI minutes.

For local stack shutdown without erasing its persisted container volume:

```powershell
npx supabase --workdir .mamamwana-local stop
```

Documentation: https://supabase.com/docs/guides/local-development/cli/getting-started


## 29 October 2026 automated local evidence
[Local GoTrue / two-account GitHub Actions run 40785256481](https://github.com/KuduKhan/mama-mwana/actions/runs/40785256481): **11 passed, zero failed** across four authenticated integration suites and **both disposable accounts successfully deleted**. Supabase was started in Docker on the temporary GitHub runner; local fixture records and Docker volumes were removed. No hosted Supabase credentials or patient records were accessed. The staged v12 FK and family-audit cascade corrections were required to make deletion pass. Do not interpret this result as hosted recovery, production signup or Kenyan clinical/privacy approval.
