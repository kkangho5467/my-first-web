-- Auto-create profiles for Supabase Auth users

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  preferred_nickname text;
  fallback_nickname text;
begin
  preferred_nickname := left(
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'nickname'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      left(replace(new.id::text, '-', ''), 30)
    ),
    30
  );

  fallback_nickname := left(preferred_nickname, 21) || '_' || substring(md5(new.id::text) from 1 for 8);

  begin
    insert into public.profiles (id, nickname, avatar_url)
    values (new.id, preferred_nickname, null);
  exception
    when unique_violation then
      begin
        insert into public.profiles (id, nickname, avatar_url)
        values (new.id, fallback_nickname, null);
      exception
        when unique_violation then
          insert into public.profiles (id, nickname, avatar_url)
          values (new.id, left(replace(new.id::text, '-', ''), 30), null)
          on conflict (id) do nothing;
      end;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

do $$
declare
  user_record record;
  preferred_nickname text;
  fallback_nickname text;
begin
  for user_record in
    select u.id, u.email, u.raw_user_meta_data
    from auth.users u
    left join public.profiles p on p.id = u.id
    where p.id is null
    order by u.created_at, u.id
  loop
    preferred_nickname := left(
      coalesce(
        nullif(trim(user_record.raw_user_meta_data->>'nickname'), ''),
        nullif(split_part(coalesce(user_record.email, ''), '@', 1), ''),
        left(replace(user_record.id::text, '-', ''), 30)
      ),
      30
    );

    fallback_nickname := left(preferred_nickname, 21) || '_' || substring(md5(user_record.id::text) from 1 for 8);

    begin
      insert into public.profiles (id, nickname, avatar_url)
      values (user_record.id, preferred_nickname, null);
    exception
      when unique_violation then
        begin
          insert into public.profiles (id, nickname, avatar_url)
          values (user_record.id, fallback_nickname, null);
        exception
          when unique_violation then
            insert into public.profiles (id, nickname, avatar_url)
            values (user_record.id, left(replace(user_record.id::text, '-', ''), 30), null)
            on conflict (id) do nothing;
        end;
    end;
  end loop;
end;
$$;
