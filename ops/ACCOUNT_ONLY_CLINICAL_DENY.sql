-- MamaMwana hosted account-only release boundary
-- Executed on the existing MamaMwana Supabase project on 2026-10-31.
-- This is a DENY policy for all clinical records, NOT a clinical activation.
-- Do NOT execute a blanket GRANT to undo it. Any future clinical access requires
-- independently approved and per-resource reviewed grants + RLS / RPC tests.
begin;
revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
commit;

-- Verification: these four values must all be zero; 23/23 existing tables had RLS.
select
 (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind in ('r','p')
  and has_table_privilege('authenticated',c.oid,'SELECT')) as authenticated_read_tables,
 (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind in ('r','p')
  and (has_table_privilege('authenticated',c.oid,'INSERT')
  or has_table_privilege('authenticated',c.oid,'UPDATE')
  or has_table_privilege('authenticated',c.oid,'DELETE'))) as authenticated_write_tables,
 (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and has_function_privilege('authenticated',p.oid,'EXECUTE')) as authenticated_callable_functions,
 (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and has_function_privilege('anon',p.oid,'EXECUTE')) as anon_callable_functions;
