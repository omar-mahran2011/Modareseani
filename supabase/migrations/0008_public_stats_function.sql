-- ============================================================================
-- 0008_public_stats_function.sql
--
-- The landing page ("/") is shown to signed-out visitors by design, and
-- displays a small "X teachers, Y reviews" trust strip. But `teachers` and
-- `reviews` SELECT policies are scoped `to authenticated` (see 0004) — so
-- an anonymous visitor's count query returns 0 regardless of how much real
-- data exists, since RLS hides every row before the count even runs.
--
-- Fix: a SECURITY DEFINER function that returns only two integers (never
-- row data, never anything from `profiles`), callable by the `anon` role.
-- This keeps the "must log in to browse" design intact while still letting
-- the public landing page show real numbers.
-- ============================================================================

create or replace function public.get_public_stats()
returns table (published_teachers integer, total_reviews integer)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*)::integer from public.teachers where is_published = true),
    (select count(*)::integer from public.reviews);
$$;

grant execute on function public.get_public_stats() to anon, authenticated;
