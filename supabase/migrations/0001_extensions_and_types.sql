-- ============================================================================
-- 0001_extensions_and_types.sql
-- Extensions and shared enum types for the Teacher Directory platform.
-- ============================================================================

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_type') then
    create type public.account_type as enum ('student', 'teacher');
  end if;

  if not exists (select 1 from pg_type where typname = 'teaching_method') then
    create type public.teaching_method as enum ('online', 'offline', 'both');
  end if;

  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin');
  end if;
end
$$;
