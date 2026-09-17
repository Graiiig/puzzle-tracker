begin;

-- One row per user. Not "create table ... (col ...)" only, since another
-- pending feature may create this same table first with different columns —
-- add columns defensively so this migration works regardless of order.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists pseudo text not null default '';

alter table public.profiles enable row level security;

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

-- Read-only collection sharing: the owner invites by email (no confirmation
-- flow — the invited person sees it the moment they log in with that email).
create table if not exists public.collection_shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  invited_email text not null,
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

-- Lets an invited user look up the pseudo of someone who shared with them —
-- the owner's own "manage their own profile" policy doesn't cover this.
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

-- Grants invited users read-only access to the owner's puzzles, on top of
-- (not instead of) the existing owner-only "for all" policy — Postgres OR's
-- permissive policies together, so this only ever adds visibility, never
-- write access.
drop policy if exists "Shared puzzles are readable by invited users" on public.puzzles;
create policy "Shared puzzles are readable by invited users"
  on public.puzzles
  for select
  using (
    exists (
      select 1 from public.collection_shares cs
      where cs.owner_id = puzzles.user_id
        and lower(cs.invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

commit;
