-- MamaMwana v1.4.0 privacy hardening / staged migration 12.
-- User deletion must erase recipient authorization and avoid an FK SET NULL
-- UPDATE firing the caregiver invitation's verified-session mutation guard.
-- Apply to HOSTED ONLY after backup, legal/security review and an approved release.
begin;

alter table public.caregiver_invitations
  drop constraint caregiver_invitations_accepted_by_fkey;

alter table public.caregiver_invitations
  add constraint caregiver_invitations_accepted_by_fkey
  foreign key (accepted_by) references auth.users(id) on delete cascade;

comment on constraint caregiver_invitations_accepted_by_fkey
  on public.caregiver_invitations is
  'Recipient account removal deletes recipient-specific sharing invitation. Retaining a revoked invitation with a deleted account is disallowed.';

-- Deleting an owner cascades family child rows. Their audit trigger formerly
-- inserted events referencing an auth.users row already being erased, causing
-- account deletion to fail with a foreign-key error. Preserve the ordinary
-- user-initiated audit, but suppress re-creation during owner erasure only.
create or replace function private.audit_family_write() returns trigger language plpgsql
security definer set search_path='' as $fn$
declare v_owner uuid;v_child uuid;v_id uuid;v_kind text;v_old bigint;v_new bigint;
begin
 if tg_op='DELETE' and not exists (
   select 1 from auth.users u where u.id=old.owner_id
 ) then
   return old; -- account-erasure cascade: never reinsert a user-owned audit row
 end if;
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

commit;
