# Copilot 지침

## 기술 스택
- 프레임워크: Next.js 16.2.1
- 스타일링: Tailwind CSS ^4
- 라우팅: App Router ONLY (`app/` 디렉터리만 사용)

## 코딩 컨벤션
- 기본은 Server Components로 작성한다.
- 스타일링은 Tailwind CSS만 사용한다.
- 명시적으로 요청되지 않았다면 다른 CSS 프레임워크나 CSS-in-JS 라이브러리를 도입하지 않는다.

## AI가 자주 하는 실수 (반드시 금지)
- AI 실수를 새로 발견하면 해당 패턴을 이 섹션에 즉시 추가하고, 이후 세션부터 동일 규칙을 자동 적용한다.
- `next/router`를 사용하지 말고, 항상 `next/navigation`을 사용한다.
- Pages Router를 사용하지 않는다 (`pages/` 디렉터리 사용 금지).
- App Router에서는 `params`를 사용하기 전에 반드시 `await` 해야 한다.
  