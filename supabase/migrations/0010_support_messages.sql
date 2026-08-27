-- ============================================================================
-- 0010_support_messages.sql
--
-- Support/contact form: any authenticated user can submit a message
-- (technical problem, reporting a teacher, a question, a suggestion). Users
-- can see their own messages; only admins can see/manage all of them.
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'support_category') then
    create type public.support_category as enum (
      'technical', 'report_teacher', 'inquiry', 'suggestion', 'other'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'support_status') then
    create type public.support_status as enum ('open', 'resolved');
  end if;
end
$$;

create table if not exists public.support_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  category public.support_category not null default 'other',
  related_teacher_id uuid references public.teachers (profile_id) on delete set null,
  message text not null,
  status public.support_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_messages_user_id_idx on public.support_messages (user_id);
create index if not exists support_messages_status_idx on public.support_messages (status);

-- set_updated_at() already exists (see 0003_functions_and_triggers.sql) —
-- just attach it here.
drop trigger if exists support_messages_set_updated_at on public.support_messages;
create trigger support_messages_set_updated_at
  before update on public.support_messages
  for each row execute function public.set_updated_at();

alter table public.support_messages enable row level security;

drop policy if exists "support_messages_insert_self" on public.support_messages;
create policy "support_messages_insert_self" on public.support_messages
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "support_messages_select_own_or_admin" on public.support_messages;
create policy "support_messages_select_own_or_admin" on public.support_messages
  for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "support_messages_update_admin" on public.support_messages;
create policy "support_messages_update_admin" on public.support_messages
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "support_messages_delete_admin" on public.support_messages;
create policy "support_messages_delete_admin" on public.support_messages
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));
