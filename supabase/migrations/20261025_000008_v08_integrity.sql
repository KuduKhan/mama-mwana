-- MamaMwana v0.8: ensure a care-planner reference belongs to the selected journey.
-- Run only AFTER v0.7 migration, with an authorized disposable-db test and review.
begin;
create or replace function private.validate_care_item_visit()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if new.visit_source_id is not null and not exists (
  select 1 from public.journey_visits v
  where v.journey_id = new.journey_id and v.source_id = new.visit_source_id
 ) then
  raise exception 'MM_CARE_VISIT: the visit must belong to this family journey';
 end if;
 return new;
end $$;
revoke all on function private.validate_care_item_visit() from public,anon,authenticated;
drop trigger if exists enforce_care_visit_relation on public.care_plan_items;
create trigger enforce_care_visit_relation
before insert or update on public.care_plan_items
for each row execute function private.validate_care_item_visit();
comment on function private.validate_care_item_visit() is
 'Prevents a user-submitted visit reference from pointing at another journey or a nonexistent appointment.';
commit;
