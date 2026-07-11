-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)
-- for a fresh project. Safe to re-run: uses IF NOT EXISTS / ON CONFLICT guards
-- where practical.

create extension if not exists "pgcrypto";

create table if not exists public.puzzles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text not null default '',
  genre text not null check (genre in ('Paysage', 'Animaux', 'Art', 'Fantaisie', 'Ville')),
  pieces integer not null default 0,
  status text not null check (status in ('À faire', 'En cours', 'Terminé')),
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
  genre text not null check (genre in ('Paysage', 'Animaux', 'Art', 'Fantaisie', 'Ville')),
  pieces integer not null default 0,
  priority text not null check (priority in ('Basse', 'Moyenne', 'Haute')),
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
