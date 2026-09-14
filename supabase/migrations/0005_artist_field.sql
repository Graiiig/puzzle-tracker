-- Run this if you already ran schema.sql before the optional "artist"
-- field (the illustrator/artist behind the puzzle's artwork) was added.
-- Safe to re-run.

begin;

alter table public.puzzles add column if not exists artist text not null default '';
alter table public.wishlist_items add column if not exists artist text not null default '';

commit;
