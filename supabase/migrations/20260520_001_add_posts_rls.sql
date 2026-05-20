-- Chapter 11: posts RLS baseline (idempotent)
-- Note: This project uses author_id on public.posts, which maps to the lecture's user_id concept.
-- Keep policy names stable and drop existing ones first to avoid duplicate policy errors.

alter table public.posts enable row level security;

drop policy if exists posts_select_public on public.posts;
drop policy if exists posts_insert_own on public.posts;
drop policy if exists posts_update_own_or_admin on public.posts;
drop policy if exists posts_update_own on public.posts;
drop policy if exists posts_delete_own_or_admin on public.posts;
drop policy if exists posts_delete_own on public.posts;

create policy posts_select_public
  on public.posts
  for select
  to anon, authenticated
  using (true);

create policy posts_insert_own
  on public.posts
  for insert
  to authenticated
  with check (author_id = auth.uid());

create policy posts_update_own
  on public.posts
  for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy posts_delete_own
  on public.posts
  for delete
  to authenticated
  using (author_id = auth.uid());
