begin;

-- profiles already exists (0006_collection_sharing.sql added it for pseudo,
-- with a permissive "manage own profile" FOR ALL policy so users can edit
-- their own pseudo). Add the premium flag on top of that.
alter table public.profiles add column if not exists is_premium boolean not null default false;

-- The existing FOR ALL policy would otherwise let a user set their own
-- is_premium to true via a direct API call (RLS has no column-level
-- granularity). Guard it with a trigger instead: any insert/update coming
-- from a normal client request (role 'authenticated') has is_premium
-- silently forced back to its previous value (false on insert). Requests
-- with no JWT role at all — i.e. run directly in the Supabase SQL editor —
-- or from a service-role key are left untouched, so granting premium
-- manually (or later via a billing webhook) still works.
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

commit;
