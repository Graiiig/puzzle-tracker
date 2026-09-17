begin;

-- Collection sharing (0006) granted read access to puzzle rows, but photos
-- live in a separate private storage bucket namespaced by owner id — this
-- was still blocking invited viewers from seeing any photo.
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
    )
  );

commit;
