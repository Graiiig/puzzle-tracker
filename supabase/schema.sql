-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)
-- for a fresh project. Safe to re-run: uses IF NOT EXISTS / ON CONFLICT guards
-- where practical.

create extension if not exists "pgcrypto";

create table if not exists public.puzzles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text not null default '',
  artist text not null default '',
  genres text[] not null default '{}',
  pieces integer not null default 0,
  status text not null check (status in ('todo', 'in_progress', 'done')),
  rating integer not null default 0 check (rating between 0 and 5),
  difficulty integer not null default 3 check (difficulty between 1 and 5),
  date text not null default '',
  time text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text not null default '',
  artist text not null default '',
  genres text[] not null default '{}',
  pieces integer not null default 0,
  priority text not null check (priority in ('low', 'medium', 'high')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.puzzles enable row level security;
alter table public.wishlist_items enable row level security;

drop policy if exists "Users manage their own puzzles" on public.puzzles;
create policy "Users manage their own puzzles"
  on public.puzzles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own wishlist items" on public.wishlist_items;
create policy "Users manage their own wishlist items"
  on public.wishlist_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Photo storage: one private bucket, objects namespaced as {user_id}/{image_id}.jpg
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

drop policy if exists "Users manage their own photos" on storage.objects;
create policy "Users manage their own photos"
  on storage.objects
  for all
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- One row per user: pseudo (shown to people a collection is shared with)
-- and is_premium (the premium entitlement flag).
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists pseudo text not null default '';
alter table public.profiles add column if not exists is_premium boolean not null default false;

alter table public.profiles enable row level security;

-- Users can freely manage their own row (e.g. edit their pseudo) — the
-- guard_premium_column trigger further down stops that from being used to
-- self-grant is_premium, since RLS alone has no column-level granularity.
drop policy if exists "Users manage their own profile" on public.profiles;
create policy "Users manage their own profile"
  on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- Guards is_premium against being self-granted through the permissive
-- "manage own profile" policy above — see 0009_premium_entitlement.sql for
-- the full rationale. Requests from a normal client (role 'authenticated')
-- have is_premium silently forced back to its previous value; requests with
-- no JWT role (the Supabase SQL editor) or role 'service_role' go through.
create or replace function public.guard_premium_column()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if auth.role() = 'authenticated' then
      new.is_premium := false;
    end if;
  elsif tg_op = 'UPDATE' then
    if new.is_premium is distinct from old.is_premium and auth.role() = 'authenticated' then
      new.is_premium := old.is_premium;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_premium_column on public.profiles;
create trigger guard_premium_column
  before insert or update on public.profiles
  for each row execute function public.guard_premium_column();

-- Read-only collection sharing: the owner invites by email (no confirmation
-- flow — the invited person sees it the moment they log in with that email).
create table if not exists public.collection_shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  invited_email text not null,
  share_collection boolean not null default true,
  share_wishlist boolean not null default false,
  created_at timestamptz not null default now(),
  unique (owner_id, invited_email)
);

alter table public.collection_shares enable row level security;

drop policy if exists "Owners manage their own shares" on public.collection_shares;
create policy "Owners manage their own shares"
  on public.collection_shares
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Invited users see shares addressed to them" on public.collection_shares;
create policy "Invited users see shares addressed to them"
  on public.collection_shares
  for select
  using (lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "Invited users read the sharer's profile" on public.profiles;
create policy "Invited users read the sharer's profile"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.collection_shares cs
      where cs.owner_id = profiles.user_id
        and lower(cs.invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

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
