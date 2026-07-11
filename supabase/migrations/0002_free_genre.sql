-- Run this in the Supabase SQL editor if you already ran the original
-- schema.sql (which locked "genre" to a fixed list). Genres are now
-- free-form so people can add their own from the app. Safe to re-run.

alter table public.puzzles drop constraint if exists puzzles_genre_check;
alter table public.wishlist_items drop constraint if exists wishlist_items_genre_check;
