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

### 2026-03-31
- 사용자 명령 요약:
	- 블로그 메인 화면에 표시할 Mock Data 배열 5개 생성 요청
	- 객체 구조: id, title, date, excerpt
- 결과:
	- 목데이터 타입 `MockPost` 추가
	- 메인 화면에서 바로 사용할 수 있는 `mockPosts` 배열 5개 추가
	- 각 항목에 고유 ID, 제목, 작성일, 짧은 요약 반영
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- content/blog-content.ts

### 2026-03-31
- 사용자 명령 요약:
	- Mock Data를 활용해 메인 화면에 아주 심플한 텍스트 글 목록 렌더링 요청
	- 제목 클릭 시 상세 페이지 이동 링크 연결 요청
	- 상세 페이지 뼈대 컴포넌트(큰 제목/날짜 + 본문 영역) 생성 요청
- 결과:
	- 메인 화면을 `작성일 + 글 제목` 텍스트 리스트로 변경
	- 각 제목에 `/posts/[id]` 상세 링크 연결
	- 상세 페이지 뼈대 컴포넌트 `PostDetailSkeleton` 추가
	- 동적 상세 페이지 `app/posts/[id]/page.tsx` 추가 및 데이터 조회/404 처리 반영
	- `getMockPostById` 유틸 함수 추가
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/page.tsx
	- app/components/PostDetailSkeleton.tsx
	- app/posts/[id]/page.tsx
	- content/blog-content.ts

### 2026-03-31
- 사용자 명령 요약:
	- 상단 네비게이션에서 글 목록 메뉴가 사라진 현상 확인 요청
- 결과:
	- 원인 확인: 네비게이션 메뉴 배열에서 /daily 항목 label이 빈 문자열로 설정되어 있었음
	- 수정 완료: /daily 항목 label을 글 목록으로 복구
	- 화면에서 상단 메뉴에 글 목록이 다시 표시되도록 반영
- 변경 파일:
	- app/components/MainLayout.tsx

### 2026-03-31
- 사용자 명령 요약:
	- 메인 페이지에 글들이 글 목록에 들어가도록 개선 요청
- 결과:
	- 메인 페이지는 이미 `mockPosts` 기반 글 목록(작성일 + 제목 링크)으로 렌더링되고 있음을 확인
	- 사용 동선 일관성을 위해 글 목록 탭(`/daily`)도 동일한 `mockPosts` 텍스트 리스트로 변경
	- 글 제목 클릭 시 상세 페이지(`/posts/[id]`)로 이동하도록 동일하게 연결
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/daily/page.tsx

### 2026-03-31
- 사용자 명령 요약:
	- 메인 페이지 최상단에 이미지 없는 자기소개 Hero 영역 추가 요청
	- 큰 제목(h1) + 옅은 회색 소개 문단(p) + 넉넉한 상하 여백 적용 요청
- 결과:
	- 메인 페이지 상단에 Hero 섹션 추가(좌측 정렬)
	- 큰 제목: 안녕하세요, 김강호입니다.
	- 소개 문단: 작성자 소개와 글 주제 설명 2문장 반영
	- 상하 여백 확대: `py-20 md:py-28` 적용
	- 기존 글 목록은 Hero 아래 섹션으로 분리 유지
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/page.tsx

### 2026-03-31
- 사용자 명령 요약:
	- 자기소개 아래에 최근 글 목록 컴포넌트 작성 요청
	- 카드/테두리/그림자/썸네일 없이, 한 줄에 작성일(좌) + 제목(우) 형태 요청
	- 제목 hover 시에만 밑줄 표시 요청
- 결과:
	- `RecentPostList` 컴포넌트 추가
	- 리스트를 `ul > li` 구조로 구성하고 각 항목을 `flex justify-between`으로 좌우 배치
	- 작성일은 옅은 회색, 제목은 검은색 스타일 적용
	- 제목 링크에 hover 시 밑줄만 표시되도록 반영
	- 메인 페이지에서 기존 목록 마크업을 `RecentPostList`로 교체
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/RecentPostList.tsx
	- app/page.tsx

### 2026-03-31
- 사용자 명령 요약:
	- 페이지 하단 푸터를 텍스트 중심으로 단순하게 구성 요청
	- GitHub, Email, Instagram 링크를 작고 옅은 색으로 중앙 정렬 배치 요청
- 결과:
	- MainLayout 푸터를 미니멀 텍스트 링크 3개 구조로 교체
	- `text-xs`, `text-slate-400`, `justify-center` 기반의 작은 중앙 정렬 스타일 적용
	- 불필요한 복잡 정보/아이콘 없이 텍스트만 표시되도록 반영
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/MainLayout.tsx

### 2026-03-31
- 사용자 명령 요약:
	- 푸터 링크 앞에 각각 알맞은 이미지 추가 요청
	- 링크 순서를 GitHub, Instagram, Email 순으로 변경 요청
- 결과:
	- 푸터 링크 순서 변경 완료: GitHub -> Instagram -> Email
	- 각 링크 앞에 아이콘 이미지 배치
	- 아이콘 파일 3개 추가: github.svg, instagram.svg, email.svg
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/MainLayout.tsx
	- public/github.svg
	- public/instagram.svg
	- public/email.svg

### 2026-03-31
- 사용자 명령 요약:
	- 푸터 링크 URL 변경 요청
	- 인스타그램: https://www.instagram.com/04_kangho/
	- 깃허브: https://github.com/kkangho5467
	- 이메일 링크는 기존 값 유지 요청
- 결과:
	- GitHub 링크를 사용자 계정 URL로 변경
	- Instagram 링크를 사용자 계정 URL로 변경
	- Email 링크는 `mailto:your-email@example.com` 그대로 유지
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/MainLayout.tsx
