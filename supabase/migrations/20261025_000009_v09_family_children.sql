-- v0.9: Separate, owner-scoped child profiles and child-specific health journals.
-- All previous journey and canonical clinical records remain intact.
begin;
create table public.family_children(
 id uuid primary key default gen_random_uuid(),
 journey_id uuid not null references public.journeys(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 birth_order int not null check(birth_order between 1 and 8),
 display_name text not null check(length(btrim(display_name)) between 1 and 80),
 born_on date not null,
 sex text not null default 'unknown' check(sex in ('unknown','female','male')),
 gestation_weeks numeric(4,1) check(gestation_weeks between 22 and 44),
 version bigint not null default 1 check(version>=1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(journey_id,birth_order)
);
create table public.family_growth_entries(
 id uuid primary key default gen_random_uuid(),
 child_id uuid not null references public.family_children(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 measured_on date not null,
 weight_kg numeric(5,2) check(weight_kg between 0.1 and 70),
 length_cm numeric(5,1) check(length_cm between 20 and 180),
 version bigint not null default 1 check(version>=1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(weight_kg is not null or length_cm is not null)
);
create table public.family_vaccine_entries(
 id uuid primary key default gen_random_uuid(),
 child_id uuid not null references public.family_children(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 vaccine_label text not null check(length(btrim(vaccine_label)) between 3 and 100),
 given_on date not null,
 facility text not null default '' check(length(facility)<=100),
 version bigint not null default 1 check(version>=1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.family_record_events(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 child_id uuid not null,record_id uuid not null,
 record_kind text not null check(record_kind in ('profile','growth','vaccination')),
 action text not null check(action in ('INSERT','UPDATE','DELETE')),
 old_version bigint,new_version bigint,
 happened_at timestamptz not null default now()
);
create index family_children_owner_idx on public.family_children(owner_id,journey_id);
create index family_growth_owner_idx on public.family_growth_entries(owner_id,child_id,measured_on desc);
create index family_vaccine_owner_idx on public.family_vaccine_entries(owner_id,child_id,given_on desc);
create index family_events_owner_idx on public.family_record_events(owner_id,happened_at desc);

-- Every exposed table has explicit grants and separate RLS policies.
do $block$
declare tbl text; predicate text; 
begin
 foreach tbl in array array['family_children','family_growth_entries','family_vaccine_entries'] loop
  predicate:=case when tbl='family_children'
   then 'owner_id=(select auth.uid()) and exists(select 1 from public.journeys j where j.id=journey_id and j.owner_id=(select auth.uid()))'
   else 'owner_id=(select auth.uid()) and exists(select 1 from public.family_children c where c.id=child_id and c.owner_id=(select auth.uid()))' end;
  execute format('alter table public.%I enable row level security',tbl);
  execute format('revoke all on public.%I from anon,authenticated',tbl);
  execute format('grant select,insert,update,delete on public.%I to authenticated',tbl);
  execute format('create policy %I on public.%I for select to authenticated using(%s)',tbl||'_read',tbl,predicate);
  execute format('create policy %I on public.%I for insert to authenticated with check((%s) and version=1)',tbl||'_insert',tbl,predicate);
  execute format('create policy %I on public.%I for update to authenticated using(%s) with check(%s)',tbl||'_update',tbl,predicate,predicate);
  execute format('create policy %I on public.%I for delete to authenticated using(%s)',tbl||'_delete',tbl,predicate);
 end loop;
end $block$;
alter table public.family_record_events enable row level security;
revoke all on public.family_record_events from anon,authenticated;
grant select on public.family_record_events to authenticated;
create policy family_event_read on public.family_record_events for select to authenticated using(owner_id=(select auth.uid()));

create or replace function private.guard_family_write() returns trigger
language plpgsql security invoker set search_path='' as $fn$
declare v_birth date; v_due date;
begin
 if tg_table_name='family_children' then
  if tg_op='UPDATE' and (new.id is distinct from old.id or new.journey_id is distinct from old.journey_id
   or new.owner_id is distinct from old.owner_id or new.birth_order is distinct from old.birth_order)
   then raise exception 'MM_FAMILY_IMMUTABLE';end if;
  select j.due_date into v_due from public.journeys j where j.id=new.journey_id and j.owner_id=new.owner_id;
  if v_due is null or new.born_on>current_date
   or new.born_on<(v_due-interval '300 days')::date or new.born_on>(v_due+interval '90 days')::date
   then raise exception 'MM_FAMILY_DATE';end if;
 else
  if tg_op='UPDATE' and (new.id is distinct from old.id or new.child_id is distinct from old.child_id
   or new.owner_id is distinct from old.owner_id) then raise exception 'MM_FAMILY_IMMUTABLE';end if;
  select c.born_on into v_birth from public.family_children c where c.id=new.child_id and c.owner_id=new.owner_id;
  if v_birth is null then raise exception 'MM_FAMILY_OWNER';end if;
  if tg_table_name='family_growth_entries' then
   if new.measured_on<v_birth or new.measured_on>current_date then raise exception 'MM_FAMILY_DATE';end if;
  else
   if new.given_on<v_birth or new.given_on>current_date then raise exception 'MM_FAMILY_DATE';end if;
  end if;
 end if;
 if tg_op='UPDATE' and new.version<>old.version+1 then raise exception 'MM_FAMILY_CONFLICT';end if;
 new.updated_at:=now();
 return new;
end $fn$;
revoke all on function private.guard_family_write() from public,anon,authenticated;
create trigger child_write_guard before insert or update on public.family_children
 for each row execute function private.guard_family_write();
create trigger growth_write_guard before insert or update on public.family_growth_entries
 for each row execute function private.guard_family_write();
create trigger vaccine_write_guard before insert or update on public.family_vaccine_entries
 for each row execute function private.guard_family_write();

create or replace function private.audit_family_write() returns trigger language plpgsql
security definer set search_path='' as $fn$
declare v_owner uuid;v_child uuid;v_id uuid;v_kind text;v_old bigint;v_new bigint;
begin
 if tg_op='DELETE' then v_owner:=old.owner_id;v_id:=old.id;v_old:=old.version;
 else v_owner:=new.owner_id;v_id:=new.id;v_new:=new.version;end if;
 if tg_table_name='family_children' then v_child:=v_id;v_kind:='profile';
 elsif tg_table_name='family_growth_entries' then
  v_kind:='growth'; if tg_op='DELETE' then v_child:=old.child_id;else v_child:=new.child_id;end if;
 else
  v_kind:='vaccination';if tg_op='DELETE' then v_child:=old.child_id;else v_child:=new.child_id;end if;
 end if;
 if tg_op='UPDATE' then v_old:=old.version;end if;
 insert into public.family_record_events(owner_id,child_id,record_id,record_kind,action,old_version,new_version)
 values(v_owner,v_child,v_id,v_kind,tg_op,v_old,v_new);
 if tg_op='DELETE' then return old;else return new;end if;
end $fn$;
revoke all on function private.audit_family_write() from public,anon,authenticated;
create trigger child_write_audit after insert or update or delete on public.family_children
 for each row execute function private.audit_family_write();
create trigger growth_write_audit after insert or update or delete on public.family_growth_entries
 for each row execute function private.audit_family_write();
create trigger vaccine_write_audit after insert or update or delete on public.family_vaccine_entries
 for each row execute function private.audit_family_write();

-- Primary-child backfill is non-destructive; no legacy clinical rows are reattributed.
insert into public.family_children(journey_id,owner_id,birth_order,display_name,born_on,sex,gestation_weeks)
select id,owner_id,1,baby_name,baby_birth_date,
 case when baby_sex in('male','female') then baby_sex else 'unknown' end,gestation_at_birth_weeks
from public.journeys where baby_birth_date is not null and nullif(btrim(baby_name),'') is not null
on conflict (journey_id,birth_order) do nothing;

create or replace function private.seed_family_primary() returns trigger language plpgsql
security invoker set search_path='' as $fn$
begin
 if new.baby_birth_date is not null and nullif(btrim(new.baby_name),'') is not null then
  insert into public.family_children(journey_id,owner_id,birth_order,display_name,born_on,sex,gestation_weeks)
  values(new.id,new.owner_id,1,new.baby_name,new.baby_birth_date,
   case when new.baby_sex in('male','female') then new.baby_sex else 'unknown' end,new.gestation_at_birth_weeks)
  on conflict (journey_id,birth_order) do nothing;
 end if;
 return new;
end $fn$;
revoke all on function private.seed_family_primary() from public,anon,authenticated;
create trigger seed_newborn_profile after insert or update of baby_birth_date,baby_name on public.journeys
 for each row execute function private.seed_family_primary();
commit;
