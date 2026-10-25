-- MamaMwana v0.7: private care coordination plans and write auditing.
-- Prerequisites: dedicated Supabase instance with all v0.1–v0.6 migrations.
-- This is caregiver journaling, not clinician-prescribed care or a medical record.
begin;

create table if not exists public.care_plan_items(
 id uuid primary key default gen_random_uuid(),
 journey_id uuid not null references public.journeys(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('question','preparation','follow_up')),
 title text not null check(length(btrim(title)) between 3 and 160),
 detail text not null default '' check(length(detail)<=1200),
 state text not null default 'open' check(state in ('open','done')),
 due_on date,
 visit_source_id text check(visit_source_id is null or length(visit_source_id) between 1 and 128),
 version integer not null default 1 check(version>=1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists care_plan_items_by_owner_journey
 on public.care_plan_items(owner_id,journey_id,state,due_on);
create index if not exists care_plan_items_visit
 on public.care_plan_items(journey_id,visit_source_id);
alter table public.care_plan_items enable row level security;
revoke all on public.care_plan_items from anon,authenticated;
grant select,insert,update,delete on public.care_plan_items to authenticated;
drop policy if exists "care owners read items" on public.care_plan_items;
create policy "care owners read items" on public.care_plan_items for select to authenticated
 using(owner_id=(select auth.uid()) and exists(
  select 1 from public.journeys j where j.id=journey_id and j.owner_id=(select auth.uid())
 ));
drop policy if exists "care owners create items" on public.care_plan_items;
create policy "care owners create items" on public.care_plan_items for insert to authenticated
 with check(owner_id=(select auth.uid()) and exists(
  select 1 from public.journeys j where j.id=journey_id and j.owner_id=(select auth.uid())
 ) and version=1 and state='open');
drop policy if exists "care owners update items" on public.care_plan_items;
create policy "care owners update items" on public.care_plan_items for update to authenticated
 using(owner_id=(select auth.uid()) and exists(
  select 1 from public.journeys j where j.id=journey_id and j.owner_id=(select auth.uid())
 ))
 with check(owner_id=(select auth.uid()) and exists(
  select 1 from public.journeys j where j.id=journey_id and j.owner_id=(select auth.uid())
 ));
drop policy if exists "care owners delete items" on public.care_plan_items;
create policy "care owners delete items" on public.care_plan_items for delete to authenticated
 using(owner_id=(select auth.uid()) and exists(
  select 1 from public.journeys j where j.id=journey_id and j.owner_id=(select auth.uid())
 ));

create or replace function private.version_care_plan_item()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.owner_id is distinct from old.owner_id
  or new.journey_id is distinct from old.journey_id
  or new.id is distinct from old.id
  or new.created_at is distinct from old.created_at then
  raise exception 'MM_CARE_IMMUTABLE: cannot reassign a care item';
 end if;
 if new.version <> old.version + 1 then
  raise exception 'MM_CARE_CONFLICT: refresh the item before editing';
 end if;
 new.updated_at := now();
 return new;
end $$;
drop trigger if exists validate_care_plan_version on public.care_plan_items;
create trigger validate_care_plan_version before update on public.care_plan_items
 for each row execute function private.version_care_plan_item();

-- Metadata-only audit, not a duplicate of sensitive notes or questions.
create table if not exists public.care_plan_events(
 id uuid primary key default gen_random_uuid(),
 journey_id uuid not null references public.journeys(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 item_id uuid not null,
 actor_id uuid,
 action text not null check(action in ('INSERT','UPDATE','DELETE')),
 from_version integer,
 to_version integer,
 happened_at timestamptz not null default now()
);
create index if not exists care_plan_events_owner_time
 on public.care_plan_events(owner_id,journey_id,happened_at desc);
alter table public.care_plan_events enable row level security;
revoke all on public.care_plan_events from anon,authenticated;
grant select on public.care_plan_events to authenticated;
drop policy if exists "care owners read audit metadata" on public.care_plan_events;
create policy "care owners read audit metadata" on public.care_plan_events for select to authenticated
 using(owner_id=(select auth.uid()));

create or replace function private.audit_care_plan_item()
returns trigger language plpgsql security definer set search_path='' as $$
declare
 v_journey_id uuid := case when tg_op='DELETE' then old.journey_id else new.journey_id end;
 v_owner uuid := case when tg_op='DELETE' then old.owner_id else new.owner_id end;
 v_id uuid := case when tg_op='DELETE' then old.id else new.id end;
begin
 if tg_op='DELETE' and not exists(
   select 1 from public.journeys j where j.id=v_journey_id
 ) then return old; end if;
 insert into public.care_plan_events(journey_id,owner_id,item_id,actor_id,action,from_version,to_version)
 values(v_journey_id,v_owner,v_id,auth.uid(),tg_op,
   case when tg_op='INSERT' then null else old.version end,
   case when tg_op='DELETE' then null else new.version end);
 return coalesce(new,old);
end $$;
revoke all on function private.audit_care_plan_item() from public,anon,authenticated;
drop trigger if exists audit_care_plan_item on public.care_plan_items;
create trigger audit_care_plan_item after insert or update or delete on public.care_plan_items
 for each row execute function private.audit_care_plan_item();

comment on table public.care_plan_items is
 'Caregiver-entered questions and followups. No diagnosis, treatment recommendation, prescription, or clinician attestation is made by this table.';
comment on table public.care_plan_events is
 'Owner-readable append-only metadata of edits without duplicating sensitive care plan text.';
commit;
