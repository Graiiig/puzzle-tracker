-- Run this if you already ran schema.sql before the app added an English UI:
-- the app now stores status/priority as stable English keys instead of the
-- French display labels, so this renames existing rows and updates the check
-- constraints to match. Safe to re-run.

begin;

alter table public.puzzles drop constraint if exists puzzles_status_check;
update public.puzzles set status = case status
  when 'À faire' then 'todo'
  when 'En cours' then 'in_progress'
  when 'Terminé' then 'done'
  else status
end
where status in ('À faire', 'En cours', 'Terminé');
alter table public.puzzles add constraint puzzles_status_check check (status in ('todo', 'in_progress', 'done'));

alter table public.wishlist_items drop constraint if exists wishlist_items_priority_check;
update public.wishlist_items set priority = case priority
  when 'Basse' then 'low'
  when 'Moyenne' then 'medium'
  when 'Haute' then 'high'
  else priority
end
where priority in ('Basse', 'Moyenne', 'Haute');
alter table public.wishlist_items add constraint wishlist_items_priority_check check (priority in ('low', 'medium', 'high'));

commit;
