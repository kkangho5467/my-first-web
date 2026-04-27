-- Phase 1: Hobby likes toggle model
-- 1) hobby_likes 관계 테이블 추가 (user_id + hobby_id 유니크)
-- 2) likes_count 안전 증감 RPC 추가

create table if not exists public.hobby_likes (
  hobby_id uuid not null references public.hobbies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (hobby_id, user_id)
);

create index if not exists hobby_likes_user_created_at_idx
  on public.hobby_likes (user_id, created_at desc);

alter table public.hobby_likes enable row level security;

drop policy if exists hobby_likes_select_own on public.hobby_likes;
drop policy if exists hobby_likes_insert_own on public.hobby_likes;
drop policy if exists hobby_likes_delete_own on public.hobby_likes;

-- 본인 좋아요 행만 조회 허용
create policy hobby_likes_select_own
  on public.hobby_likes
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 본인 좋아요 행만 삽입 허용
create policy hobby_likes_insert_own
  on public.hobby_likes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 본인 좋아요 행만 삭제 허용
create policy hobby_likes_delete_own
  on public.hobby_likes
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.toggle_hobby_like(p_hobby_id uuid)
returns table(liked boolean, likes_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_exists boolean;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception '로그인이 필요한 기능입니다.';
  end if;

  if not exists (select 1 from public.hobbies where id = p_hobby_id) then
    raise exception '대상 취미 글을 찾을 수 없습니다.';
  end if;

  select exists(
    select 1
    from public.hobby_likes
    where hobby_id = p_hobby_id
      and user_id = v_user_id
  ) into v_exists;

  if v_exists then
    delete from public.hobby_likes
    where hobby_id = p_hobby_id
      and user_id = v_user_id;

    update public.hobbies
    set likes_count = greatest(coalesce(likes_count, 0) - 1, 0)
    where id = p_hobby_id
    returning hobbies.likes_count into toggle_hobby_like.likes_count;

    toggle_hobby_like.liked := false;
  else
    insert into public.hobby_likes (hobby_id, user_id)
    values (p_hobby_id, v_user_id)
    on conflict do nothing;

    -- 충돌이 없을 때만 카운트 증가
    if found then
      update public.hobbies
      set likes_count = coalesce(likes_count, 0) + 1
      where id = p_hobby_id
      returning hobbies.likes_count into toggle_hobby_like.likes_count;
    else
      select coalesce(likes_count, 0)
      into toggle_hobby_like.likes_count
      from public.hobbies
      where id = p_hobby_id;
    end if;

    toggle_hobby_like.liked := true;
  end if;

  return next;
end;
$$;

grant select, insert, delete on table public.hobby_likes to authenticated;
grant execute on function public.toggle_hobby_like(uuid) to authenticated;
