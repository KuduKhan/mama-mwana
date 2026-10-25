-- MamaMwana v1.0 hardening: explicit, owner-confirmed attribution of historical
-- journey-level observations to a specific child. Records are never copied.
begin;
create table public.family_legacy_links (
 journey_id uuid not null references public.journeys(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('growth','immunization')),
 source_id text not null check (length(source_id) between 1 and 128),
 child_id uuid not null references public.family_children(id) on delete cascade,
 confirmed_by uuid not null references auth.users(id) on delete cascade,
 confirmed_at timestamptz not null default now(),
 version bigint not null default 1 check(version>=1),
 primary key(journey_id,kind,source_id)
);
create index family_legacy_owner_child on public.family_legacy_links(owner_id,child_id);
alter table public.family_legacy_links enable row level security;
revoke all on public.family_legacy_links from anon,authenticated;
grant select,insert,update,delete on public.family_legacy_links to authenticated;
create policy "owners read reconciliations" on public.family_legacy_links for select to authenticated
 using(owner_id=(select auth.uid()) and exists(
  select 1 from public.journeys j where j.id=journey_id and j.owner_id=(select auth.uid())
 ));
create policy "owners create reconciliations" on public.family_legacy_links for insert to authenticated
 with check(owner_id=(select auth.uid()) and confirmed_by=(select auth.uid()) and version=1
  and exists(select 1 from public.family_children c where c.id=child_id
   and c.journey_id=journey_id and c.owner_id=(select auth.uid()))
 );
create policy "owners revise reconciliations" on public.family_legacy_links for update to authenticated
 using(owner_id=(select auth.uid()))
 with check(owner_id=(select auth.uid()) and confirmed_by=(select auth.uid())
  and exists(select 1 from public.family_children c where c.id=child_id
   and c.journey_id=journey_id and c.owner_id=(select auth.uid()))
 );
create policy "owners remove reconciliations" on public.family_legacy_links for delete to authenticated
 using(owner_id=(select auth.uid()));

create table public.family_legacy_link_events (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 journey_id uuid not null references public.journeys(id) on delete cascade,
 kind text not null,
 source_id text not null,
 from_child uuid,
 to_child uuid,
 actor_id uuid,
 action text not null check(action in ('INSERT','UPDATE','DELETE')),
 happened_at timestamptz not null default now()
);
create index family_legacy_event_owner_time on public.family_legacy_link_events(owner_id,happened_at desc);
alter table public.family_legacy_link_events enable row level security;
revoke all on public.family_legacy_link_events from anon,authenticated;
grant select on public.family_legacy_link_events to authenticated;
create policy "owners read reconciliation history" on public.family_legacy_link_events
 for select to authenticated using(owner_id=(select auth.uid()));

create or replace function private.validate_family_legacy_link() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='UPDATE' and
  (new.journey_id is distinct from old.journey_id
   or new.owner_id is distinct from old.owner_id
   or new.kind is distinct from old.kind
   or new.source_id is distinct from old.source_id) then
  raise exception 'MM_LINK_IMMUTABLE';
 end if;
 if new.confirmed_by is distinct from auth.uid() or auth.uid() is null then
  raise exception 'MM_LINK_UNAUTHORIZED: account confirmation required';
 end if;
 if not exists (select 1 from public.family_children c
  where c.id=new.child_id and c.journey_id=new.journey_id and c.owner_id=new.owner_id) then
  raise exception 'MM_LINK_CHILD: chosen child not part of this pregnancy';
 end if;
 if (new.kind='growth' and not exists(
   select 1 from public.child_measurements m where m.journey_id=new.journey_id
   and m.source_id=new.source_id and m.owner_id=new.owner_id))
 or (new.kind='immunization' and not exists(
   select 1 from public.child_immunizations v where v.journey_id=new.journey_id
   and v.source_id=new.source_id and v.owner_id=new.owner_id)) then
  raise exception 'MM_LINK_SOURCE: historical record not found in this pregnancy';
 end if;
 if tg_op='UPDATE' and new.version<>old.version+1 then
  raise exception 'MM_LINK_CONFLICT: refresh before reassigning';
 end if;
 new.confirmed_at:=now();
 return new;
end $$;
revoke all on function private.validate_family_legacy_link() from public,anon,authenticated;
create trigger validate_legacy_link before insert or update on public.family_legacy_links
 for each row execute function private.validate_family_legacy_link();

create or replace function private.audit_family_legacy_link() returns trigger
language plpgsql security definer set search_path='' as $$
declare v_owner uuid;v_journey uuid;v_kind text;v_source text;v_from uuid;v_to uuid;
begin
 if tg_op='DELETE' then
  v_owner:=old.owner_id;v_journey:=old.journey_id;v_kind:=old.kind;
  v_source:=old.source_id;v_from:=old.child_id;
 else
  v_owner:=new.owner_id;v_journey:=new.journey_id;v_kind:=new.kind;
  v_source:=new.source_id;v_to:=new.child_id;
  if tg_op='UPDATE' then v_from:=old.child_id;end if;
 end if;
 if exists(select 1 from public.journeys j where j.id=v_journey) then
  insert into public.family_legacy_link_events(
   owner_id,journey_id,kind,source_id,from_child,to_child,actor_id,action)
  values(v_owner,v_journey,v_kind,v_source,v_from,v_to,auth.uid(),tg_op);
 end if;
 if tg_op='DELETE' then return old;else return new;end if;
end $$;
revoke all on function private.audit_family_legacy_link() from public,anon,authenticated;
create trigger audit_legacy_link after insert or update or delete on public.family_legacy_links
 for each row execute function private.audit_family_legacy_link();
-- Prevent stale links when authoritative historical rows are deleted.
create or replace function private.remove_deleted_legacy_link() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 delete from public.family_legacy_links l
 where l.journey_id=old.journey_id and l.source_id=old.source_id
 and l.kind=case when tg_table_name='child_measurements' then 'growth' else 'immunization' end;
 return old;
end $$;
revoke all on function private.remove_deleted_legacy_link() from public,anon,authenticated;
create trigger remove_growth_attribution after delete on public.child_measurements
 for each row execute function private.remove_deleted_legacy_link();
create trigger remove_immunization_attribution after delete on public.child_immunizations
 for each row execute function private.remove_deleted_legacy_link();

comment on table public.family_legacy_links is
 'Owner-confirmed attribution only; original clinical record remains authoritative. Not independently clinician verified.';
commit;
