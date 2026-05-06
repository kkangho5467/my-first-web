# 블로그 아키텍처 설계서 (B회차 보강)

## 1. 문서 목적

- Ch1~6에서 구현한 블로그를 기준으로, Ch8~12(Supabase CRUD/인증/RLS) 확장을 위한 구조를 명확히 정의한다.
- 화면 구조, 컴포넌트 계층, 데이터 모델, 권한 정책을 하나의 기준 문서로 통합한다.
- 팀/AI가 동일한 기준으로 기능을 확장할 수 있게 의사결정 근거를 남긴다.

## 2. 시스템 개요

- 제품 성격: 개인 블로그 + 커뮤니티 작성/댓글 + 취미 피드
- 라우팅: Next.js App Router 전용 (`app/`)
- UI: Tailwind CSS v4 + shadcn/ui 우선
- 데이터: Supabase(PostgreSQL, Auth, RLS, RPC)

핵심 도메인:

- 게시글(`posts`)과 댓글(`comments`) 중심 커뮤니티
- 사용자 프로필(`profiles`) 기반 작성자 식별
- 취미 피드(`hobbies`)와 좋아요 관계(`hobby_likes`)

## 3. 페이지 맵 (URL 구조)

| 경로 | 상태 | 목적 | 비고 |
| --- | --- | --- | --- |
| `/` | 운영 중 | 홈 대시보드 | 최신 커뮤니티/취미, 방명록, 추천 영상 |
| `/posts` | 운영 중 | 커뮤니티 목록 | 검색/카테고리/페이지네이션 |
| `/posts/[id]` | 운영 중 | 게시글 상세 | 본문, 댓글, 좋아요, 수정/삭제 |
| `/posts/new` | 운영 중 | 표준 작성 경로 | 내부적으로 `/community/write` 로직 재사용 |
| `/community/write` | 운영 중 | 게시글 작성/수정 | 쿼리(`mode=edit&id=`) 기반 편집 |
| `/daily` | 호환 경로 | 레거시 링크 대응 | `/posts`로 alias/리디렉션 |
| `/auth` | 운영 중 | 로그인/회원가입 | 인증 게이트 진입점 |
| `/mypage` | 운영 중 | 프로필 관리 | 인증 필요 |
| `/hobby` | 운영 중 | 취미 피드 | 카드 목록, 좋아요 토글 |
| `/goals` | 운영 중 | 목표 관리 | 보조 기능 페이지 |

인증 보호 경로:

- `/mypage`
- `/posts/new`
- `/community/write`

비로그인 접근 시:

- `/auth?notice=login-required`로 유도

## 4. AI 와이어프레임 기준

제출용 자산:

- `docs/wireframes/home-dashboard-v1.svg`
- `docs/wireframes/post-editor-v1.svg`

설계 원칙:

- 홈: 빠른 탐색, 최신 콘텐츠 발견, 작성 전환 CTA 강조
- 에디터: 카테고리/제목/본문/제출 흐름을 한 화면에서 명확히

## 5. 컴포넌트 계층

### 5.1 앱 셸

- `app/layout.tsx`
  - 전역 메타/폰트/토큰 초기화
- `app/components/MainLayout.tsx`
  - Header(브랜드/메뉴/인증/테마)
  - Main 컨테이너
  - Footer

### 5.2 홈

- `app/page.tsx`
  - `HomeDashboardGrid`
    - 커뮤니티 최신 글 패널
    - 취미 탭 최신 글 패널
    - 방명록
    - 영상 카드

### 5.3 커뮤니티

- `app/posts/page.tsx`
  - `DailyPostBoard`
  - 목록/검색/필터/선택 액션
- `app/posts/[id]/page.tsx`
  - `PostDetailClient`
  - 댓글 목록/작성 폼/수정삭제 액션
- `app/community/write/page.tsx`
  - `QuillEditor`
  - 작성/수정 단일 폼

### 5.4 인증/프로필/기타

- `app/auth/page.tsx` -> `AuthForm`
- `app/mypage/page.tsx` -> `MyPageClient`, `MyProfile`
- `app/hobby/page.tsx` -> `HobbyReviewClient`
- `app/goals/page.tsx`

### 5.5 UI 프리미티브 레이어 (shadcn/ui)

`components/ui/`

- `button`, `card`, `input`, `textarea`, `badge`, `dialog`
- 확장 예정: `tabs`, `sheet`, `dropdown-menu`, `toast`

## 6. 데이터 접근 계층

원칙:

- 표시 컴포넌트에서 직접 SQL/복잡 쿼리를 만들지 않는다.
- `lib/` 또는 `app/hooks/`에서 데이터 로직을 캡슐화한다.

현재 구성:

- `lib/supabaseClient.ts`: 클라이언트 인스턴스
- `lib/supabaseAuth.ts`: 세션/유저 안전 접근
- `app/hooks/useCommunityPosts.ts`: 게시글 CRUD/조회수/권한 보조
- `app/hooks/usePostComments.ts`: 댓글 조회/작성/삭제

## 7. 데이터 모델 (Supabase)

### 7.1 핵심 테이블 (확정)

기준 마이그레이션:

- `supabase/migrations/20260415_001_core_schema.sql`
- `supabase/migrations/20260429_001_posts_comments_hobbies_rls_baseline.sql` (RLS 초안 + hobbies 기준선)

#### `profiles`

- `id uuid` PK (`auth.users.id` 참조)
- `nickname text`
- `avatar_url text`
- `created_at`, `updated_at`

관계:

- `auth.users` : `profiles` = 1:1

#### `posts`

- `id uuid` PK
- `title text`, `content text`, `category text`
- `author_name text`, `author_id uuid` (`profiles.id` FK)
- `thumbnail_url text` (nullable)
- `views int`, `likes int`
- `created_at`, `updated_at`

관계:

- `profiles` : `posts` = 1:N

#### `comments`

- `id uuid` PK
- `post_id uuid` (`posts.id` FK)
- `content text`
- `author_name text`, `author_id uuid` (`profiles.id` FK)
- `created_at`, `updated_at`

관계:

- `posts` : `comments` = 1:N
- `profiles` : `comments` = 1:N

### 7.2 취미 도메인 테이블 (운영 중)

코드에서 사용 중인 엔터티:

- `hobbies` (취미 글)
- `hobby_likes` (유저-취미 좋아요 관계)

기준 마이그레이션:

- `supabase/migrations/20260427_001_hobby_likes_toggle.sql`
- `supabase/migrations/20260429_001_posts_comments_hobbies_rls_baseline.sql` (hobbies 기준선)

`hobby_likes`:

- PK: `(hobby_id, user_id)`
- `hobby_id -> hobbies.id` FK
- `user_id -> auth.users.id` FK

RPC:

- `toggle_hobby_like(p_hobby_id uuid)`
  - 좋아요 토글 + `hobbies.likes_count` 증감

관계:

- `hobbies` : `hobby_likes` = 1:N
- `auth.users` : `hobby_likes` = 1:N

## 8. 인증/권한 아키텍처

인증 소스:

- Supabase Auth 세션

UI 권한 원칙:

- 비로그인: 작성/수정/삭제 버튼 제한 + 로그인 페이지 유도
- 작성자: 본인 게시글/댓글 수정 삭제 가능
- 관리자: `admin role claim`(`auth.jwt().app_metadata.role = 'admin'`) 보유자는 정책상 허용된 범위에서 전체 관리 가능

권장 개선:

- 관리자 판별 용어를 `admin role claim` 기준으로 통일하고, 클라이언트 임시 분기를 정책 함수 기반으로 축소

### 8.1 CRUD + 인증 흐름 매트릭스

| 기능 | 라우트/화면 | 접근 계층 | 인증 요구 | 대상 테이블 |
| --- | --- | --- | --- | --- |
| 게시글 목록 조회(Read) | `/posts`, 홈 최신글 | `useCommunityPosts.fetchCommunityPosts` | 선택(비로그인 가능) | `posts` |
| 게시글 상세 조회(Read) | `/posts/[id]` | `fetchPostById` | 선택(비로그인 가능) | `posts` |
| 게시글 작성(Create) | `/posts/new`, `/community/write` | `createPostInSupabase` | 필수(로그인) | `posts` |
| 게시글 수정(Update) | `/community/write?mode=edit&id=` | `updatePostInSupabase` | 필수(작성자/관리자) | `posts` |
| 게시글 삭제(Delete) | `/posts/[id]` | `deletePostInSupabase` | 필수(작성자/관리자) | `posts` |
| 댓글 조회(Read) | `/posts/[id]` | `fetchCommentsByPostId` | 선택(비로그인 가능) | `comments` |
| 댓글 작성(Create) | `/posts/[id]` | `insertComment` | 필수(로그인) | `comments` |
| 댓글 삭제(Delete) | `/posts/[id]` | `deleteMyComment` | 필수(작성자/관리자) | `comments` |
| 취미 좋아요 토글(Update) | `/hobby` | `toggle_hobby_like` RPC | 필수(로그인) | `hobby_likes`, `hobbies` |

인증 게이트 규칙:

- 보호 경로 미인증 접근은 `/auth?notice=login-required`로 통일한다.
- UI 조건문은 사용자 경험 보조용이며, 최종 권한은 RLS/DB 정책으로 보장한다.

## 9. RLS 정책 설계 초안 (Ch8~12 대비)

`profiles`

- SELECT: 공개 또는 인증 사용자 읽기 허용
- INSERT/UPDATE: 본인 row(`auth.uid() = id`)만 허용

`posts`

- SELECT: 공개
- INSERT: 인증 사용자만, `author_id = auth.uid()` 강제
- UPDATE/DELETE: 작성자 또는 `admin role claim` 보유자 허용

적용 상태:

- `posts_select_public`
- `posts_insert_own`
- `posts_update_own_or_admin`
- `posts_delete_own_or_admin`

`comments`

- SELECT: 공개
- INSERT: 인증 사용자만, `author_id = auth.uid()` 강제
- DELETE: 작성자 또는 `admin role claim` 보유자 허용

적용 상태:

- `comments_select_public`
- `comments_insert_own`
- `comments_update_own_or_admin`
- `comments_delete_own_or_admin`

`hobby_likes`

- SELECT/INSERT/DELETE: 본인 row만 허용 (이미 적용됨)

적용된 정책(마이그레이션 기준):

- `hobby_likes_select_own`
- `hobby_likes_insert_own`
- `hobby_likes_delete_own`

RPC (`toggle_hobby_like`)

- `security definer` 사용 시 권한 상승 범위를 최소화하고 입력 검증 필수

관리자 권한 판별 함수:

- `public.is_admin_user()` (`admin role claim`: `auth.jwt().app_metadata.role = 'admin'`)

## 10. 성능/운영 기준

- 인덱스
  - `posts(created_at desc)`
  - `posts(category, created_at desc)`
  - `comments(post_id, created_at desc)`
  - `hobby_likes(user_id, created_at desc)`
- 이미지
  - 썸네일 실패 시 fallback 처리
  - 이미지 없는 게시글은 썸네일 프레임 미표시
- 검증
  - `npm run lint`
  - `npm run build`

## 11. 폴더 구조 기준

- `app/`: 라우트 + 페이지 단위 UI
- `app/components/`: 페이지 조합 컴포넌트
- `components/ui/`: shadcn 프리미티브
- `app/hooks/`: 기능 단위 데이터 훅
- `lib/`: 공통 유틸/Supabase 클라이언트
- `supabase/migrations/`: SQL 기준선
- `docs/wireframes/`: AI 와이어프레임 자산

## 12. 구현 우선순위 (B회차 이후)

1. RLS 정책을 실제 SQL로 확정하고 회귀 테스트 시나리오 작성
2. 관리자 권한 판별을 role 기반으로 치환
3. `hobbies` 테이블 DDL을 마이그레이션 기준선에 명시 추가
4. CRUD 피드백을 alert 중심에서 toast 중심으로 통합
5. 문서(`context.md`, `todo.md`)와 코드 상태를 주기적으로 동기화

## 13. 문서 단일 기준 (Source of Truth)

- 설계 기준: `ARCHITECTURE.md`
- 상태 로그: `context.md`
- 진행 체크: `todo.md`
- Copilot 지침: `.github/copilot-instructions.md` 단일 파일을 기준으로 사용
- 문서와 코드가 불일치하면 문서를 먼저 갱신한 뒤 코드에 반영한다.
