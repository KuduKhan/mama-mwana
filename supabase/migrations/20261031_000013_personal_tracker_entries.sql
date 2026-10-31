-- Personal tracking data only. No diagnosis, clinical interpretations, or provider access.
create table if not exists public.personal_tracker_entries (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 kind text not null check(kind in ('journal','progress','reminder')),
 title text not null check(char_length(title) between 1 and 160),
 note text not null default '' check(char_length(note)<=4000),
 event_date date,
 completed boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists personal_tracker_owner_date_idx on public.personal_tracker_entries(owner_id,event_date desc,created_at desc);
alter table public.personal_tracker_entries enable row level security;
revoke all on public.personal_tracker_entries from public,anon,authenticated;
grant select,insert,update,delete on public.personal_tracker_entries to authenticated;
create policy "personal_tracker_owner_select" on public.personal_tracker_entries for select to authenticated using(owner_id=(select auth.uid()));
create policy "personal_tracker_owner_insert" on public.personal_tracker_entries for insert to authenticated with check(owner_id=(select auth.uid()));
create policy "personal_tracker_owner_update" on public.personal_tracker_entries for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "personal_tracker_owner_delete" on public.personal_tracker_entries for delete to authenticated using(owner_id=(select auth.uid()));
