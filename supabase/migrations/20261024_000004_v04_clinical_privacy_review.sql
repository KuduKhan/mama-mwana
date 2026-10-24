-- MamaMwana v0.4 • additive security-first clinical record read models.
-- Run AFTER 20261024_000003_v03_child_health.sql; DO NOT apply to an unknown project.
-- The original public.journeys JSONB remains the write source in v0.4.
-- Normalized child tables are read-only synchronized projections (one-way from journeys).
begin;
create schema if not exists private;

create table if not exists public.journey_visits (
  journey_id uuid not null references public.journeys(id) on delete cascade,
  source_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  scheduled_on date not null,
  clinic text not null default '',
  notes text not null default '',
  attended boolean not null default false,
  primary key (journey_id, source_id)
);
create table if not exists public.child_measurements (
  journey_id uuid not null references public.journeys(id) on delete cascade,
  source_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  measured_on date not null,
  weight_kg numeric(7,2),
  length_cm numeric(7,2),
  primary key(journey_id,source_id),
  constraint measurements_positive check (
    (weight_kg is null or weight_kg > 0) and (length_cm is null or length_cm > 0)
  )
);
create table if not exists public.child_immunizations (
  journey_id uuid not null references public.journeys(id) on delete cascade,
  source_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  dose_id text not null,
  given_on date not null,
  facility text not null default '',
  note text not null default '',
  primary key(journey_id,source_id)
);
create index if not exists visit_owner_idx on public.journey_visits(owner_id,journey_id,scheduled_on);
create index if not exists measure_owner_idx on public.child_measurements(owner_id,journey_id,measured_on);
create index if not exists immunization_owner_idx on public.child_immunizations(owner_id,journey_id,given_on);

-- Writes to these read models are exclusively performed by the audited trigger below.
-- The function lives outside exposed schemas, uses an empty search_path, and is
-- not executable directly by anon/authenticated clients.
create or replace function private.sync_journey_clinical_records()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.journey_visits where journey_id = new.id;
  insert into public.journey_visits(journey_id,source_id,owner_id,scheduled_on,clinic,notes,attended)
  select new.id,
    coalesce(nullif(item->>'id',''), md5(item::text)),
    new.owner_id,
    (item->>'scheduled_on')::date,
    coalesce(item->>'clinic',''),
    coalesce(item->>'notes',''),
    coalesce((item->>'attended')::boolean,false)
  from jsonb_array_elements(coalesce(new.visits,'[]'::jsonb)) as x(item)
  where item->>'scheduled_on' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';

  delete from public.child_measurements where journey_id = new.id;
  insert into public.child_measurements(journey_id,source_id,owner_id,measured_on,weight_kg,length_cm)
  select new.id,
    coalesce(nullif(item->>'id',''), md5(item::text)),
    new.owner_id,
    (item->>'measured_on')::date,
    nullif(item->>'weight_kg','')::numeric,
    nullif(item->>'length_cm','')::numeric
  from jsonb_array_elements(coalesce(new.growth,'[]'::jsonb)) as x(item)
  where item->>'measured_on' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';

  delete from public.child_immunizations where journey_id = new.id;
  insert into public.child_immunizations(journey_id,source_id,owner_id,dose_id,given_on,facility,note)
  select new.id,
    coalesce(nullif(item->>'id',''), md5(item::text)),
    new.owner_id,
    coalesce(item->>'dose_id',''),
    (item->>'given_on')::date,
    coalesce(item->>'facility',''),
    coalesce(item->>'note','')
  from jsonb_array_elements(coalesce(new.immunizations,'[]'::jsonb)) as x(item)
  where item->>'given_on' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    and nullif(item->>'dose_id','') is not null;
  return new;
end $$;
revoke all on function private.sync_journey_clinical_records() from public, anon, authenticated;
drop trigger if exists mirror_journey_clinical_records on public.journeys;
create trigger mirror_journey_clinical_records
after insert or update of visits, growth, immunizations on public.journeys
for each row execute function private.sync_journey_clinical_records();

-- Mirror every existing journey once; a future migration can replace this with
-- normalized authoritative tables after clients are switched to direct writes.
update public.journeys set visits = visits;

create table if not exists public.privacy_preferences (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  in_app_reminders boolean not null default true,
  guidance_context boolean not null default false,
  updated_at timestamptz not null default now()
);
-- Only database-admin-provisioned reviewers can publish. End-users cannot assign
-- themselves a reviewer role through JWT user_metadata or RLS.
create table if not exists public.clinical_reviewers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  assigned_at timestamptz not null default now()
);
create table if not exists public.education_articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null,
  body text not null,
  source_url text not null,
  topic text not null,
  locale text not null default 'en',
  status text not null default 'draft' check(status in ('draft','in_review','approved','retired')),
  version integer not null default 1 check(version >= 1),
  reviewed_by uuid references public.clinical_reviewers(user_id),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint approved_needs_reviewer check (
    status <> 'approved' or (reviewed_by is not null and reviewed_at is not null)
  )
);

-- Explicit API grants: no anonymous table access; no direct record mirror writes.
alter table public.journey_visits enable row level security;
alter table public.child_measurements enable row level security;
alter table public.child_immunizations enable row level security;
alter table public.privacy_preferences enable row level security;
alter table public.clinical_reviewers enable row level security;
alter table public.education_articles enable row level security;
revoke all on public.journey_visits,public.child_measurements,public.child_immunizations,
  public.privacy_preferences,public.clinical_reviewers,public.education_articles from anon, authenticated;
grant select on public.journey_visits,public.child_measurements,public.child_immunizations to authenticated;
grant select,insert,update,delete on public.privacy_preferences to authenticated;
grant select on public.clinical_reviewers to authenticated;
grant select,insert,update on public.education_articles to authenticated;
drop policy if exists "owners read projected visits" on public.journey_visits;
create policy "owners read projected visits" on public.journey_visits
  for select to authenticated using(owner_id = (select auth.uid()));
drop policy if exists "owners read projected measurements" on public.child_measurements;
create policy "owners read projected measurements" on public.child_measurements
  for select to authenticated using(owner_id = (select auth.uid()));
drop policy if exists "owners read projected immunizations" on public.child_immunizations;
create policy "owners read projected immunizations" on public.child_immunizations
  for select to authenticated using(owner_id = (select auth.uid()));
drop policy if exists "owners manage privacy choices" on public.privacy_preferences;
create policy "owners manage privacy choices" on public.privacy_preferences
  for all to authenticated using(owner_id = (select auth.uid()))
  with check(owner_id = (select auth.uid()));
drop policy if exists "reviewers read own assignment" on public.clinical_reviewers;
create policy "reviewers read own assignment" on public.clinical_reviewers
  for select to authenticated using(user_id = (select auth.uid()));
drop policy if exists "approved content or reviewers read" on public.education_articles;
create policy "approved content or reviewers read" on public.education_articles
  for select to authenticated using(
    status = 'approved' or exists(
      select 1 from public.clinical_reviewers r
      where r.user_id=(select auth.uid()) and r.is_active
    )
  );
drop policy if exists "assigned reviewers create content" on public.education_articles;
create policy "assigned reviewers create content" on public.education_articles
  for insert to authenticated with check(
    exists(select 1 from public.clinical_reviewers r
      where r.user_id=(select auth.uid()) and r.is_active)
    and (status <> 'approved' or reviewed_by=(select auth.uid()))
  );
drop policy if exists "assigned reviewers revise content" on public.education_articles;
create policy "assigned reviewers revise content" on public.education_articles
  for update to authenticated
  using(exists(select 1 from public.clinical_reviewers r
    where r.user_id=(select auth.uid()) and r.is_active))
  with check(exists(select 1 from public.clinical_reviewers r
    where r.user_id=(select auth.uid()) and r.is_active)
    and (status <> 'approved' or reviewed_by=(select auth.uid())));

comment on table public.education_articles is
 'Content is not displayed as reviewed until a database-assigned clinical reviewer explicitly approves it.';
comment on table public.journey_visits is
 'Read-only RLS-secured normalized projection of journeys.visits; JSONB remains source of truth in v0.4.';
commit;
