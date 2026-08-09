-- ============================================================================
-- 0003_functions_and_triggers.sql
-- Business-logic functions and triggers.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- is_admin(): security-definer helper so RLS policies can check admin status
-- without recursively evaluating RLS on user_roles.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = uid and ur.role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- set_updated_at(): generic "touch" trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists teachers_set_updated_at on public.teachers;
create trigger teachers_set_updated_at
  before update on public.teachers
  for each row execute function public.set_updated_at();

drop trigger if exists ratings_set_updated_at on public.ratings;
create trigger ratings_set_updated_at
  before update on public.ratings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- handle_new_user(): creates a profile row (and, for teacher signups, a
-- draft teachers row) whenever a new auth.users row is created. Reads
-- metadata passed via supabase.auth.signUp({ options: { data } }).
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
begin
  if meta ? 'account_type' and (meta->>'account_type') in ('student', 'teacher') then
    requested_type := (meta->>'account_type')::public.account_type;
  end if;

  insert into public.profiles (id, email, full_name, account_type, governorate_id, city_id, phone)
  values (
    new.id,
    new.email,
    coalesce(meta->>'full_name', ''),
    requested_type,
    nullif(meta->>'governorate_id', '')::bigint,
    nullif(meta->>'city_id', '')::bigint,
    nullif(meta->>'phone', '')
  )
  on conflict (id) do nothing;

  if requested_type = 'teacher' then
    insert into public.teachers (profile_id)
    values (new.id)
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- sync_teacher_row_for_account_type(): when a profile switches between
-- student <-> teacher, make sure a (hidden, unpublished) teachers row exists.
-- Switching back to student unpublishes it but keeps all data intact.
-- ---------------------------------------------------------------------------
create or replace function public.sync_teacher_row_for_account_type()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.account_type = 'teacher' then
    insert into public.teachers (profile_id)
    values (new.id)
    on conflict (profile_id) do nothing;
  elsif new.account_type = 'student' and old.account_type = 'teacher' then
    update public.teachers
    set is_published = false
    where profile_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_teacher_row on public.profiles;
create trigger profiles_sync_teacher_row
  after update of account_type on public.profiles
  for each row execute function public.sync_teacher_row_for_account_type();

-- ---------------------------------------------------------------------------
-- update_teacher_rating(): keeps teachers.avg_rating / ratings_count in sync
-- whenever a rating is inserted, updated, or deleted.
-- ---------------------------------------------------------------------------
create or replace function public.update_teacher_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_teacher uuid;
begin
  affected_teacher := coalesce(new.teacher_id, old.teacher_id);

  update public.teachers t
  set
    avg_rating = coalesce((
      select round(avg(r.stars)::numeric, 2)
      from public.ratings r
      where r.teacher_id = affected_teacher
    ), 0),
    ratings_count = (
      select count(*) from public.ratings r where r.teacher_id = affected_teacher
    )
  where t.profile_id = affected_teacher;

  return coalesce(new, old);
end;
$$;

drop trigger if exists ratings_after_change on public.ratings;
create trigger ratings_after_change
  after insert or update of stars or delete on public.ratings
  for each row execute function public.update_teacher_rating();

-- ---------------------------------------------------------------------------
-- validate_review_owner(): a review must belong to a rating owned by the
-- same user (defense in depth alongside RLS policies).
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
  return new;
end;
$$;

drop trigger if exists reviews_validate_owner on public.reviews;
create trigger reviews_validate_owner
  before insert or update on public.reviews
  for each row execute function public.validate_review_owner();
