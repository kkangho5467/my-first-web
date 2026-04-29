-- Phase B finalization: posts/comments RLS draft + hobbies baseline schema
-- 목적:
-- 1) posts/comments/hobbies 테이블의 RLS 정책 초안을 코드와 맞춘다.
-- 2) hobbies 테이블 기준선을 명시해 문서-스키마 불일치 리스크를 줄인다.

create extension if not exists pgcrypto;

-- JWT app_metadata.role = 'admin' 클레임을 사용하는 관리자 판별 함수
create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- hobbies 기준선 (없으면 생성)
create table if not exists public.hobbies (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  title text not null,
  rating integer not null default 5,
  comment text not null,
  author_nickname text not null,
  likes_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hobbies_title_len check (char_length(title) between 1 and 120),
  constraint hobbies_rating_range check (rating between 1 and 5),
  constraint hobbies_likes_non_negative check (likes_count >= 0)
);

-- 기존 운영 DB가 있을 수 있으므로 컬럼 누락만 보강
alter table public.hobbies add column if not exists likes_count integer not null default 0;
alter table public.hobbies add column if not exists created_at timestamptz not null default now();
alter table public.hobbies add column if not exists updated_at timestamptz not null default now();

create index if not exists hobbies_created_at_idx
  on public.hobbies (created_at desc);

create index if not exists hobbies_author_idx
  on public.hobbies (author_id);

-- updated_at 자동 갱신 트리거는 core schema 함수 재사용
create trigger hobbies_set_updated_at
before update on public.hobbies
for each row
execute function public.set_updated_at();

-- RLS 활성화
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.hobbies enable row level security;

-- posts 정책
drop policy if exists posts_select_public on public.posts;
drop policy if exists posts_insert_own on public.posts;
drop policy if exists posts_update_own_or_admin on public.posts;
drop policy if exists posts_delete_own_or_admin on public.posts;

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

create policy posts_update_own_or_admin
  on public.posts
  for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin_user())
  with check (author_id = auth.uid() or public.is_admin_user());

create policy posts_delete_own_or_admin
  on public.posts
  for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin_user());

-- comments 정책
drop policy if exists comments_select_public on public.comments;
drop policy if exists comments_insert_own on public.comments;
drop policy if exists comments_update_own_or_admin on public.comments;
drop policy if exists comments_delete_own_or_admin on public.comments;

create policy comments_select_public
  on public.comments
  for select
  to anon, authenticated
  using (true);

create policy comments_insert_own
  on public.comments
  for insert
  to authenticated
  with check (author_id = auth.uid());

create policy comments_update_own_or_admin
  on public.comments
  for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin_user())
  with check (author_id = auth.uid() or public.is_admin_user());

create policy comments_delete_own_or_admin
  on public.comments
  for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin_user());

-- hobbies 정책
drop policy if exists hobbies_select_public on public.hobbies;
drop policy if exists hobbies_insert_own on public.hobbies;
drop policy if exists hobbies_update_own_or_admin on public.hobbies;
drop policy if exists hobbies_delete_own_or_admin on public.hobbies;

create policy hobbies_select_public
  on public.hobbies
  for select
  to anon, authenticated
  using (true);

create policy hobbies_insert_own
  on public.hobbies
  for insert
  to authenticated
  with check (author_id = auth.uid());

create policy hobbies_update_own_or_admin
  on public.hobbies
  for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin_user())
  with check (author_id = auth.uid() or public.is_admin_user());

create policy hobbies_delete_own_or_admin
  on public.hobbies
  for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin_user());

grant execute on function public.is_admin_user() to authenticated;
