# Copilot 지침

## 기술 스택

- 프레임워크: Next.js 16.2.1
- React: 19.2.4
- 스타일링: Tailwind CSS v4
- 라우팅: App Router ONLY (`app/` 디렉터리만 사용)
- UI 시스템: shadcn/ui 우선
- 데이터: Supabase helpers와 feature hooks 분리

## 코딩 컨벤션

- 기본은 Server Components로 작성한다.
- 상태, 효과, 브라우저 API가 필요한 경우에만 Client Components를 사용한다.
- 스타일링은 Tailwind CSS만 사용한다.
- 명시적으로 요청되지 않았다면 다른 CSS 프레임워크나 CSS-in-JS 라이브러리를 도입하지 않는다.
- 반복되는 UI는 shadcn/ui 컴포넌트로 먼저 풀고, 부족한 부분만 feature wrapper를 만든다.
- className이 길어지면 cn 헬퍼 기반으로 정리한다.

## Design Tokens

- background: #0f1217
- surface: #151b23
- surface-2: #1b2230
- primary: #c29a73
- primary-foreground: #18110b
- text: #f4efe8
- muted: #9aa3ad
- border: #2a3340
- accent: #6da7ff
- danger: #ef6b6b

## Component Rules

- Button, Card, Input, Textarea, Badge, Tabs, Dialog, Sheet, DropdownMenu, Toast를 우선 사용한다.
- 폼은 Label + Input/Textarea + helper text 패턴을 유지한다.
- 로딩/빈 상태/오류 상태는 페이지마다 숨기지 말고 별도 표현을 만든다.
- 공통 레이아웃은 MainLayout이 책임지고, 페이지는 콘텐츠만 책임지게 만든다.
- 데이터 접근은 lib 또는 hooks에 분리하고, 표시 컴포넌트 안에서 직접 쿼리하지 않는다.

## Theme and Dark Mode Rules

- 라이트 모드 기본 색상은 유지하고, 다크모드 변경은 반드시 dark: 변형으로만 적용한다.
- 라이트/다크 동시 대응이 필요한 경우, 기본 클래스는 라이트 기준으로 작성하고 dark: 클래스에서만 덮어쓴다.
- 다크모드 대응 시 개별 컴포넌트에서 임의 HEX 색상 남발을 피하고, 토큰 또는 기존 톤 계열을 우선 사용한다.
- 다크모드 수정 시 라이트 모드가 의도치 않게 어두워지지 않았는지 반드시 확인한다.

## Thumbnail Rules

- 이미지 URL이 없는 게시글은 썸네일 프레임 자체를 렌더링하지 않는다.
- 이미지 URL이 유효하지만 로딩 실패한 경우에만 fallback UI(아이콘/대체 박스)를 표시한다.
- 목록형 카드의 썸네일은 레이아웃 점프를 줄이되, 텍스트 가독성을 우선한다.

## Supabase and RLS Rules

- select 컬럼은 실제 스키마에 존재하는 컬럼만 사용한다.
- 스키마 변경 없이 화면 코드를 먼저 수정하지 않는다. 필요 시 마이그레이션부터 추가한다.
- 게시글/댓글/좋아요 권한은 클라이언트 조건문만으로 신뢰하지 않고 RLS 정책으로 최종 보장한다.
- RPC 사용 시 입력 검증, 권한 경계, 실패 시 UI 복구 흐름을 함께 설계한다.

## Docs Source of Truth

- ARCHITECTURE.md: 라우트, 컴포넌트 계층, 데이터 모델, RLS 설계의 단일 기준 문서
- context.md: 현재 상태와 기술 결정 로그
- todo.md: 단계별 체크리스트와 진행률
- 문서와 코드가 다르면 문서를 먼저 갱신하고, 이후 코드를 문서 기준으로 맞춘다.

## AI가 자주 하는 실수 (반드시 금지)

- AI 실수를 새로 발견하면 해당 패턴을 이 섹션에 즉시 추가하고, 이후 세션부터 동일 규칙을 자동 적용한다.
- next/router를 사용하지 말고, 항상 next/navigation을 사용한다.
- Pages Router를 사용하지 않는다 (pages/ 디렉터리 사용 금지).
- App Router에서는 params를 사용하기 전에 반드시 await 해야 한다.
- shadcn/ui를 쓰는 화면에서 즉석으로 색상 클래스를 남발하지 말고 디자인 토큰을 우선한다.
- 다크모드 대응 작업에서 라이트 모드 기본 클래스 자체를 어둡게 바꾸지 않는다.
- 이미지가 없는 글에 썸네일 박스/아이콘을 강제로 노출하지 않는다.
