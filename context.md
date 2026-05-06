# 프로젝트 컨텍스트

## 기준 정보

- 워크스페이스: c:\my-first-web
- 최신 갱신일: 2026-05-04
- 프레임워크: Next.js 16.2.1 (App Router)
- 런타임: React 19.2.4
- 스타일: Tailwind CSS v4 + shadcn/ui
- 데이터: Supabase (Auth, Postgres, RLS, RPC)

## 현재 라우트 스냅샷

- `/` 홈 대시보드
- `/posts` 커뮤니티 목록
- `/posts/[id]` 게시글 상세
- `/posts/new` 표준 작성 경로
- `/community/write` 작성/수정 운영 경로
- `/daily` 레거시 alias (`/posts`)
- `/auth` 인증 진입
- `/mypage` 프로필
- `/hobby` 취미 피드
- `/goals` 목표 관리

## 기술 결정 사항

- 기본은 Server Component, 상태/브라우저 API 필요 시만 Client Component 사용.
- 내비게이션은 `next/navigation`만 사용.
- 디자인 토큰은 CSS 변수(`app/globals.css`)로 관리.
- UI 프리미티브는 shadcn/ui를 우선 사용.
- 데이터 접근은 `lib/*`, `app/hooks/*`에 분리.
- 커뮤니티 에디터는 `react-quill` 대신 커스텀 `quill` 초기화 방식 유지.

## 데이터 모델 기준선

- 핵심 스키마: `profiles`, `posts`, `comments`
- 취미 확장: `hobby_likes` + `toggle_hobby_like(uuid)` RPC
- 참고 마이그레이션:
	- `supabase/migrations/20260415_001_core_schema.sql`
	- `supabase/migrations/20260427_001_hobby_likes_toggle.sql`
	- `supabase/migrations/20260429_001_posts_comments_hobbies_rls_baseline.sql`

## 인증/권한 현재 상태

- 보호 라우트: `/mypage`, `/posts/new`, `/community/write`
- 비로그인 사용자는 `/auth?notice=login-required`로 이동.
- UI 레벨에서 작성자/관리자 권한 분기 존재.
- 관리자 권한 용어는 `admin role claim`(`auth.jwt().app_metadata.role = 'admin'`)으로 통일.
- `hobby_likes`는 RLS 정책이 적용되어 본인 row 접근만 허용.

## 최근 반영 사항 (B회차 문서화 기준)

- `ARCHITECTURE.md`를 B회차 제출 형식으로 전면 보강.
- 페이지 맵/컴포넌트 계층/데이터 모델/RLS 초안 통합.
- CRUD + 인증 흐름 매트릭스(화면-훅-테이블 연결 표) 추가.
- `hobby_likes` 정책명과 적용 상태를 설계서에 명시.
- Copilot 지침 기준 파일을 `.github/copilot-instructions.md` 단일화.
- `posts/comments/hobbies` RLS 초안 + `hobbies` DDL 기준선 마이그레이션 추가.
- lint 잔여 오류 5건(`DailyPostBoard`, `MyProfile`, `PostDetailClient`, `QuillEditor`) 수정 완료.
- 최종 검증: `npm run lint`, `npm run build` 모두 통과.
- 홈 최신글 썸네일 정책 정리:
	- 이미지 없음: 썸네일 프레임 미표시
	- 이미지 URL 존재 + 로드 실패: fallback 표시
- 상세 페이지 헤더/댓글 영역의 레이아웃 여백 개선.
- 커뮤니티/취미 최신글 카드 UI를 디자인 토큰(`bg-surface`, `bg-surface-2`, `border-border`, `text-foreground`) 기반으로 정리.
- 코드베이스의 `alert/confirm` 호출을 toast + toast confirm 헬퍼(`confirmWithToast`)로 일원화.
- 권한 회귀 테스트 문서 `docs/permission-regression-tests.md` 추가.
- 2026-05-04 최종 린트 재실행 결과: `npm run lint` 통과(오류 0건).

## 남은 리스크

- 일부 화면은 관리자 판별을 클라이언트 분기에도 의존하고 있어 `admin role claim` 기반 정책 함수 연동을 추가 정리해야 함.
- 제출물 8개 항목 스크린샷/증빙 수집은 수동 점검이 필요함.

## 문서 기준 계약

- `ARCHITECTURE.md`: 설계 기준 단일 문서
- `context.md`: 현재 상태 + 기술 결정 로그
- `todo.md`: 제출물/단계별 체크리스트 + 진행률
- `copilot-instructions.md`: 구현 규칙/토큰/컴포넌트 가이드
