# Supabase 스키마 적용 가이드

## 대상 마이그레이션

- supabase/migrations/20260415_001_core_schema.sql

## 적용 전 체크리스트

- 프로젝트의 Supabase 인스턴스가 준비되어 있는지 확인
- auth.users를 사용하는 인증 흐름이 이미 활성화되어 있는지 확인
- 운영 DB에 적용 전, 개발 프로젝트에서 먼저 실행

## 방법 1: Supabase SQL Editor에서 수동 적용

1. Supabase 대시보드 접속
2. SQL Editor 열기
3. supabase/migrations/20260415_001_core_schema.sql 내용을 붙여넣기
4. Run 실행
5. Table Editor에서 profiles, posts, comments 생성 여부 확인

## 방법 2: Supabase CLI로 적용(권장)

1. Supabase CLI 설치 확인

```bash
supabase --version
```

2. 프로젝트 루트에서 링크

```bash
supabase link --project-ref <PROJECT_REF>
```

3. 마이그레이션 적용

```bash
supabase db push
```

## 적용 후 검증 SQL

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles', 'posts', 'comments')
order by table_name;
```

```sql
select conname, conrelid::regclass as table_name
from pg_constraint
where conname in (
  'posts_author_id_fkey',
  'comments_post_id_fkey',
  'comments_author_id_fkey'
)
order by conname;
```

## 주의사항

- 기존 데이터가 있는 경우 제약 조건(check/fk) 때문에 실패할 수 있음
- 실패 시 에러 메시지를 먼저 확인하고 데이터 정합성부터 보정
- 본 프로젝트는 views, likes를 유지하므로 0 미만 값이 없도록 관리
