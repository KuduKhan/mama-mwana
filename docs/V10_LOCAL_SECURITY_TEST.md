# MamaMwana — Real two-account testing on local Supabase (no paid branch)

This workflow uses the Supabase CLI and a Docker-compatible local container runtime. It does **not** connect to the hosted MamaMwana project and requires no new Supabase paid development branch.

## Prerequisites

- Node.js 22 and the existing MamaMwana repository checked out on the draft release-hardening branch.
- Docker Desktop (Windows), or a Docker-compatible local runtime.
- Local disk capacity and network access to download Supabase container images.
- Development dependencies installed with `npm install`. No additional cloud database project is necessary.

## Run from the MamaMwana repository directory

```powershell
npm install
npx supabase init
npx supabase start
npm run test:local:security
```

Run `npx supabase init` only once, if `supabase/config.toml` does not exist. Later runs only need `npx supabase start` when stopped.

**Do not link to the hosted MamaMwana project.** No `supabase link`, `db push` or hosted project connection is required.

The Supabase CLI automatically discovers `supabase/migrations` in the repository and initializes a local database. The runner reads local keys directly from `supabase status -o env`, refuses any non-loopback API URL, creates two different random verified test users using only the **local** administrative key, seeds one clinical journey, checks birth-to-child creation and runs the existing Vitest integration suites.

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
npx supabase stop
```

Documentation: https://supabase.com/docs/guides/local-development/cli/getting-started
