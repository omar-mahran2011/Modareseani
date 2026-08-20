-- ============================================================================
-- 0009_founder_badge.sql
--
-- Adds a "founding teacher" badge for the first 50 teachers whose profile
-- goes live (is_published becomes true) — not the first 50 to sign up,
-- since an incomplete/abandoned signup should never burn a founder slot.
--
-- Assignment is automatic via trigger (so it works regardless of whether a
-- teacher published on signup or later via Settings), with a manual
-- admin-only override column for correcting edge cases.
-- ============================================================================

alter table public.teachers
  add column if not exists is_founder boolean not null default false;

create index if not exists teachers_is_founder_idx on public.teachers (is_founder);

-- Backfill: if any teachers were already published before this migration
-- ran, grant founder status to the earliest 50 of them.
with earliest_published as (
  select profile_id
  from public.teachers
  where is_published = true
  order by created_at asc
  limit 50
)
update public.teachers t
set is_founder = true
from earliest_published e
where t.profile_id = e.profile_id;

create or replace function public.assign_founder_badge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  founder_count integer;
begin
  -- Only act on the transition into "published" (covers both a fresh
  -- signup that publishes immediately, and a later publish via Settings).
  if new.is_published = true and (tg_op = 'INSERT' or old.is_published = false) then
    if new.is_founder is not true then
      select count(*) into founder_count from public.teachers where is_founder = true;
      if founder_count < 50 then
        new.is_founder := true;
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists teachers_assign_founder_badge on public.teachers;
create trigger teachers_assign_founder_badge
  before insert or update of is_published on public.teachers
  for each row execute function public.assign_founder_badge();
