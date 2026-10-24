-- MamaMwana v0.2: non-destructive migration, run AFTER the v0.1 foundation.
begin;
drop index if exists public.one_journey_per_user_v1;
alter table public.journeys
  add column if not exists feeding_logs jsonb not null default '[]'::jsonb,
  add column if not exists wellbeing_entries jsonb not null default '[]'::jsonb;
alter table public.journeys
  drop constraint if exists journeys_feeding_logs_array,
  drop constraint if exists journeys_wellbeing_entries_array;
alter table public.journeys
  add constraint journeys_feeding_logs_array check (jsonb_typeof(feeding_logs) = 'array'),
  add constraint journeys_wellbeing_entries_array check (jsonb_typeof(wellbeing_entries) = 'array');
create index if not exists journeys_owner_created_idx on public.journeys (owner_id, created_at desc);
comment on table public.journeys is 'v0.2: owner-scoped longitudinal pregnancy/newborn journeys, one child per journey. Normalized children and clinical observations are future work.';
commit;
