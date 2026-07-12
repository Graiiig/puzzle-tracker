-- Run this in the Supabase SQL editor to switch from a single "genre"
-- column to a "genres" array, preserving existing data (each puzzle's
-- current genre becomes a one-item array). Safe to re-run.

begin;

alter table public.puzzles add column if not exists genres text[] not null default '{}';
update public.puzzles set genres = array[genre] where genres = '{}' and genre is not null;
alter table public.puzzles drop column if exists genre;

alter table public.wishlist_items add column if not exists genres text[] not null default '{}';
update public.wishlist_items set genres = array[genre] where genres = '{}' and genre is not null;
alter table public.wishlist_items drop column if exists genre;

commit;
