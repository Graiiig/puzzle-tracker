-- Run this if you already ran schema.sql before EAN-based community stats
-- were added (barcode scans now carry the EAN through to a puzzle; existing
-- rows added before this migration stay '' and never contribute to or show
-- these stats). Safe to re-run.

begin;

alter table public.puzzles add column if not exists ean text not null default '';

create index if not exists puzzles_ean_idx on public.puzzles (ean) where ean <> '';

-- Privacy-safe aggregate: runs as the table owner (security definer) so it
-- can read every user's rows for the same EAN, but only ever returns
-- computed aggregates, never a raw row, so it can be granted to any
-- authenticated user without leaking another user's individual data. The
-- caller (see usePuzzleEanStats) additionally hides the whole result below
-- 3 distinct collectors; collector_count is nulled out here too as a
-- second guard against ever exposing one or two other users' exact values.
create or replace function public.get_puzzle_ean_stats(p_ean text)
returns table (
  collector_count integer,
  avg_rating numeric,
  avg_difficulty numeric,
  avg_minutes numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with matches as (
    select * from public.puzzles where p_ean <> '' and ean = p_ean
  ),
  done as (
    select * from matches where status = 'done'
  ),
  timed as (
    select
      coalesce((regexp_match(time, '(\d+)\s*h\s*(\d{1,2})?', 'i'))[1]::int, 0) * 60
      + coalesce((regexp_match(time, '(\d+)\s*h\s*(\d{1,2})?', 'i'))[2]::int, 0) as minutes
    from done
    where time ~* '\d+\s*h'
  ),
  counted as (
    select count(distinct user_id)::integer as n from matches
  )
  select
    case when counted.n >= 3 then counted.n end,
    case when counted.n >= 3 then (select avg(rating) from done where rating > 0) end,
    case when counted.n >= 3 then (select avg(difficulty) from done where difficulty > 0) end,
    case when counted.n >= 3 then (select avg(minutes) from timed where minutes > 0) end
  from counted;
$$;

grant execute on function public.get_puzzle_ean_stats(text) to authenticated;

commit;
