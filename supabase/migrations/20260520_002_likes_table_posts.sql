-- Chapter 11: posts likes table and RLS baseline
-- Note: likes table provides many-to-many relationship between posts and users for like functionality.
-- posts.id is bigint, user.id is uuid.

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint likes_unique_user_post unique(post_id, user_id)
);

create index if not exists likes_post_created_at_idx
  on public.likes (post_id, created_at desc);

create index if not exists likes_user_idx
  on public.likes (user_id);

alter table public.likes enable row level security;

drop policy if exists likes_select_all on public.likes;
drop policy if exists likes_insert_own on public.likes;
drop policy if exists likes_delete_own on public.likes;

-- Anyone can see all likes (for like count display)
create policy likes_select_all
  on public.likes
  for select
  to anon, authenticated
  using (true);

-- Only authenticated users can insert their own like
create policy likes_insert_own
  on public.likes
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Only the user who liked can delete their own like
create policy likes_delete_own
  on public.likes
  for delete
  to authenticated
  using (user_id = auth.uid());
