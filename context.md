# 프로젝트 컨텍스트

## 초기 상태 스냅샷

- 워크스페이스: c:\my-first-web
- 기준 일자: 2026-04-15
- 프레임워크: Next.js 16.2.1
- React: 19.2.4
- 스타일링: Tailwind CSS v4
- 라우팅: App Router 전용
- 데이터 레이어: Supabase 클라이언트 헬퍼 및 훅
- 현재 앱 셸: 공통 헤더, 콘텐츠 컨테이너, 푸터를 포함한 커스텀 MainLayout

## 현재 라우트 상태

- / 는 메인 랜딩 페이지
- /posts 는 표준 커뮤니티 피드 경로
- /daily 는 /posts로 리디렉션되는 alias 경로
- /posts/new 는 표준 작성 경로(내부적으로 /community/write 구현 재사용)
- /community/write 는 작성/수정 운영 화면
- /posts/[id] 는 게시글 상세 화면
- /auth 는 인증 진입 화면
- /mypage 는 프로필 관리 화면
- /hobby 와 /goals 는 편집형 보조 페이지

## 기술 결정 사항

- 기본 렌더링 모델은 Server Component.
- Client Component는 브라우저 API, 에디터 상호작용, 인증 상태 처리에 한정.
- App Router의 params는 사용 전에 await 필요.
- 내비게이션 API는 next/navigation만 허용.
- 스타일링 시스템은 Tailwind 단일 체계 유지.
- shadcn/ui 초기화 후 기본 컴포넌트 레이어로 사용.
- 테마 단일화를 위해 디자인 토큰은 CSS 변수로 관리.
- 데이터 접근은 lib 헬퍼 또는 기능 훅으로 분리.

## 현재 제품 방향

- 제품 성격은 커뮤니티형 작성 흐름을 포함한 개인 블로그.
- 콘텐츠는 읽기, 작성, 프로필 편집, 경량 상호작용을 지원해야 함.
- 시각 방향은 다크 우선, 높은 가독성, 따뜻한 primary 강조, 명확한 간격 체계를 유지.

## 구현 관련 메모

- Next.js 16 + React 19 조합에서 react-quill@2는 peer 충돌과 findDOMNode 리스크가 있어 의존성에서 제거했다.
- 커뮤니티 에디터는 react-quill 대신 클라이언트 quill 초기화 경로를 유지한다.
- 현재 코드는 Supabase 테이블 헬퍼를 통해 posts, profiles, comments를 이미 사용 중.
- 라우트 네이밍은 /daily 와 /community/write 로 분리되어 있으므로 /posts, /posts/new 통합은 기능 변경이 아닌 점진적 정리 과제로 취급.
- shadcn init 설치 단계에서 발생한 react-quill peer 충돌은 react-quill 제거로 해소했다.
- shadcn 기반 컴포넌트 사용을 위해 lib/utils.ts의 cn 유틸을 추가.
- 2단계에서 /posts, /posts/new 표준 경로를 실제 라우트로 추가했고 /daily는 alias 리디렉션으로 유지.
- 3단계에서 Supabase 마이그레이션 SQL(supabase/migrations/20260415_001_core_schema.sql)로 profiles/posts/comments 스키마를 확정.
- 외래 키는 comments.post_id -> posts.id, posts.author_id/comments.author_id -> profiles.id 로 고정.
- 선택 카운터 컬럼은 posts.views, posts.likes를 유지하고 기본값 0 + 음수 금지 제약으로 확정.
- 4단계 시작으로 AuthForm, DailyPostBoard 일부를 shadcn Input/Button/Card로 치환.
- Supabase 스키마 실행 절차 문서를 docs/supabase-schema-apply.md에 추가.
- CommunityWritePage, PostDetailClient까지 shadcn 컴포넌트 적용을 확장해 UI 시스템 4단계를 마감.
- 표준 라우트(/posts, /posts/new) 기준으로 화면 이동 경로를 정리하고 /daily 의존도를 축소.
- 6단계 검증 시작: `npm run lint` 기준 에러 0건, 경고 4건 남음(이미지 최적화/unused warning 등).
- 6단계 검증 추가: 로컬 브라우저/페치 확인으로 /, /posts, /posts/new 렌더링 및 보호 라우트 인증 유도 동작 확인.
- 6단계 검증 마감: DailyPostBoard/HomeDashboardGrid의 img 경고와 unused catch 변수를 정리해 lint 경고도 0건으로 완료.
- 5단계 검증 시작: 홈, 목록, 상세, 인증/프로필, 편집 진입 화면을 로컬 브라우저 기준으로 확인했고, 상세 페이지의 댓글/좋아요/본문 렌더링과 보호 편집 진입이 정상 동작함.

## 문서 기준 계약

- copilot-instructions.md: 코딩/컴포넌트 규칙의 단일 기준 문서
- ARCHITECTURE.md: 라우트 맵, 계층, 스키마 방향의 단일 기준 문서
- todo.md: 단계별 진행률을 포함한 실행 체크리스트
