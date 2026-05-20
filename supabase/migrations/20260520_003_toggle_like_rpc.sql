-- RPC: Atomically toggle like for a post and return new liked state and count
-- Usage: SELECT * FROM public.toggle_like(123);
-- Ensures the caller is authenticated and operates on their own user id via auth.uid()

create or replace function public.toggle_like(p_post_id bigint)
  returns table(is_liked boolean, like_count bigint)
  language plpgsql
as $$
declare
  v_uid uuid := auth.uid()::uuid;
  v_like_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  -- Check existing like
  select id into v_like_id
  from public.likes
  where post_id = p_post_id and user_id = v_uid
  limit 1;

  if found then
    -- remove like
    delete from public.likes where id = v_like_id;
    -- count likes for the post from likes table
    select count(*)::bigint into like_count from public.likes where post_id = p_post_id;
    is_liked := false;
    return next;
  else
    -- add like
    insert into public.likes(post_id, user_id) values (p_post_id, v_uid);
    -- count likes for the post from likes table
    select count(*)::bigint into like_count from public.likes where post_id = p_post_id;
    is_liked := true;
    return next;
  end if;
end;
$$;

-- Grant execute to authenticated users (optional depending on Supabase setup)
grant execute on function public.toggle_like(bigint) to authenticated;