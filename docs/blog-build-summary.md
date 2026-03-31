# 블로그 작업 기록

작성일: 2026-03-31

## 기록 운영 규칙
- 블로그 관련 명령 이후 결과를 이 파일에 계속 누적 기록한다.
- 각 기록은 날짜, 사용자 명령 요약, 반영 결과, 변경 파일을 함께 남긴다.
- 이 문서는 최근 작업부터 확인하기 쉽도록 섹션 단위로 이어서 추가한다.

## 이번 요약 범위
- 시작 기준 명령: Next.js와 Tailwind CSS를 사용하여 블로그의 메인 레이아웃 컴포넌트를 만들어줘. 상단에는 네비게이션 바(로고, 메뉴), 중앙에는 콘텐츠 영역, 하단에는 푸터가 들어가야 해.
- 종료 기준: 현재 명령 직전까지의 결과

## 사용자 명령 및 결과 요약

### 1) 메인 레이아웃 컴포넌트 생성 요청
- 사용자 명령 요약:
	- Next.js + Tailwind 기반 블로그 메인 레이아웃 생성
	- 구성: 상단 네비게이션(로고, 메뉴) / 중앙 콘텐츠 / 하단 푸터
- 결과:
	- 메인 레이아웃 컴포넌트 추가
		- app/components/MainLayout.tsx
	- 홈 페이지가 새 레이아웃을 사용하도록 변경
		- app/page.tsx
	- 타입/문법 오류 없음 확인

### 2) PostCard 컴포넌트 생성 요청
- 사용자 명령 요약:
	- 글 목록 카드 컴포넌트 작성
	- Props: title, date, excerpt, imageUrl
- 결과:
	- 카드 컴포넌트 추가
		- app/components/PostCard.tsx
	- next/image 기반 썸네일, 제목/날짜/요약 렌더링 반영
	- 타입/문법 오류 없음 확인

### 3) 기존 탭(글 목록/취미/목표) 템플릿 통일 요청
- 사용자 명령 요약:
	- 예전 BlogShell 기반 탭을 현재 메인페이지 템플릿에 맞게 변경
- 결과:
	- 아래 페이지들이 BlogShell에서 MainLayout 기반으로 전환됨
		- app/daily/page.tsx
		- app/hobby/page.tsx
		- app/goals/page.tsx
	- 카드/헤더 스타일을 현재 메인페이지 톤에 맞게 통일
	- 타입/문법 오류 없음 확인

### 4) Markdown 렌더링 + 코드 하이라이팅 컴포넌트 요청
- 사용자 명령 요약:
	- Markdown 텍스트를 HTML로 렌더링하는 컴포넌트 생성
	- react-markdown 사용
	- 코드 블록 구문 강조 적용
- 결과:
	- 의존성 설치
		- react-markdown
		- remark-gfm
		- react-syntax-highlighter
		- @types/react-syntax-highlighter (dev)
	- Markdown 렌더러 컴포넌트 추가
		- app/components/MarkdownRenderer.tsx
	- fenced code block 언어 감지 후 Syntax Highlighting 적용
	- 인라인 코드/헤딩/문단/목록/링크 스타일 커스터마이징 반영
	- 타입/문법 오류 없음 확인

## 현재 변경 파일 상태 요약
- 수정됨
	- app/page.tsx
	- app/daily/page.tsx
	- app/hobby/page.tsx
	- app/goals/page.tsx
	- package.json
	- package-lock.json
- 신규 파일
	- app/components/MainLayout.tsx
	- app/components/PostCard.tsx
	- app/components/MarkdownRenderer.tsx

## 다음 기록 템플릿
아래 형식으로 이어서 누적 기록:

### YYYY-MM-DD HH:mm
- 사용자 명령 요약:
	- (요청 핵심 1~2줄)
- 결과:
	- (무엇을 만들거나 수정했는지)
	- (검증 결과: 오류 여부)
- 변경 파일:
	- (파일 경로 목록)

### 2026-03-31
- 사용자 명령 요약:
	- 전체 게시물 배열과 현재 페이지 번호를 받아, 페이지당 6개만 반환하는 페이지네이션 유틸 함수 작성 요청
- 결과:
	- 페이지네이션 유틸 함수 추가
	- 현재 페이지 값이 잘못된 경우(0, 음수, 소수, 비수치)도 안전하게 보정하도록 처리
	- 페이지당 게시물 수 상수(6)도 함께 export
- 변경 파일:
	- lib/paginatePosts.ts

### 2026-03-31
- 사용자 명령 요약:
	- 게시물 제목/내용 기반 검색창 로직 구현 요청
	- 타이핑 시 디바운스 처리로 검색 성능 최적화 요청
- 결과:
	- 제목/내용 검색 순수 유틸 함수 추가
	- 디바운스 검색 훅 추가(기본 300ms)
	- 검색창 예시 컴포넌트 추가(디바운싱 상태 및 결과 개수 표시)
	- 콜백은 useEffect에서 실행하도록 처리해 렌더링 부작용 방지
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- lib/searchPosts.ts
	- app/hooks/useDebouncedPostSearch.ts
	- app/components/PostSearchBox.tsx

### 2026-03-31
- 사용자 명령 요약:
	- CSS Grid 레이아웃을 모바일 1열, 태블릿 2열, 데스크탑 3열로 반응형 수정 요청
- 결과:
	- 홈 및 취미 페이지의 grid 클래스를 `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`로 통일
	- 반응형 기준이 모바일/태블릿/데스크탑으로 명확하게 적용됨
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/page.tsx
	- app/hobby/page.tsx
