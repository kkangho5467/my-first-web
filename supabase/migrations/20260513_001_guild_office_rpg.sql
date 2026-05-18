-- Guild Office RPG expansion
-- Adds management-RPG stats to profiles and creates a request-driven monsters table.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists level integer not null default 1,
  add column if not exists current_hp integer not null default 100,
  add column if not exists max_hp integer not null default 100,
  add column if not exists atk integer not null default 25,
  add column if not exists def integer not null default 10,
  add column if not exists gold integer not null default 500,
  add column if not exists experience integer not null default 0;

create table if not exists public.monsters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  category text not null default '업무 의뢰',
  element text,
  level integer not null default 1,
  current_hp integer not null default 10,
  max_hp integer not null default 10,
  atk integer not null default 5,
  def integer not null default 3,
  mental_cost integer not null default 10,
  gold_reward integer not null default 50,
  exp_reward integer not null default 20,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monsters_level_positive check (level >= 1),
  constraint monsters_current_hp_non_negative check (current_hp >= 0),
  constraint monsters_max_hp_positive check (max_hp >= 1),
  constraint monsters_atk_non_negative check (atk >= 0),
  constraint monsters_def_non_negative check (def >= 0),
  constraint monsters_mental_cost_non_negative check (mental_cost >= 0),
  constraint monsters_gold_reward_non_negative check (gold_reward >= 0),
  constraint monsters_exp_reward_non_negative check (exp_reward >= 0)
);

create trigger monsters_set_updated_at
before update on public.monsters
for each row
execute function public.set_updated_at();

alter table public.monsters enable row level security;

drop policy if exists monsters_select_public on public.monsters;
create policy monsters_select_public
  on public.monsters
  for select
  to anon, authenticated
  using (true);

-- 기본 의뢰 3건을 안전하게 채워 넣는다.
insert into public.monsters (name, description, category, element, level, current_hp, max_hp, atk, def, mental_cost, gold_reward, exp_reward)
select
  '긴급 문서 정리',
  '산처럼 쌓인 문서를 분류하고 제출 기한을 맞추는 초급 의뢰입니다.',
  '접수된 의뢰',
  '행정',
  1,
  12,
  12,
  4,
  2,
  8,
  120,
  35
where not exists (select 1 from public.monsters where name = '긴급 문서 정리');

insert into public.monsters (name, description, category, element, level, current_hp, max_hp, atk, def, mental_cost, gold_reward, exp_reward)
select
  '예산 협상',
  '거래처와 조건을 맞추고 예산을 확보해야 하는 중급 의뢰입니다.',
  '접수된 의뢰',
  '협상',
  2,
  18,
  18,
  8,
  5,
  12,
  180,
  55
where not exists (select 1 from public.monsters where name = '예산 협상');

insert into public.monsters (name, description, category, element, level, current_hp, max_hp, atk, def, mental_cost, gold_reward, exp_reward)
select
  '민원 대응',
  '긴급 민원을 안정적으로 처리하는 숙련 의뢰입니다.',
  '접수된 의뢰',
  '대응',
  3,
  24,
  24,
  11,
  8,
  16,
  260,
  80
where not exists (select 1 from public.monsters where name = '민원 대응');

-- profiles는 본인 데이터만 읽고 갱신할 수 있어야 한다.
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

grant execute on function public.set_updated_at() to authenticated;
