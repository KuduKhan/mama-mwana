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

commit;
