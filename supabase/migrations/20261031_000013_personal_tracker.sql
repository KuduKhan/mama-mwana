-- MamaMwana personal tracker — independent of clinical journeys/privileged RPCs.
-- Intended use: personal notes, caregiver-entered progress and user-scheduled reminders.
-- Not a diagnosis, medical interpretation, clinician verification or facility integration.
-- Deploy ONLY after production restore, account confirmation, privacy and synthetic RLS
-- acceptance are independently verified; never automatically enable the frontend flag.
begin;
create table if not exists public.personal_tracker_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('journal','progress','reminder')),
  subject text not null default 'family' check (subject in ('mother','baby','family')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  details text not null default '' check (char_length(details) <= 2000),
  recorded_on date not null default current_date,
  value_number numeric(10,2) check (value_number is null or (value_number >= 0 and value_number <= 100000)),
  value_unit text not null default '' check (char_length(value_unit) <= 24),
  remind_on date,
  completed boolean not null default false,
  source_kind text not null default 'self' check (source_kind in ('self','provider_supplied')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mm_tracker_no_unpaired_value check (
    (value_number is null and value_unit = '') or
    (kind = 'progress' and value_number is not null and value_unit <> '')
  ),
  constraint mm_tracker_reminder_has_date check (kind <> 'reminder' or remind_on is not null),
  constraint mm_tracker_no_extra_remind_date check (kind = 'reminder' or remind_on is null),
  constraint mm_tracker_no_progress_value_on_other_kinds check (kind = 'progress' or value_number is null),
  constraint mm_tracker_no_completion_outside_reminder check (kind = 'reminder' or completed = false)
);
create index if not exists mm_personal_tracker_owner_date
  on public.personal_tracker_items (owner_id, recorded_on desc, created_at desc);
create index if not exists mm_personal_tracker_owner_remind_on
  on public.personal_tracker_items (owner_id, remind_on)
  where kind = 'reminder' and completed = false;
alter table public.personal_tracker_items enable row level security;
alter table public.personal_tracker_items force row level security;
-- Idempotent reinstallation is safe when this migration is applied only once.
drop policy if exists mm_tracker_owner_select on public.personal_tracker_items;
drop policy if exists mm_tracker_owner_insert on public.personal_tracker_items;
drop policy if exists mm_tracker_owner_update on public.personal_tracker_items;
drop policy if exists mm_tracker_owner_delete on public.personal_tracker_items;
create policy mm_tracker_owner_select on public.personal_tracker_items
  for select to authenticated using (owner_id = (select auth.uid()));
create policy mm_tracker_owner_insert on public.personal_tracker_items
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy mm_tracker_owner_update on public.personal_tracker_items
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy mm_tracker_owner_delete on public.personal_tracker_items
  for delete to authenticated using (owner_id = (select auth.uid()));
-- Explicit grants: no anon, PUBLIC, other existing clinical tables, or privileged RPC.
revoke all on public.personal_tracker_items from public, anon, authenticated;
grant select, insert, update, delete on public.personal_tracker_items to authenticated;
commit;
