-- Make sure the RPG request board can read existing tasks rows when the table is present.

do $$
begin
  if to_regclass('public.tasks') is not null then
    execute 'alter table public.tasks enable row level security';
    execute 'drop policy if exists tasks_select_public on public.tasks';
    execute 'create policy tasks_select_public on public.tasks for select to anon, authenticated using (true)';
    execute 'grant select on public.tasks to anon, authenticated';
  end if;
end $$;