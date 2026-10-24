-- MamaMwana v0.5: independent clinician approval and auditable data-rights requests.
-- Apply only after v0.4; back up and test against a disposable project.
-- Legacy approved articles remain visible, but can no longer be edited in place.
begin;

alter table public.education_articles
  add column if not exists author_id uuid references public.clinical_reviewers(user_id);
alter table public.education_articles
  alter column author_id set default auth.uid();

-- Approved articles become immutable. New drafts are submitted for review,
-- and cannot be approved by the author. This is enforced in the database.
create or replace function private.enforce_independent_clinical_review()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if auth.uid() is null or new.author_id is distinct from auth.uid()
       or new.status <> 'in_review'
       or new.reviewed_by is not null or new.reviewed_at is not null then
      raise exception 'Article submission requires the authenticated author and in_review status';
    end if;
    if new.source_url !~* '^https://([a-z0-9-]+\.)*(who\.int|cdc\.gov|health\.go\.ke)(/|$)' then
      raise exception 'Only approved official public-health references are permitted';
    end if;
    return new;
  end if;
  if old.status <> 'in_review' then
    raise exception 'Only submitted articles can be approved; published content is immutable';
  end if;
  if old.author_id is null or new.author_id is distinct from old.author_id then
    raise exception 'Article author must be established and cannot change';
  end if;
  if new.status <> 'approved'
    or new.reviewed_by is distinct from auth.uid()
    or new.reviewed_by = old.author_id then
    raise exception 'Approval requires an independent, signed-in reviewer';
  end if;
  if new.slug is distinct from old.slug
    or new.title is distinct from old.title
    or new.summary is distinct from old.summary
    or new.body is distinct from old.body
    or new.source_url is distinct from old.source_url
    or new.topic is distinct from old.topic
    or new.locale is distinct from old.locale
    or new.version is distinct from old.version then
    raise exception 'Article content cannot change during approval';
  end if;
  if new.source_url !~* '^https://([a-z0-9-]+\.)*(who\.int|cdc\.gov|health\.go\.ke)(/|$)' then
    raise exception 'Official public-health reference required';
  end if;
  new.reviewed_at := now();
  new.updated_at := now();
  return new;
end $$;
revoke all on function private.enforce_independent_clinical_review() from public, anon, authenticated;
drop trigger if exists independent_clinical_review on public.education_articles;
create trigger independent_clinical_review
before insert or update on public.education_articles
for each row execute function private.enforce_independent_clinical_review();

drop policy if exists "assigned reviewers create content" on public.education_articles;
create policy "assigned reviewers create content"
on public.education_articles for insert to authenticated
with check (
  author_id = (select auth.uid())
  and status = 'in_review'
  and reviewed_by is null and reviewed_at is null
  and exists(
    select 1 from public.clinical_reviewers r
    where r.user_id = (select auth.uid()) and r.is_active
  )
);
drop policy if exists "assigned reviewers revise content" on public.education_articles;
create policy "independent reviewers approve submissions"
on public.education_articles for update to authenticated
using (
  status = 'in_review'
  and author_id is not null and author_id <> (select auth.uid())
  and exists(
    select 1 from public.clinical_reviewers r
    where r.user_id = (select auth.uid()) and r.is_active
  )
)
with check (
  status = 'approved'
  and author_id is not null and author_id <> (select auth.uid())
  and reviewed_by = (select auth.uid())
);

create table if not exists public.education_review_events(
 id uuid primary key default gen_random_uuid(),
 article_id uuid not null references public.education_articles(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null,
 action text not null check(action in ('submitted','approved')),
 article_version integer not null,
 created_at timestamptz not null default now()
);
create index if not exists education_review_events_article_idx
 on public.education_review_events(article_id, created_at desc);
alter table public.education_review_events enable row level security;
revoke all on public.education_review_events from anon, authenticated;
grant select on public.education_review_events to authenticated;
drop policy if exists "reviewers inspect content approval events" on public.education_review_events;
create policy "reviewers inspect content approval events"
 on public.education_review_events for select to authenticated
 using(exists(
   select 1 from public.clinical_reviewers r
   where r.user_id=(select auth.uid()) and r.is_active
 ));
create or replace function private.record_article_review_event()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.education_review_events(article_id,actor_id,action,article_version)
    values(new.id,auth.uid(),case when tg_op='INSERT' then 'submitted' else 'approved' end,new.version);
  return new;
end $$;
revoke all on function private.record_article_review_event() from public,anon,authenticated;
drop trigger if exists article_review_event on public.education_articles;
create trigger article_review_event
after insert or update of status on public.education_articles
for each row execute function private.record_article_review_event();

-- Data-subject rights are requests, not automatically executed deletions.
-- Users can see and submit only their own. Admins require a verified manual
-- review process; ordinary authenticated clients cannot change statuses.
create table if not exists public.data_rights_requests(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 request_type text not null check(request_type in ('access','erasure','correction')),
 status text not null default 'received' check(status in ('received','in_review','resolved','declined')),
 requested_at timestamptz not null default now(),
 resolved_at timestamptz
);
create unique index if not exists one_open_data_rights_request_per_kind
 on public.data_rights_requests(owner_id,request_type)
 where status in ('received','in_review');
create index if not exists data_rights_requests_owner_idx
 on public.data_rights_requests(owner_id,requested_at desc);
alter table public.data_rights_requests enable row level security;
revoke all on public.data_rights_requests from anon,authenticated;
grant select,insert on public.data_rights_requests to authenticated;
drop policy if exists "owners read their rights requests" on public.data_rights_requests;
create policy "owners read their rights requests"
 on public.data_rights_requests for select to authenticated
 using(owner_id=(select auth.uid()));
drop policy if exists "owners submit their rights requests" on public.data_rights_requests;
create policy "owners submit their rights requests"
 on public.data_rights_requests for insert to authenticated
 with check(owner_id=(select auth.uid()) and status='received' and resolved_at is null);
comment on table public.data_rights_requests is
 'Requests do not automatically delete Auth users, health records, or retained backups. Authorized staff must verify and fulfill them under documented retention and legal procedures.';
comment on table public.education_review_events is
 'Append-only from database triggers; independently attributable clinical content submission/approval history.';
commit;
