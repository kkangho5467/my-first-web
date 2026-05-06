# 권한 회귀 테스트 시나리오

## 목적

- `posts`, `comments`, `hobbies`, `hobby_likes` RLS 정책이 의도대로 동작하는지 검증한다.
- 관리자 권한 용어는 `admin role claim`(`auth.jwt().app_metadata.role = 'admin'`)으로 통일한다.
- UI 조건문과 무관하게 DB 정책(RLS/RPC)이 최종 권한 경계를 보장하는지 확인한다.

## 테스트 전제

- 대상 마이그레이션 적용:
  - `supabase/migrations/20260415_001_core_schema.sql`
  - `supabase/migrations/20260427_001_hobby_likes_toggle.sql`
  - `supabase/migrations/20260429_001_posts_comments_hobbies_rls_baseline.sql`
- 테스트 계정:
  - `user_a`: 일반 사용자 A
  - `user_b`: 일반 사용자 B
  - `admin_user`: `admin role claim` 보유 사용자
- 기본 데이터:
  - `post_a` (`author_id = user_a`)
  - `comment_a` (`author_id = user_a`, `post_id = post_a`)
  - `hobby_a` (`author_id = user_a`)

## 권한 회귀 테스트 케이스

| TC ID | 도메인 | 행위자 | 시도 액션 | 기대 결과 | 검증 포인트 |
| --- | --- | --- | --- | --- | --- |
| RLS-POST-001 | posts | 비로그인 | `SELECT posts` | 성공 | 공개 조회 정책(`posts_select_public`) 유지 |
| RLS-POST-002 | posts | 비로그인 | `INSERT posts` | 실패 | 인증 없는 쓰기 차단 |
| RLS-POST-003 | posts | `user_a` | `INSERT posts` with `author_id = user_a` | 성공 | `posts_insert_own` 정상 동작 |
| RLS-POST-004 | posts | `user_b` | `UPDATE post_a` | 실패 | 작성자 외 수정 차단 |
| RLS-POST-005 | posts | `admin_user` | `UPDATE post_a` | 성공 | `admin role claim` 경로 허용 |
| RLS-POST-006 | posts | `user_b` | `DELETE post_a` | 실패 | 작성자/관리자 외 삭제 차단 |
| RLS-COMMENT-001 | comments | 비로그인 | `SELECT comments where post_id = post_a` | 성공 | 공개 조회 정책(`comments_select_public`) 유지 |
| RLS-COMMENT-002 | comments | `user_a` | `INSERT comment` on `post_a` | 성공 | 인증 + 본인 작성 허용 |
| RLS-COMMENT-003 | comments | `user_b` | `DELETE comment_a` | 실패 | 작성자/관리자 외 삭제 차단 |
| RLS-COMMENT-004 | comments | `admin_user` | `DELETE comment_a` | 성공 | `comments_delete_own_or_admin` 확인 |
| RLS-HOBBY-001 | hobbies | 비로그인 | `INSERT hobbies` | 실패 | 취미 작성 인증 요구 확인 |
| RLS-HOBBY-002 | hobbies | `user_a` | `INSERT hobbies` with valid payload | 성공 | hobbies 쓰기 경로 정상 동작 |
| RLS-HOBBY-003 | hobbies | `user_b` | `UPDATE hobby_a` | 실패 | 작성자 외 수정 차단 |
| RLS-LIKE-001 | hobby_likes | `user_a` | `SELECT hobby_likes where user_id = user_a` | 성공 | `hobby_likes_select_own` 확인 |
| RLS-LIKE-002 | hobby_likes | `user_b` | `SELECT hobby_likes where user_id = user_a` | 실패 또는 빈 결과 | 타인 like row 접근 차단 |
| RLS-LIKE-003 | hobby_likes | `user_b` | `INSERT (hobby_id = hobby_a, user_id = user_a)` | 실패 | 본인 row 강제(`hobby_likes_insert_own`) |
| RLS-RPC-001 | toggle_hobby_like | `user_a` | `rpc('toggle_hobby_like', { p_hobby_id: hobby_a })` | 성공 | like 토글 + `hobbies.likes_count` 동기화 |
| RLS-RPC-002 | toggle_hobby_like | 비로그인 | 동일 RPC 호출 | 실패 | 인증 없는 RPC 호출 차단 |
| RLS-ADMIN-001 | 공통 | `admin_user` | posts/comments 관리 액션 수행 | 성공 | `public.is_admin_user()` + claim 경로 확인 |
| RLS-ADMIN-002 | 공통 | 일반 사용자 | JWT에 `admin role claim` 없음 | 관리자 경로 실패 | claim 기반 권한 경계 검증 |

## 실행 체크리스트

- 각 케이스 실행 전 `auth.uid()`와 JWT claim 값(`app_metadata.role`)을 로그로 확인한다.
- 실패 케이스는 HTTP 상태코드/에러 메시지를 캡처해 증빙한다.
- 성공 케이스는 변경 전후 row count 또는 대상 row 스냅샷으로 검증한다.
- 정책 수정 후에는 최소 `posts/comments/hobby_likes/RPC` 대표 케이스 1개씩 재실행한다.

## 결과 기록 템플릿

| 날짜 | 실행자 | 실패 케이스 | 원인 | 조치 | 재검증 |
| --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | 이름 | TC ID | 예: policy 조건 누락 | 마이그레이션 수정 | Pass/Fail |
