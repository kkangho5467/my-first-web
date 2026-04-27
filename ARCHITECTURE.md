# 아키텍처

## 1. 제품 목표

- 게시글 읽기, 게시글 작성, 커뮤니티 피드 탐색, 프로필 관리가 가능한 개인 블로그를 구축한다.
- UI는 차분하고 가독성이 높으며, shadcn/ui 기반으로 확장하기 쉽게 유지한다.
- Copilot이 라우트 구조나 데이터 관계를 추측하지 않고도 기능을 구현할 수 있도록 아키텍처를 명확히 문서화한다.

## 2. 비목표

- Pages Router는 도입하지 않는다.
- 별도의 CSS 프레임워크나 CSS-in-JS 레이어는 추가하지 않는다.
- 현 단계에서 다중 작성자나 엔터프라이즈 워크플로우 최적화는 다루지 않는다.
- 현재 블로그/커뮤니티 기능 범위를 넘어서 과도한 데이터 모델링을 하지 않는다.

## 3. 페이지 맵

현재 사이트는 블로그 라우트와 커뮤니티 라우트가 혼재되어 있다. 아래 기준 맵은 기존 라우트를 유지하면서, 향후 통합 시 목표로 하는 URL 구조를 함께 제시한다.

| 경로 | 상태 | 목적 | 주요 UI |
| --- | --- | --- | --- |
| / | 현재 | 홈 대시보드 및 진입점 | 히어로, 요약 카드, 최신 콘텐츠 |
| /daily | 별칭 | /posts로 리디렉션되는 호환 경로 | 레거시 링크 호환 |
| /community/write | 현재 | 커뮤니티 게시글 작성/수정(운영 경로) | 에디터 폼, 카테고리 선택, 제출 액션 |
| /posts/[id] | 현재 | 게시글 상세 페이지 | 본문, 작성자 정보, 댓글, 액션 버튼 |
| /auth | 현재 | 로그인/회원가입 진입 | 인증 폼, 상태 안내 |
| /mypage | 현재 | 프로필/계정 관리 | 프로필 카드, 아바타 편집, 설정 |
| /hobby | 현재 | 취미 콘텐츠 개요 | 콘텐츠 카드 또는 리뷰 레이아웃 |
| /goals | 현재 | 목표 및 진행 기록 | 목표 목록, 마일스톤 카드 |
| /posts | 현재 | 표준 공개 게시글 인덱스 | 목록, 필터, 페이지네이션 |
| /posts/new | 현재 | 표준 게시글 작성 라우트(community/write 재사용) | 작성 폼, 에디터, 발행 액션 |

## 4. AI 와이어프레임

아래 와이어프레임은 구현 전에 Copilot Vision 또는 v0로 우선 생성해야 하는 첫 2개 화면이다. 생성 후에는 별도 디자인 자산으로 첨부한다.

### 와이어프레임 1: 홈 대시보드

- 목표: 블로그 아이덴티티, 최신 콘텐츠, 읽기/작성으로 이어지는 가장 빠른 동선을 보여준다.
- 구성: 상단 히어로, 압축된 지표 행, 추천 게시글 카드, 작성 흐름으로 연결되는 명확한 CTA.
- 프롬프트: "Create a dark-first personal blog home screen for Next.js App Router. Use a centered hero, editorial card grid, warm accent color, and a strong primary CTA. The layout should feel spacious and premium, not generic."
- 성공 기준: 한 번의 스크롤 안에서 정보 위계가 명확하고, 작성 액션을 쉽게 찾을 수 있다.

### 와이어프레임 2: 게시글 에디터

- 목표: 작성 흐름을 단순하고 집중도 높게 만든다.
- 구성: 고정형 페이지 헤더, 카테고리 선택, 제목 입력, 리치 텍스트 에디터, 도움말 노트, 하단 액션 바.
- 프롬프트: "Create a focused blog post editor for a Next.js App Router app using shadcn/ui. The screen should feel clean, dark, and structured, with a clear form hierarchy, inline status hints, and a sticky submit bar."
- 성공 기준: 제목/본문/발행 액션이 혼동 없이 모두 드러나고, 저장 흐름을 즉시 이해할 수 있다.

## 5. 컴포넌트 계층

### 앱 셸

- RootLayout
  - 전역 메타데이터 및 폰트 설정
  - globals 내 테마 변수
- MainLayout
  - Header
    - 브랜드
    - 주요 내비게이션
    - 인증 상태 컨트롤
    - 테마 토글
  - 메인 콘텐츠 영역
  - Footer

### 페이지 레벨 구성

- 홈 페이지
  - HomeDashboardGrid
- 커뮤니티 피드
  - DailyPostBoard
  - 검색 및 필터 컨트롤
  - 페이지네이션 및 일괄 액션
- 게시글 상세
  - PostDetailClient
  - 댓글 목록
  - 댓글 폼
  - 수정/삭제 액션
- 인증 페이지
  - AuthForm
- 마이 페이지
  - MyProfile
  - 프로필 편집 컨트롤

### shadcn 초기화 이후 UI 레이어

- components/ui/button.tsx
- components/ui/card.tsx
- components/ui/input.tsx
- components/ui/textarea.tsx
- components/ui/badge.tsx
- components/ui/dialog.tsx
- components/ui/dropdown-menu.tsx
- components/ui/sheet.tsx
- components/ui/tabs.tsx
- components/ui/toast.tsx

## 6. 데이터 모델

현재 코드 기준으로 이미 3개의 핵심 테이블이 전제되어 있다. 스키마는 단순하게 유지하되, 관계 중심으로 설계한다.

확정 DDL 기준 파일:

- supabase/migrations/20260415_001_core_schema.sql

### profiles

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 기본 키, auth 사용자 id와 동일 |
| nickname | text | UI 표시 이름 |
| avatar_url | text | 프로필 이미지 URL |
| created_at | timestamptz | 생성 시각 |
| updated_at | timestamptz | 수정 시각 |

관계:

- 인증 사용자당 프로필 1개, auth.users와 1:1

### posts

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 기본 키 |
| title | text | 게시글 제목 |
| content | text | HTML 또는 리치 텍스트 본문 |
| category | text | 피드 카테고리, 기본값 자유수다 |
| author_name | text | 캐시된 표시 이름 |
| author_id | uuid | 프로필 또는 auth 사용자 참조 |
| thumbnail_url | text | 선택적 대표 이미지 |
| views | integer | 선택적 조회수 카운터 |
| likes | integer | 선택적 반응 카운터 |
| created_at | timestamptz | 생성 시각 |
| updated_at | timestamptz | 수정 시각 |

관계:

- author_id를 통해 하나의 프로필에 여러 게시글이 연결됨 (1:N)
- posts.author_id는 profiles.id를 참조하고, 작성 시 auth 사용자 id와 일관되게 저장해야 함

### comments

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 기본 키 |
| post_id | uuid | 상위 게시글 참조 |
| content | text | 댓글 본문 |
| author_name | text | 캐시된 표시 이름 |
| author_id | uuid | 댓글 작성자 참조 |
| created_at | timestamptz | 생성 시각 |
| updated_at | timestamptz | 수정 시각 |

관계:

- post_id를 통해 하나의 게시글에 여러 댓글이 연결됨 (1:N)
- author_id를 통해 하나의 프로필에 여러 댓글이 연결됨 (1:N)

## 7. 통합 메모

- Supabase 접근 코드는 표시 전용 컴포넌트가 아니라 helper 모듈과 훅에 유지한다.
- /mypage, /community/write, 그리고 향후 /posts/new 라우트의 접근 보호 규칙을 명시적으로 유지한다.
- 표준 /posts 라우트를 도입하기 전까지 현재 커뮤니티 라우트는 유지한다.
- 에디터 흐름은 브라우저 API 의존성이 있으므로 클라이언트 사이드 리치 텍스트 편집 방식을 유지한다.
- 선택 카운터 컬럼 정책은 views, likes 유지(기본값 0, 음수 금지)로 확정한다.

## 8. 라우트/보호 정책

- 표준 목록 경로는 /posts로 고정한다.
- /daily는 레거시 링크 호환용 alias로 유지하며 /posts로 즉시 리디렉션한다.
- 표준 작성 경로는 /posts/new로 고정하고, 현재 운영 구현은 /community/write 컴포넌트를 재사용한다.
- 인증 보호 대상 경로는 /mypage, /posts/new, /community/write 이며 비로그인 사용자는 /auth?notice=login-required로 이동시킨다.
