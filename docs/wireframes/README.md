# 와이어프레임 산출물 노트

## 목적

- 2단계 정보 구조 작업에서 요구하는 AI 와이어프레임 2장을 생성하고, 경로와 프롬프트를 고정한다.

## 생성 대상

- [x] 홈 대시보드 와이어프레임 1장 (문서 초안)
- [x] 게시글 에디터 와이어프레임 1장 (문서 초안)

## 생성 결과

- 홈 대시보드: home-dashboard-v1.md
- 게시글 에디터: post-editor-v1.md
- 홈 대시보드 이미지: home-dashboard-v1.svg
- 게시글 에디터 이미지: post-editor-v1.svg

## Copilot Vision 프롬프트

### 홈 대시보드

```text
Next.js App Router 기반 개인 블로그 홈 와이어프레임을 만들어줘.
조건:
- 다크 우선 톤
- 중앙 히어로
- 카드 그리드 중심 편집형 레이아웃
- 주요 CTA 1개를 가장 눈에 띄게
- 모바일/데스크톱 모두 구조가 자연스럽게 보이도록
```

### 게시글 에디터

```text
Next.js App Router + shadcn/ui 기반 게시글 작성 화면 와이어프레임을 만들어줘.
조건:
- 상단 고정 헤더
- 카테고리, 제목, 본문 에디터가 위계적으로 배치
- 하단 액션 바(취소/저장/등록)
- 상태 안내 영역(로딩/오류/도움말) 포함
```

## v0 프롬프트

### 홈 대시보드

```text
Create a dark-first personal blog home wireframe for Next.js App Router.
Use a centered hero, editorial card grid, and one prominent primary CTA.
Keep the layout clean, spacious, and responsive.
```

### 게시글 에디터

```text
Create a focused post editor wireframe for a Next.js App Router app using shadcn/ui.
Include sticky header, category selector, title input, rich text area, helper notes, and bottom action bar.
```

## 첨부 경로(권장)

- docs/wireframes/home-dashboard-v1.png
- docs/wireframes/post-editor-v1.png
- docs/wireframes/home-dashboard-v1.svg
- docs/wireframes/post-editor-v1.svg

## 상태

- 현재 상태: 문서형 와이어프레임 2장 + SVG 이미지 자산 2장 생성 완료
