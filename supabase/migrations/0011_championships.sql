-- Public read-mostly table of puzzle championships/events shown in the app
-- (a "Championnats" screen). Regular users only ever read published rows;
-- all writes go through the separate static admin page (dist/admin.html),
-- gated to one account by the RLS policy below.
create table if not exists public.championships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_date date not null,
  end_date date,
  location text not null default '',
  stream_url text,
  info_url text,
  is_live boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.championships enable row level security;

drop policy if exists "Published championships are readable by everyone" on public.championships;
create policy "Published championships are readable by everyone"
  on public.championships
  for select
  using (is_published);

drop policy if exists "Admin manages championships" on public.championships;
create policy "Admin manages championships"
  on public.championships
  for all
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'gregory.verguin@hotmail.fr')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'gregory.verguin@hotmail.fr');
