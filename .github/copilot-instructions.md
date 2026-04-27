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

## AI가 자주 하는 실수 (반드시 금지)

- AI 실수를 새로 발견하면 해당 패턴을 이 섹션에 즉시 추가하고, 이후 세션부터 동일 규칙을 자동 적용한다.
- next/router를 사용하지 말고, 항상 next/navigation을 사용한다.
- Pages Router를 사용하지 않는다 (pages/ 디렉터리 사용 금지).
- App Router에서는 params를 사용하기 전에 반드시 await 해야 한다.
- shadcn/ui를 쓰는 화면에서 즉석으로 색상 클래스를 남발하지 말고 디자인 토큰을 우선한다.
  