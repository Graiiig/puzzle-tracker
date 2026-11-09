-- Run this if you already ran schema.sql before brand/artist became
-- removable the same way genres are (a typo'd or unused publisher/artist
-- can be cleared from every puzzle/wishlist item that has it). Safe to
-- re-run.

begin;

-- Runs as the calling user (no security definer), so RLS already confines
-- every update below to that user's own rows.
create or replace function public.clear_brand_everywhere(p_brand text)
returns void
language sql
as $$
  update public.puzzles set brand = '' where user_id = auth.uid() and brand = p_brand;
  update public.wishlist_items set brand = '' where user_id = auth.uid() and brand = p_brand;
$$;

create or replace function public.clear_artist_everywhere(p_artist text)
returns void
language sql
as $$
  update public.puzzles set artist = '' where user_id = auth.uid() and artist = p_artist;
  update public.wishlist_items set artist = '' where user_id = auth.uid() and artist = p_artist;
$$;

grant execute on function public.clear_brand_everywhere(text) to authenticated;
grant execute on function public.clear_artist_everywhere(text) to authenticated;

commit;
