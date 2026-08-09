-- ============================================================================
-- 0002_tables.sql
-- Core relational schema for the Teacher Directory platform.
--
-- Design note on privacy: `profiles` holds account data (including email)
-- and is only ever readable by its owner or an admin (see 0004 RLS policy).
-- Public-safe display fields a teacher chooses to publish (name, photo,
-- location) are denormalized onto `teachers`, and a reviewer's display name
-- is captured onto `reviews` at write time. This means the directory and
-- review UI never need to read another user's `profiles` row, so a private
-- field like email can never leak through a crafted API request.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Reference data: governorates / cities / subjects
-- ---------------------------------------------------------------------------
create table if not exists public.governorates (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.cities (
  id bigint generated always as identity primary key,
  governorate_id bigint not null references public.governorates (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (governorate_id, name)
);

create index if not exists cities_governorate_id_idx on public.cities (governorate_id);

create table if not exists public.subjects (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user, shared by students and teachers.
-- Private: only the owner or an admin may ever select this table (0004).
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  account_type public.account_type not null default 'student',
  governorate_id bigint references public.governorates (id) on delete set null,
  city_id bigint references public.cities (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_governorate_id_idx on public.profiles (governorate_id);
create index if not exists profiles_city_id_idx on public.profiles (city_id);
create index if not exists profiles_account_type_idx on public.profiles (account_type);

-- ---------------------------------------------------------------------------
-- Roles: administrative permissions, kept separate from the public account type
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ---------------------------------------------------------------------------
-- Teachers: extended, publishable profile for teacher-typed accounts.
-- display_name / avatar_url / governorate_id / city_id are a denormalized,
-- always-in-sync copy of the same fields on `profiles` (see the
-- sync_teacher_public_fields trigger in 0003) so public reads never touch
-- the private `profiles` table.
-- ---------------------------------------------------------------------------
create table if not exists public.teachers (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  governorate_id bigint references public.governorates (id) on delete set null,
  city_id bigint references public.cities (id) on delete set null,
  bio text not null default '',
  years_experience integer not null default 0 check (years_experience >= 0 and years_experience <= 80),
  grade_levels text[] not null default '{}',
  teaching_method public.teaching_method not null default 'both',
  phone text,
  whatsapp text,
  is_published boolean not null default false,
  avg_rating numeric(3, 2) not null default 0,
  ratings_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teachers_is_published_idx on public.teachers (is_published);
create index if not exists teachers_governorate_id_idx on public.teachers (governorate_id);
create index if not exists teachers_city_id_idx on public.teachers (city_id);
create index if not exists teachers_avg_rating_idx on public.teachers (avg_rating desc);
create index if not exists teachers_years_experience_idx on public.teachers (years_experience desc);

comment on column public.teachers.is_published is
  'A teacher only appears in public search results once this is true. Set automatically when required fields are completed.';

-- ---------------------------------------------------------------------------
-- Teacher <-> Subject (many to many)
-- ---------------------------------------------------------------------------
create table if not exists public.teacher_subjects (
  teacher_id uuid not null references public.teachers (profile_id) on delete cascade,
  subject_id bigint not null references public.subjects (id) on delete cascade,
  primary key (teacher_id, subject_id)
);

create index if not exists teacher_subjects_subject_id_idx on public.teacher_subjects (subject_id);

-- ---------------------------------------------------------------------------
-- Ratings: one star rating per (teacher, user)
-- ---------------------------------------------------------------------------
create table if not exists public.ratings (
  id bigint generated always as identity primary key,
  teacher_id uuid not null references public.teachers (profile_id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_id, user_id)
);

create index if not exists ratings_teacher_id_idx on public.ratings (teacher_id);
create index if not exists ratings_user_id_idx on public.ratings (user_id);

-- ---------------------------------------------------------------------------
-- Reviews: optional written text attached 1:1 to a rating. author_name /
-- author_avatar_url are captured from the reviewer's profile at write time
-- (see validate_review_owner trigger in 0003) for the same privacy reason
-- described above.
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  rating_id bigint not null unique references public.ratings (id) on delete cascade,
  teacher_id uuid not null references public.teachers (profile_id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null default '',
  author_avatar_url text,
  comment text not null check (char_length(comment) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists reviews_teacher_id_idx on public.reviews (teacher_id);
create index if not exists reviews_user_id_idx on public.reviews (user_id);
