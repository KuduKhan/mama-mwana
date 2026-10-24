-- MamaMwana v0.1: private maternal journey with continuous newborn record.
-- Run in a dedicated Supabase project. No service role credentials in clients.
create extension if not exists pgcrypto;
create table if not exists public.journeys (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 mother_name text not null check (char_length(mother_name) between 2 and 80),
 due_date date not null,
 baby_birth_date date,
 baby_name text,
 visits jsonb not null default '[]'::jsonb check (jsonb_typeof(visits)='array'),
 daily_checks jsonb not null default '{}'::jsonb check (jsonb_typeof(daily_checks)='object'),
 birth_checks jsonb not null default '[]'::jsonb check (jsonb_typeof(birth_checks)='array'),
 growth jsonb not null default '[]'::jsonb check (jsonb_typeof(growth)='array'),
 milestones jsonb not null default '[]'::jsonb check (jsonb_typeof(milestones)='array'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint baby_birth_consistent check ((baby_birth_date is null and baby_name is null) or (baby_birth_date is not null and nullif(trim(baby_name),'') is not null)),
 constraint due_window check (baby_birth_date is null or (baby_birth_date between due_date - interval '300 days' and due_date + interval '90 days'))
);
create unique index if not exists one_journey_per_user_v1 on public.journeys(owner_id);
create index if not exists journeys_by_owner on public.journeys(owner_id);
alter table public.journeys enable row level security;
revoke all on public.journeys from anon;
grant select,insert,update,delete on public.journeys to authenticated;
drop policy if exists "owner can read journey" on public.journeys;
create policy "owner can read journey" on public.journeys for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists "owner can create journey" on public.journeys;
create policy "owner can create journey" on public.journeys for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "owner can update journey" on public.journeys;
create policy "owner can update journey" on public.journeys for update to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));
drop policy if exists "owner can delete journey" on public.journeys;
create policy "owner can delete journey" on public.journeys for delete to authenticated using (owner_id=(select auth.uid()));
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists journeys_touch_updated_at on public.journeys;
create trigger journeys_touch_updated_at before update on public.journeys for each row execute function public.touch_updated_at();
comment on table public.journeys is 'One owner-scoped mother-to-newborn journey per account in v0.1. Expand to normalized multi-child models in v0.2.';
