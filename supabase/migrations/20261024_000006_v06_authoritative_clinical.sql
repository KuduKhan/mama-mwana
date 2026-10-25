-- MamaMwana v0.6: canonical clinical rows, optimistic locking, and safeguarded erasure.
-- Prerequisite: all v0.1-v0.5 migrations have succeeded in a dedicated database.
-- Run on an isolated, backed-up test project before any production database.
begin;

-- v0.4 only mirrored changes in journeys JSONB into the clinical tables.
-- Starting with v0.6, these normalized tables are the authoritative clinical source.
drop trigger if exists mirror_journey_clinical_records on public.journeys;

alter table public.journey_visits
  add column if not exists version bigint not null default 1,
  add column if not exists updated_at timestamptz not null default now();
alter table public.child_measurements
  add column if not exists version bigint not null default 1,
  add column if not exists updated_at timestamptz not null default now();
alter table public.child_immunizations
  add column if not exists version bigint not null default 1,
  add column if not exists updated_at timestamptz not null default now();

-- Old clients must not pretend they have updated authoritative clinical records.
-- Historical JSONB data is retained as a legacy read-only snapshot.
create or replace function private.prevent_legacy_clinical_updates()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.visits is distinct from old.visits
    or new.growth is distinct from old.growth
    or new.immunizations is distinct from old.immunizations then
    raise exception 'MM_UPGRADE_REQUIRED: clinical records are managed by the v0.6 clinical API';
  end if;
  return new;
end $$;
drop trigger if exists protect_legacy_clinical_snapshots on public.journeys;
create trigger protect_legacy_clinical_snapshots
 before update of visits,growth,immunizations on public.journeys
 for each row execute function private.prevent_legacy_clinical_updates();

-- No direct table writes from the client; version checks are enforced in a
-- tightly scoped, authenticated RPC. SELECT still follows existing owner RLS.
revoke insert,update,delete on public.journey_visits,
  public.child_measurements,public.child_immunizations from anon,authenticated;

create table if not exists public.clinical_record_events(
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check(kind in ('visit','growth','immunization')),
  source_id text not null,
  action text not null check(action in ('insert','update','delete')),
  previous_version bigint,
  next_version bigint,
  actor_id uuid,
  happened_at timestamptz not null default now()
);
create index if not exists clinical_record_events_lookup
  on public.clinical_record_events(owner_id,journey_id,happened_at desc);
alter table public.clinical_record_events enable row level security;
revoke all on public.clinical_record_events from anon,authenticated;
grant select on public.clinical_record_events to authenticated;
drop policy if exists "owners read record change metadata" on public.clinical_record_events;
create policy "owners read record change metadata"
 on public.clinical_record_events for select to authenticated
 using(owner_id=(select auth.uid()));

create or replace function private.audit_clinical_record_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_kind text;
begin
 if tg_op='DELETE' and not exists (select 1 from public.journeys j where j.id=old.journey_id) then
  return old; -- parent cascade, no orphan audit event
 end if;
 v_kind := case tg_table_name when 'journey_visits' then 'visit'
  when 'child_measurements' then 'growth' else 'immunization' end;
 insert into public.clinical_record_events(
  journey_id,owner_id,kind,source_id,action,previous_version,next_version,actor_id
 ) values (
  coalesce(new.journey_id,old.journey_id),
  coalesce(new.owner_id,old.owner_id),
  v_kind,
  coalesce(new.source_id,old.source_id),
  lower(tg_op),
  case when tg_op='INSERT' then null else old.version end,
  case when tg_op='DELETE' then null else new.version end,
  auth.uid()
 );
 return coalesce(new,old);
end $$;
revoke all on function private.audit_clinical_record_change() from public,anon,authenticated;
drop trigger if exists audit_clinical_visits on public.journey_visits;
drop trigger if exists audit_clinical_growth on public.child_measurements;
drop trigger if exists audit_clinical_immunizations on public.child_immunizations;
create trigger audit_clinical_visits after insert or update or delete
 on public.journey_visits for each row execute function private.audit_clinical_record_change();
create trigger audit_clinical_growth after insert or update or delete
 on public.child_measurements for each row execute function private.audit_clinical_record_change();
create trigger audit_clinical_immunizations after insert or update or delete
 on public.child_immunizations for each row execute function private.audit_clinical_record_change();

-- Everything runs within the caller's single PostgREST transaction. The journey
-- row is FOR UPDATE locked to serialize concurrent operations on one family record.
-- SECURITY DEFINER is intentional: only this function may write protected rows.
-- Every call validates auth.uid() and the actual owning journey, no user_metadata.
create or replace function public.apply_clinical_change(
 p_journey_id uuid,
 p_kind text,
 p_source_id text,
 p_expected_version bigint,
 p_payload jsonb default '{}'::jsonb,
 p_delete boolean default false
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
 v_owner uuid := auth.uid();
 v_record_owner uuid;
 v_birth date;
 v_current bigint;
 v_result jsonb;
 v_date date;
 v_label text;
 v_note text;
 v_weight numeric;
 v_length numeric;
 v_dose text;
begin
 if v_owner is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
  raise exception 'MM_UNAUTHORIZED: verified signed-in account required';
 end if;
 if p_kind not in ('visit','growth','immunization')
  or p_source_id is null or length(p_source_id) not between 1 and 128
  or p_expected_version is null or p_expected_version < 0 then
  raise exception 'MM_INVALID: unsupported clinical record request';
 end if;
 if not p_delete and jsonb_typeof(p_payload) is distinct from 'object' then
  raise exception 'MM_INVALID: expected a record object';
 end if;

 select owner_id,baby_birth_date into v_record_owner,v_birth
 from public.journeys where id=p_journey_id for update;
 if v_record_owner is null or v_record_owner <> v_owner then
  raise exception 'MM_UNAUTHORIZED: journey not found';
 end if;
 v_current := null;
 if p_kind='visit' then
  select version into v_current from public.journey_visits
   where journey_id=p_journey_id and source_id=p_source_id for update;
 elsif p_kind='growth' then
  select version into v_current from public.child_measurements
   where journey_id=p_journey_id and source_id=p_source_id for update;
 else
  select version into v_current from public.child_immunizations
   where journey_id=p_journey_id and source_id=p_source_id for update;
 end if;
 if (v_current is null and p_expected_version <> 0)
  or (v_current is not null and v_current <> p_expected_version)
  or (p_delete and v_current is null) then
   raise exception 'MM_CONFLICT: record changed, refresh before editing';
 end if;
 if p_delete then
  if p_kind='visit' then
   delete from public.journey_visits where journey_id=p_journey_id and source_id=p_source_id;
  elsif p_kind='growth' then
   delete from public.child_measurements where journey_id=p_journey_id and source_id=p_source_id;
  else
   delete from public.child_immunizations where journey_id=p_journey_id and source_id=p_source_id;
  end if;
  return jsonb_build_object('source_id',p_source_id,'deleted',true,'version',v_current);
 end if;

 if p_kind='visit' then
  v_label := btrim(coalesce(p_payload->>'clinic',''));
  v_note := coalesce(p_payload->>'notes','');
  if length(v_label) not between 1 and 100 or length(v_note)>500
    or (p_payload->>'attended') not in ('true','false')
    or (p_payload->>'scheduled_on') !~ '^\d{4}-\d{2}-\d{2}$' then
    raise exception 'MM_INVALID: check visit date, clinic, notes, and attendance';
  end if;
  v_date := (p_payload->>'scheduled_on')::date;
  if v_current is null then
   insert into public.journey_visits(journey_id,source_id,owner_id,scheduled_on,clinic,notes,attended)
    values(p_journey_id,p_source_id,v_owner,v_date,v_label,v_note,(p_payload->>'attended')::boolean);
  else
   update public.journey_visits set scheduled_on=v_date,clinic=v_label,notes=v_note,
    attended=(p_payload->>'attended')::boolean,version=version+1,updated_at=now()
    where journey_id=p_journey_id and source_id=p_source_id;
  end if;
  select to_jsonb(v) into v_result from public.journey_visits v
   where v.journey_id=p_journey_id and v.source_id=p_source_id;

 elsif p_kind='growth' then
  if v_birth is null then raise exception 'MM_INVALID: birth date required for child growth'; end if;
  if (p_payload->>'measured_on') !~ '^\d{4}-\d{2}-\d{2}$' then
   raise exception 'MM_INVALID: measurement date required';
  end if;
  v_date := (p_payload->>'measured_on')::date;
  v_weight := nullif(p_payload->>'weight_kg','')::numeric;
  v_length := nullif(p_payload->>'length_cm','')::numeric;
  if v_date < v_birth or v_date > current_date or
    (v_weight is null and v_length is null) or
    (v_weight is not null and (v_weight <= 0 or v_weight > 60)) or
    (v_length is not null and (v_length <= 0 or v_length > 180)) then
    raise exception 'MM_INVALID: invalid measurement, confirm clinic record';
  end if;
  if v_current is null then
   insert into public.child_measurements(journey_id,source_id,owner_id,measured_on,weight_kg,length_cm)
   values(p_journey_id,p_source_id,v_owner,v_date,v_weight,v_length);
  else
   update public.child_measurements set measured_on=v_date,weight_kg=v_weight,length_cm=v_length,
    version=version+1,updated_at=now()
    where journey_id=p_journey_id and source_id=p_source_id;
  end if;
  select to_jsonb(g) into v_result from public.child_measurements g
   where g.journey_id=p_journey_id and g.source_id=p_source_id;

 else
  if v_birth is null then raise exception 'MM_INVALID: birth date required for vaccinations'; end if;
  v_dose := btrim(coalesce(p_payload->>'dose_id',''));
  v_label := btrim(coalesce(p_payload->>'facility',''));
  v_note := coalesce(p_payload->>'note','');
  if length(v_dose) not between 1 and 80 or length(v_label)>100 or length(v_note)>200
   or (p_payload->>'given_on') !~ '^\d{4}-\d{2}-\d{2}$' then
   raise exception 'MM_INVALID: invalid immunization record';
  end if;
  v_date := (p_payload->>'given_on')::date;
  if v_date < v_birth or v_date > current_date then
   raise exception 'MM_INVALID: vaccine administration date must be between birth and today';
  end if;
  if exists(
   select 1 from public.child_immunizations i
    where i.journey_id=p_journey_id and i.dose_id=v_dose and i.source_id<>p_source_id
  ) then raise exception 'MM_INVALID: duplicate vaccine dose'; end if;
  if v_current is null then
   insert into public.child_immunizations(journey_id,source_id,owner_id,dose_id,given_on,facility,note)
    values(p_journey_id,p_source_id,v_owner,v_dose,v_date,v_label,v_note);
  else
   update public.child_immunizations set dose_id=v_dose,given_on=v_date,facility=v_label,note=v_note,
    version=version+1,updated_at=now()
    where journey_id=p_journey_id and source_id=p_source_id;
  end if;
  select to_jsonb(i) into v_result from public.child_immunizations i
   where i.journey_id=p_journey_id and i.source_id=p_source_id;
 end if;
 return v_result;
end $$;
revoke all on function public.apply_clinical_change(uuid,text,text,bigint,jsonb,boolean)
 from public,anon,authenticated;
grant execute on function public.apply_clinical_change(uuid,text,text,bigint,jsonb,boolean)
 to authenticated;

-- Protected two-person approval for an irreversible erasure. Accounts that are
-- not yet clinically/legal reviewed cannot be erased via the Edge endpoint.
alter table public.data_rights_requests
  drop constraint if exists data_rights_requests_status_check;
alter table public.data_rights_requests
  add constraint data_rights_requests_status_check
  check(status in ('received','in_review','processing','resolved','declined'));

create table if not exists public.privacy_operators(
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  assigned_at timestamptz not null default now()
);
alter table public.privacy_operators enable row level security;
revoke all on public.privacy_operators from anon,authenticated;
grant select on public.privacy_operators to authenticated;
drop policy if exists "operators read own assignment" on public.privacy_operators;
create policy "operators read own assignment"
 on public.privacy_operators for select to authenticated
 using(user_id=(select auth.uid()));

create table if not exists public.erasure_authorizations(
  request_id uuid primary key references public.data_rights_requests(id) on delete cascade,
  approved_by_first uuid not null references public.privacy_operators(user_id),
  approved_by_second uuid not null references public.privacy_operators(user_id),
  approved_at timestamptz not null default now(),
  legal_hold_checked boolean not null default false,
  backup_retention_reviewed boolean not null default false,
  constraint different_erasure_approvers check(approved_by_first<>approved_by_second)
);
alter table public.erasure_authorizations enable row level security;
revoke all on public.erasure_authorizations from anon,authenticated;

-- Pseudonymous proof of processing. No direct Auth user ID/email stored.
-- Service-role-only writes, and never publicly selectable.
create table if not exists public.erasure_receipts(
  id uuid primary key default gen_random_uuid(),
  request_fingerprint text not null unique,
  subject_fingerprint text not null,
  status text not null default 'processing' check(status in ('processing','completed','failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.erasure_receipts enable row level security;
revoke all on public.erasure_receipts from anon,authenticated;
commit;
