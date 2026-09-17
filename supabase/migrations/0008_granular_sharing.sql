begin;

alter table public.collection_shares add column if not exists share_collection boolean not null default true;
alter table public.collection_shares add column if not exists share_wishlist boolean not null default false;

-- Collection read policy now also requires share_collection.
drop policy if exists "Shared puzzles are readable by invited users" on public.puzzles;
create policy "Shared puzzles are readable by invited users"
  on public.puzzles
  for select
  using (
    exists (
      select 1 from public.collection_shares cs
      where cs.owner_id = puzzles.user_id
        and cs.share_collection
        and lower(cs.invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- New: wishlist can now be shared independently of the collection.
drop policy if exists "Shared wishlists are readable by invited users" on public.wishlist_items;
create policy "Shared wishlists are readable by invited users"
  on public.wishlist_items
  for select
  using (
    exists (
      select 1 from public.collection_shares cs
      where cs.owner_id = wishlist_items.user_id
        and cs.share_wishlist
        and lower(cs.invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- Photos policy now checks the matching flag depending on whether the file
-- is a puzzle photo (puzzle-img-*) or a wishlist photo (wish-img-*).
drop policy if exists "Shared photos are readable by invited users" on storage.objects;
create policy "Shared photos are readable by invited users"
  on storage.objects
  for select
  using (
    bucket_id = 'photos'
    and exists (
      select 1 from public.collection_shares cs
      where cs.owner_id::text = (storage.foldername(name))[1]
        and lower(cs.invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        and (
          (cs.share_collection and split_part(name, '/', 2) like 'puzzle-img-%')
          or (cs.share_wishlist and split_part(name, '/', 2) like 'wish-img-%')
        )
    )
  );

commit;
