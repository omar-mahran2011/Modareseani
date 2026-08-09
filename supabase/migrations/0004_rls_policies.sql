-- ============================================================================
-- 0004_rls_policies.sql
-- Row Level Security. Every table is locked down by default; policies below
-- open only the exact access the application needs.
-- ============================================================================

alter table public.governorates enable row level security;
alter table public.cities enable row level security;
alter table public.subjects enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_subjects enable row level security;
alter table public.ratings enable row level security;
alter table public.reviews enable row level security;

-- ---------------------------------------------------------------------------
-- Reference data: readable by anyone (needed on the sign-up form before a
-- session exists), writable only by admins.
-- ---------------------------------------------------------------------------
drop policy if exists "governorates_select_all" on public.governorates;
create policy "governorates_select_all" on public.governorates
  for select using (true);

drop policy if exists "governorates_admin_write" on public.governorates;
create policy "governorates_admin_write" on public.governorates
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "cities_select_all" on public.cities;
create policy "cities_select_all" on public.cities
  for select using (true);

drop policy if exists "cities_admin_write" on public.cities;
create policy "cities_admin_write" on public.cities
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "subjects_select_all" on public.subjects;
create policy "subjects_select_all" on public.subjects
  for select using (true);

drop policy if exists "subjects_admin_write" on public.subjects;
create policy "subjects_admin_write" on public.subjects
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select
  to authenticated
  using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
  for update
  to authenticated
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- user_roles
-- ---------------------------------------------------------------------------
drop policy if exists "user_roles_select_self_or_admin" on public.user_roles;
create policy "user_roles_select_self_or_admin" on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "user_roles_admin_write" on public.user_roles;
create policy "user_roles_admin_write" on public.user_roles
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- teachers
-- ---------------------------------------------------------------------------
drop policy if exists "teachers_select_published_or_owner_or_admin" on public.teachers;
create policy "teachers_select_published_or_owner_or_admin" on public.teachers
  for select
  to authenticated
  using (
    is_published = true
    or auth.uid() = profile_id
    or public.is_admin(auth.uid())
  );

drop policy if exists "teachers_insert_self_or_admin" on public.teachers;
create policy "teachers_insert_self_or_admin" on public.teachers
  for insert
  to authenticated
  with check (auth.uid() = profile_id or public.is_admin(auth.uid()));

drop policy if exists "teachers_update_self_or_admin" on public.teachers;
create policy "teachers_update_self_or_admin" on public.teachers
  for update
  to authenticated
  using (auth.uid() = profile_id or public.is_admin(auth.uid()))
  with check (auth.uid() = profile_id or public.is_admin(auth.uid()));

drop policy if exists "teachers_delete_admin_only" on public.teachers;
create policy "teachers_delete_admin_only" on public.teachers
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- teacher_subjects
-- ---------------------------------------------------------------------------
drop policy if exists "teacher_subjects_select" on public.teacher_subjects;
create policy "teacher_subjects_select" on public.teacher_subjects
  for select
  to authenticated
  using (
    exists (
      select 1 from public.teachers t
      where t.profile_id = teacher_subjects.teacher_id
        and (t.is_published or auth.uid() = t.profile_id or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "teacher_subjects_write" on public.teacher_subjects;
create policy "teacher_subjects_write" on public.teacher_subjects
  for all
  to authenticated
  using (
    exists (
      select 1 from public.teachers t
      where t.profile_id = teacher_subjects.teacher_id
        and (auth.uid() = t.profile_id or public.is_admin(auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.teachers t
      where t.profile_id = teacher_subjects.teacher_id
        and (auth.uid() = t.profile_id or public.is_admin(auth.uid()))
    )
  );

-- ---------------------------------------------------------------------------
-- ratings
-- ---------------------------------------------------------------------------
drop policy if exists "ratings_select" on public.ratings;
create policy "ratings_select" on public.ratings
  for select
  to authenticated
  using (
    exists (
      select 1 from public.teachers t
      where t.profile_id = ratings.teacher_id
        and (t.is_published or auth.uid() = t.profile_id or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "ratings_insert_self" on public.ratings;
create policy "ratings_insert_self" on public.ratings
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and auth.uid() <> ratings.teacher_id
    and exists (
      select 1 from public.teachers t
      where t.profile_id = ratings.teacher_id and t.is_published = true
    )
  );

drop policy if exists "ratings_update_self" on public.ratings;
create policy "ratings_update_self" on public.ratings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "ratings_delete_self_or_admin" on public.ratings;
create policy "ratings_delete_self_or_admin" on public.ratings
  for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews
  for select
  to authenticated
  using (
    exists (
      select 1 from public.teachers t
      where t.profile_id = reviews.teacher_id
        and (t.is_published or auth.uid() = t.profile_id or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "reviews_insert_self" on public.reviews;
create policy "reviews_insert_self" on public.reviews
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.ratings r
      where r.id = reviews.rating_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "reviews_update_self" on public.reviews;
create policy "reviews_update_self" on public.reviews
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reviews_delete_self_or_admin" on public.reviews;
create policy "reviews_delete_self_or_admin" on public.reviews
  for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin(auth.uid()));
