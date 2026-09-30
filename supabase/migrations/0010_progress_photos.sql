-- Run this if you already ran schema.sql before progress photos were added
-- (multiple optional photos per puzzle taken while assembling it, on top of
-- the single main photo). Safe to re-run.

begin;

alter table public.puzzles add column if not exists progress_photos text[] not null default '{}';

commit;
