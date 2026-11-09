-- Run this if you already ran schema.sql before genres became removable
-- (a typo'd or unused genre/theme can be deleted from the filter chips;
-- it's unlinked from every puzzle/wishlist item that had it, and hidden
-- from the picker even if it's one of the 5 built-in defaults). Safe to
-- re-run.

begin;

alter table public.profiles add column if not exists removed_genres text[] not null default '{}';

-- Runs as the calling user (no security definer), so RLS on puzzles and
-- wishlist_items already confines every update below to that user's own
-- rows — this can't be used to touch anyone else's data.
create or replace function public.remove_genre_everywhere(p_genre text)
returns void
language sql
as $$
  update public.profiles
    set removed_genres = array_append(removed_genres, p_genre)
    where user_id = auth.uid() and not (p_genre = any(removed_genres));

  update public.puzzles
    set genres = array_remove(genres, p_genre)
    where user_id = auth.uid() and p_genre = any(genres);

  update public.wishlist_items
    set genres = array_remove(genres, p_genre)
    where user_id = auth.uid() and p_genre = any(genres);
$$;

grant execute on function public.remove_genre_everywhere(text) to authenticated;

commit;
