-- MamaMwana v0.3: optional birth metadata and child immunization diary.
-- Safe on existing v0.1/v0.2 records; run after prior two migrations.
-- Records remain account-scoped under the existing journeys RLS policies.
begin;
alter table public.journeys
  add column if not exists baby_sex text,
  add column if not exists gestation_at_birth_weeks numeric(4,1),
  add column if not exists immunizations jsonb not null default '[]'::jsonb;
alter table public.journeys drop constraint if exists journeys_baby_sex_valid;
alter table public.journeys drop constraint if exists journeys_birth_gestation_valid;
alter table public.journeys drop constraint if exists journeys_immunizations_array;
alter table public.journeys
  add constraint journeys_baby_sex_valid check (baby_sex is null or baby_sex in ('male','female','unknown')),
  add constraint journeys_birth_gestation_valid check (gestation_at_birth_weeks is null or (gestation_at_birth_weeks between 22 and 44)),
  add constraint journeys_immunizations_array check (jsonb_typeof(immunizations) = 'array');
comment on column public.journeys.immunizations is 'Caregiver-entered immunization records; not clinician-confirmed vaccine history';
comment on column public.journeys.baby_sex is 'Caregiver-entered sex for selecting WHO sex-specific reference PDFs; nullable';
comment on column public.journeys.gestation_at_birth_weeks is 'Optional clinician-reported gestational age in weeks; not used for automated diagnosis';
commit;
