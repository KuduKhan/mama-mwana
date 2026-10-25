-- MamaMwana v1.0 candidate: verified-email, owner-consented, read-only child sharing.
-- DO NOT enable publicly without privacy/guardian authorization assessment and RLS tests.
begin;
create or replace function private.mm_verified_email()
returns text language sql stable security definer set search_path='' as $fn$
 select lower(u.email) from auth.users u
 where u.id=auth.uid() and u.email_confirmed_at is not null
 and u.is_anonymous=false
 limit 1
$fn$;
revoke all on function private.mm_verified_email() from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.mm_verified_email() to authenticated;

create table public.caregiver_invitations(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 child_id uuid not null references public.family_children(id) on delete cascade,
 invited_email text not null check(length(invited_email) between 5 and 254 and invited_email=lower(btrim(invited_email))),
 status text not null default 'pending' check(status in ('pending','accepted','revoked')),
 guardian_authority_attested boolean not null check(guardian_authority_attested=true),
 accepted_by uuid references auth.users(id) on delete set null,
 expires_at timestamptz not null default (now()+interval '7 days'),
 shared_until timestamptz,
 version integer not null default 1 check(version>=1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index caregiver_active_invite on public.caregiver_invitations(child_id,invited_email)
 where status in ('pending','accepted');
create index caregiver_invite_owner on public.caregiver_invitations(owner_id,child_id);
create index caregiver_invite_guest on public.caregiver_invitations(invited_email,status);
alter table public.caregiver_invitations enable row level security;
revoke all on public.caregiver_invitations from anon,authenticated;
grant select,insert,update on public.caregiver_invitations to authenticated;
create policy "care invitation owner or verified recipient read"
 on public.caregiver_invitations for select to authenticated
 using(owner_id=(select auth.uid()) or invited_email=(select private.mm_verified_email()));
create policy "care invitation owner create" on public.caregiver_invitations
 for insert to authenticated with check(owner_id=(select auth.uid()) and status='pending'
  and accepted_by is null and shared_until is null and version=1
  and exists(select 1 from public.family_children c
   where c.id=child_id and c.owner_id=(select auth.uid())));
create policy "care invitation secure transition" on public.caregiver_invitations
 for update to authenticated
 using(owner_id=(select auth.uid()) or invited_email=(select private.mm_verified_email()))
 with check(owner_id=(select auth.uid()) or invited_email=(select private.mm_verified_email()));

create or replace function private.mm_guard_caregiver_invite()
returns trigger language plpgsql security invoker set search_path='' as $fn$
declare v_me uuid:=auth.uid();v_verified text:=private.mm_verified_email();
begin
 if v_me is null or v_verified is null then raise exception 'MM_SHARE_VERIFIED_ACCOUNT_REQUIRED';end if;
 if tg_op='INSERT' then
  if new.owner_id<>v_me or new.invited_email=v_verified
    or not exists(select 1 from public.family_children c where c.id=new.child_id and c.owner_id=v_me)
    or new.status<>'pending' or new.accepted_by is not null or new.shared_until is not null
    or new.expires_at<=now() or new.expires_at>now()+interval '7 days 1 minute'
    or not new.guardian_authority_attested then raise exception 'MM_SHARE_INVALID_INVITATION';end if;
 else
  if new.id is distinct from old.id or new.owner_id is distinct from old.owner_id
   or new.child_id is distinct from old.child_id
   or new.invited_email is distinct from old.invited_email
   or new.guardian_authority_attested is distinct from old.guardian_authority_attested
   or new.created_at is distinct from old.created_at
   or new.expires_at is distinct from old.expires_at
   or new.version<>old.version+1 then raise exception 'MM_SHARE_IMMUTABLE_OR_CONFLICT';end if;
  if old.status='revoked' or new.status=old.status then raise exception 'MM_SHARE_INVALID_TRANSITION';end if;
  if v_me=old.owner_id then
   if new.status<>'revoked' or new.accepted_by is distinct from old.accepted_by
    or new.shared_until is distinct from old.shared_until then raise exception 'MM_SHARE_OWNER_ONLY_REVOKE';end if;
  elsif v_verified=old.invited_email then
   if old.status='pending' and new.status='accepted' and old.expires_at>now() then
    new.accepted_by:=v_me;
    new.shared_until:=now()+interval '30 days';
   elsif new.status='revoked' and new.accepted_by is not distinct from old.accepted_by
    and new.shared_until is not distinct from old.shared_until then
     null;
   else raise exception 'MM_SHARE_RECIPIENT_TRANSITION';end if;
  else raise exception 'MM_SHARE_UNAUTHORIZED';end if;
 end if;
 new.updated_at:=now();
 return new;
end $fn$;
revoke all on function private.mm_guard_caregiver_invite() from public,anon,authenticated;
create trigger mm_invite_guard before insert or update on public.caregiver_invitations
 for each row execute function private.mm_guard_caregiver_invite();

create table public.caregiver_invitation_events (
 id uuid primary key default gen_random_uuid(),
 invitation_id uuid not null,
 owner_id uuid not null references auth.users(id) on delete cascade,
 actor_id uuid,
 old_status text,new_status text,
 happened_at timestamptz not null default now()
);
create index caregiver_events_owner_time on public.caregiver_invitation_events(owner_id,happened_at desc);
alter table public.caregiver_invitation_events enable row level security;
revoke all on public.caregiver_invitation_events from anon,authenticated;
grant select on public.caregiver_invitation_events to authenticated;
create policy "owner sees invitation events" on public.caregiver_invitation_events
 for select to authenticated using(owner_id=(select auth.uid()));
create or replace function private.mm_audit_caregiver_invite()
returns trigger language plpgsql security definer set search_path='' as $fn$
begin
 insert into public.caregiver_invitation_events(invitation_id,owner_id,actor_id,old_status,new_status)
 values(new.id,new.owner_id,auth.uid(),case when tg_op='INSERT' then null else old.status end,new.status);
 return new;
end $fn$;
revoke all on function private.mm_audit_caregiver_invite() from public,anon,authenticated;
create trigger mm_invite_audit after insert or update on public.caregiver_invitations
 for each row execute function private.mm_audit_caregiver_invite();

-- Narrow read-only provider: never widens owner RLS on original clinical tables.
create or replace function public.get_shared_child_summary(p_child_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $fn$
declare v_me uuid:=auth.uid();v_email text:=private.mm_verified_email();v_child jsonb;v_growth jsonb;v_vaccines jsonb;
begin
 if v_me is null or v_email is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
  raise exception 'MM_SHARE_UNAUTHORIZED';end if;
 if not exists(select 1 from public.caregiver_invitations i
  where i.child_id=p_child_id and i.invited_email=v_email
  and i.accepted_by=v_me and i.status='accepted' and i.shared_until>now()) then
  raise exception 'MM_SHARE_NO_ACTIVE_CONSENT';end if;
 select jsonb_build_object('id',c.id,'display_name',c.display_name,'born_on',c.born_on,'sex',c.sex)
 into v_child from public.family_children c where c.id=p_child_id;
 if v_child is null then raise exception 'MM_SHARE_CHILD_NOT_FOUND';end if;
 select coalesce(jsonb_agg(jsonb_build_object('measured_on',g.measured_on,'weight_kg',g.weight_kg,
  'length_cm',g.length_cm) order by g.measured_on desc),'[]'::jsonb)
 into v_growth from public.family_growth_entries g where g.child_id=p_child_id;
 select coalesce(jsonb_agg(jsonb_build_object('given_on',v.given_on,'vaccine_label',v.vaccine_label)
  order by v.given_on desc),'[]'::jsonb)
 into v_vaccines from public.family_vaccine_entries v where v.child_id=p_child_id;
 return jsonb_build_object('child',v_child,'growth',v_growth,'vaccinations',v_vaccines,
  'notice','Read-only, caregiver-shared entries. Not a certified clinical record.');
end $fn$;
revoke all on function public.get_shared_child_summary(uuid) from public,anon;
grant execute on function public.get_shared_child_summary(uuid) to authenticated;
comment on table public.caregiver_invitations is 'Owner-attested invitations. Identity and guardian authority still require privacy/legal governance before clinical release.';
commit;