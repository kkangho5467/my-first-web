-- Fix ambiguous likes_count references inside toggle_hobby_like
-- This migration overrides the earlier function so deployed databases get the corrected SQL.

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

    update public.hobbies as h
    set likes_count = greatest(coalesce(h.likes_count, 0) - 1, 0)
    where h.id = p_hobby_id
    returning h.likes_count into toggle_hobby_like.likes_count;

    toggle_hobby_like.liked := false;
  else
    insert into public.hobby_likes (hobby_id, user_id)
    values (p_hobby_id, v_user_id)
    on conflict do nothing;

    if found then
      update public.hobbies as h
      set likes_count = coalesce(h.likes_count, 0) + 1
      where h.id = p_hobby_id
      returning h.likes_count into toggle_hobby_like.likes_count;
    else
      select coalesce(h.likes_count, 0)
      into toggle_hobby_like.likes_count
      from public.hobbies as h
      where h.id = p_hobby_id;
    end if;

    toggle_hobby_like.liked := true;
  end if;

  return next;
end;
$$;

grant execute on function public.toggle_hobby_like(uuid) to authenticated;