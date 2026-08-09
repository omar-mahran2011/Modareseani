-- ============================================================================
-- 0007_privacy_and_teacher_sync_fixes.sql
--
-- Fixes four gaps left over from the initial schema:
--
-- 1. `teachers.display_name / avatar_url / governorate_id / city_id / phone`
--    are meant to be a denormalized, always-in-sync copy of the matching
--    `profiles` fields (see the design note in 0002_tables.sql), but no
--    trigger ever actually synced them — and `profiles.phone` itself didn't
--    even exist yet. This adds the missing column, the sync trigger, and
--    backfills initial values on teacher-row creation.
--
-- 2. `profiles_select_authenticated` (0004) granted every signed-in user
--    read access to every OTHER user's profiles row, including their email
--    address — contradicting the "owner or admin only" design described in
--    0002's comments. Tightened here to owner-or-admin.
--
-- 3. `education_system` ("Teaching System") and `available_times` were
--    requested in the product spec but missing from `teachers`.
--
-- 4. The avatars storage bucket's INSERT policy had no admin bypass, so the
--    "admin uploads a teacher's photo" requirement was actually unreachable.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1a. Missing columns
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'education_system') then
    create type public.education_system as enum (
      'national', 'azhari', 'american', 'british', 'ib', 'stem', 'other'
    );
  end if;
end
$$;

alter table public.teachers
  add column if not exists education_system public.education_system,
  add column if not exists available_times text not null default '';

-- `phone` is edited as a *shared* profile field throughout the app (signup,
-- settings, admin edit) and denormalized down onto `teachers.phone` — but
-- `profiles` itself never actually had this column (only `teachers` did).
-- Everything below assumes it exists, so add it first.
alter table public.profiles
  add column if not exists phone text;

-- ---------------------------------------------------------------------------
-- 1b. sync_teacher_public_fields(): keeps the denormalized copy on `teachers`
-- in sync whenever the source-of-truth fields on `profiles` change.
-- ---------------------------------------------------------------------------
create or replace function public.sync_teacher_public_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.teachers
  set
    display_name = new.full_name,
    avatar_url = new.avatar_url,
    governorate_id = new.governorate_id,
    city_id = new.city_id,
    phone = new.phone
  where profile_id = new.id;

  return new;
end;
$$;

drop trigger if exists profiles_sync_teacher_public_fields on public.profiles;
create trigger profiles_sync_teacher_public_fields
  after update of full_name, avatar_url, governorate_id, city_id, phone on public.profiles
  for each row execute function public.sync_teacher_public_fields();

-- ---------------------------------------------------------------------------
-- 1c. Replace handle_new_user() so a freshly-created teacher row is
-- populated with the profile's data immediately, instead of blank defaults.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  requested_type public.account_type := 'student';
  resolved_name text;
begin
  if meta ? 'account_type' and (meta->>'account_type') in ('student', 'teacher') then
    requested_type := (meta->>'account_type')::public.account_type;
  end if;

  resolved_name := coalesce(
    nullif(meta->>'full_name', ''),
    nullif(meta->>'name', ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, full_name, avatar_url, account_type, governorate_id, city_id, phone)
  values (
    new.id,
    new.email,
    resolved_name,
    nullif(meta->>'avatar_url', ''),
    requested_type,
    nullif(meta->>'governorate_id', '')::bigint,
    nullif(meta->>'city_id', '')::bigint,
    nullif(meta->>'phone', '')
  )
  on conflict (id) do nothing;

  if requested_type = 'teacher' then
    insert into public.teachers (profile_id, display_name, avatar_url, governorate_id, city_id, phone)
    values (
      new.id,
      resolved_name,
      nullif(meta->>'avatar_url', ''),
      nullif(meta->>'governorate_id', '')::bigint,
      nullif(meta->>'city_id', '')::bigint,
      nullif(meta->>'phone', '')
    )
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1d. Replace sync_teacher_row_for_account_type() so switching a profile to
-- "teacher" seeds the denormalized fields immediately too.
-- ---------------------------------------------------------------------------
create or replace function public.sync_teacher_row_for_account_type()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.account_type = 'teacher' then
    insert into public.teachers (profile_id, display_name, avatar_url, governorate_id, city_id, phone)
    values (new.id, new.full_name, new.avatar_url, new.governorate_id, new.city_id, new.phone)
    on conflict (profile_id) do update
      set display_name = excluded.display_name,
          avatar_url = excluded.avatar_url,
          governorate_id = excluded.governorate_id,
          city_id = excluded.city_id,
          phone = excluded.phone;
  elsif new.account_type = 'student' and old.account_type = 'teacher' then
    update public.teachers
    set is_published = false
    where profile_id = new.id;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1e. Backfill (safe no-op on a fresh database; matters if 0001-0006 were
-- already applied and teachers rows exist with stale/blank public fields).
-- ---------------------------------------------------------------------------
update public.teachers t
set
  display_name = p.full_name,
  avatar_url = p.avatar_url,
  governorate_id = p.governorate_id,
  city_id = p.city_id,
  phone = p.phone
from public.profiles p
where p.id = t.profile_id;

-- ---------------------------------------------------------------------------
-- 2. Capture the reviewer's display name/photo onto `reviews` at write time,
-- so review UI never needs to read another user's `profiles` row. Extends
-- the existing validate_review_owner() trigger from 0003.
-- ---------------------------------------------------------------------------
create or replace function public.validate_review_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rating_owner uuid;
  rating_teacher uuid;
  author public.profiles%rowtype;
begin
  select r.user_id, r.teacher_id into rating_owner, rating_teacher
  from public.ratings r
  where r.id = new.rating_id;

  if rating_owner is null then
    raise exception 'Rating % does not exist', new.rating_id;
  end if;

  if rating_owner <> new.user_id then
    raise exception 'A review must belong to the same user as its rating';
  end if;

  new.teacher_id := rating_teacher;

  if tg_op = 'INSERT' then
    select * into author from public.profiles where id = new.user_id;
    new.author_name := coalesce(author.full_name, '');
    new.author_avatar_url := author.avatar_url;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Tighten profiles SELECT to owner-or-admin, matching the privacy design
-- described in 0002_tables.sql. Public-safe teacher fields already live on
-- `teachers`; review author fields already live on `reviews` (above).
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_authenticated" on public.profiles;
drop policy if exists "profiles_select_owner_or_admin" on public.profiles;
create policy "profiles_select_owner_or_admin" on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. Storage: admins can upload avatars on a teacher's behalf.
-- The original INSERT policy (0005) only allowed the owner's own folder.
-- Since every upload uses a freshly-timestamped filename, it is always an
-- INSERT (never an UPDATE) even when replacing a photo — so the existing
-- admin bypass on UPDATE/DELETE never actually covered "admin uploads a
-- teacher's photo" (a real product requirement). Aligned here with the
-- other avatars_* policies.
-- ---------------------------------------------------------------------------
drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin(auth.uid()))
  );
