-- Phase 3: Core data model for profiles, posts, comments
-- Target: Supabase (PostgreSQL)

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nickname_len check (char_length(nickname) between 2 and 30)
);

create unique index if not exists profiles_nickname_unique_idx
  on public.profiles (lower(nickname));

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default '자유수다',
  author_name text not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  thumbnail_url text,
  views integer not null default 0,
  likes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_title_len check (char_length(title) between 1 and 120),
  constraint posts_category_allowed check (category in ('자유수다', '질문/답변', '정보공유')),
  constraint posts_views_non_negative check (views >= 0),
  constraint posts_likes_non_negative check (likes >= 0)
);

create index if not exists posts_author_idx
  on public.posts (author_id);

create index if not exists posts_created_at_idx
  on public.posts (created_at desc);

create index if not exists posts_category_created_at_idx
  on public.posts (category, created_at desc);

create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  content text not null,
  author_name text not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_content_len check (char_length(content) between 1 and 1000)
);

create index if not exists comments_post_created_at_idx
  on public.comments (post_id, created_at desc);

create index if not exists comments_author_idx
  on public.comments (author_id);

create trigger comments_set_updated_at
before update on public.comments
for each row
execute function public.set_updated_at();
