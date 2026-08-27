-- ============================================================================
-- 0011_google_avatar_and_hardening.sql
--
-- Google OAuth's raw metadata can expose the profile photo under either
-- `avatar_url` (Supabase's normalized key) or `picture` (Google's original
-- OIDC claim) depending on provider/version specifics. handle_new_user()
-- only checked `avatar_url`, so a Google sign-in could silently lose the
-- profile photo. Checking both removes the ambiguity entirely.
-- ============================================================================

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
  resolved_avatar text;
begin
  if meta ? 'account_type' and (meta->>'account_type') in ('student', 'teacher') then
    requested_type := (meta->>'account_type')::public.account_type;
  end if;

  resolved_name := coalesce(
    nullif(meta->>'full_name', ''),
    nullif(meta->>'name', ''),
    split_part(new.email, '@', 1)
  );

  resolved_avatar := coalesce(
    nullif(meta->>'avatar_url', ''),
    nullif(meta->>'picture', '')
  );

  insert into public.profiles (id, email, full_name, avatar_url, account_type, governorate_id, city_id, phone)
  values (
    new.id,
    new.email,
    resolved_name,
    resolved_avatar,
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
      resolved_avatar,
      nullif(meta->>'governorate_id', '')::bigint,
      nullif(meta->>'city_id', '')::bigint,
      nullif(meta->>'phone', '')
    )
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;
