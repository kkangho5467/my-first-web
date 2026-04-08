# 블로그 작업 기록

작성일: 2026-03-31
## 기록 운영 규칙
- 각 기록은 날짜, 사용자 명령 요약, 반영 결과, 변경 파일을 함께 남긴다.
- 이 문서는 작성된 순서(오래된 작업 -> 최신 작업)로 섹션 단위로 이어서 추가한다.
- 새 기록은 항상 `## 사용자 명령 및 결과 요약`의 마지막에 추가한다.
- 같은 날짜 기록은 기존 같은 날짜 섹션 아래에 이어붙이고, 더 과거 날짜를 중간에 삽입하지 않는다.
- 날짜/순서 정렬이 필요할 때는 `YYYY-MM-DD` 기준 오름차순(작성 순)만 사용한다.

## 이번 요약 범위
- 시작 기준 명령: Next.js와 Tailwind CSS를 사용하여 블로그의 메인 레이아웃 컴포넌트를 만들어줘. 상단에는 네비게이션 바(로고, 메뉴), 중앙에는 콘텐츠 영역, 하단에는 푸터가 들어가야 해.
- 종료 기준: 현재 명령 직전까지의 결과
## 사용자 명령 및 결과 요약
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
	- 전체 게시물 배열과 현재 페이지 번호를 받아, 페이지당 6개만 반환하는 페이지네이션 유틸 함수 작성 요청
- 결과:
	- 페이지네이션 유틸 함수 추가
	- 현재 페이지 값이 잘못된 경우(0, 음수, 소수, 비수치)도 안전하게 보정하도록 처리
	- 페이지당 게시물 수 상수(6)도 함께 export
- 변경 파일:
	- lib/paginatePosts.ts

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
	- CSS Grid 레이아웃을 모바일 1열, 태블릿 2열, 데스크탑 3열로 반응형 수정 요청
- 결과:
	- 홈 및 취미 페이지의 grid 클래스를 `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`로 통일
	- 반응형 기준이 모바일/태블릿/데스크탑으로 명확하게 적용됨
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/hobby/page.tsx
### 2026-03-31
- 사용자 명령 요약:
	- PostCard 컴포넌트 생성 요청
	- 글 목록 카드 컴포넌트 작성
	- Props: title, date, excerpt, imageUrl
	- 카드 컴포넌트 추가
		- app/components/PostCard.tsx
	- next/image 기반 썸네일, 제목/날짜/요약 렌더링 반영

### 2026-03-31
	- 메인 레이아웃 컴포넌트 생성 요청
	- Next.js + Tailwind 기반 블로그 메인 레이아웃 생성
	- 구성: 상단 네비게이션(로고, 메뉴) / 중앙 콘텐츠 / 하단 푸터
- 결과:
	- 메인 레이아웃 컴포넌트 추가
		- app/components/MainLayout.tsx
		- app/page.tsx
	- 타입/문법 오류 없음 확인

### 2026-03-31
	- Markdown 렌더링 + 코드 하이라이팅 컴포넌트 요청
	- react-markdown 사용
	- 코드 블록 구문 강조 적용
- 결과:
	- 의존성 설치
		- react-markdown
		- react-syntax-highlighter
		- @types/react-syntax-highlighter (dev)
	- Markdown 렌더러 컴포넌트 추가
	- fenced code block 언어 감지 후 Syntax Highlighting 적용
	- 타입/문법 오류 없음 확인

## 현재 변경 파일 상태 요약
- 수정됨
	- app/daily/page.tsx
	- app/hobby/page.tsx
	- app/goals/page.tsx
	- package-lock.json
	- app/components/MainLayout.tsx
	- app/components/PostCard.tsx
	- app/components/MarkdownRenderer.tsx

## 다음 기록 템플릿

### 2026-03-31
- 사용자 명령 요약:
	- 기존 탭(글 목록/취미/목표) 템플릿 통일 요청
- 결과:
	- 아래 페이지들이 BlogShell에서 MainLayout 기반으로 전환됨
		- app/hobby/page.tsx
		- app/goals/page.tsx
	- 카드/헤더 스타일을 현재 메인페이지 톤에 맞게 통일
	- 타입/문법 오류 없음 확인

### 2026-03-31
	- Mock Data를 활용해 메인 화면에 아주 심플한 텍스트 글 목록 렌더링 요청
	- 제목 클릭 시 상세 페이지 이동 링크 연결 요청
	- 상세 페이지 뼈대 컴포넌트(큰 제목/날짜 + 본문 영역) 생성 요청
	- 메인 화면을 `작성일 + 글 제목` 텍스트 리스트로 변경
	- 상세 페이지 뼈대 컴포넌트 `PostDetailSkeleton` 추가
	- 동적 상세 페이지 `app/posts/[id]/page.tsx` 추가 및 데이터 조회/404 처리 반영
	- `getMockPostById` 유틸 함수 추가
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/page.tsx
	- app/posts/[id]/page.tsx
	- content/blog-content.ts

### 2026-03-31
- 사용자 명령 요약:
	- 페이지 하단 푸터를 텍스트 중심으로 단순하게 구성 요청
	- GitHub, Email, Instagram 링크를 작고 옅은 색으로 중앙 정렬 배치 요청
	- MainLayout 푸터를 미니멀 텍스트 링크 3개 구조로 교체
	- 불필요한 복잡 정보/아이콘 없이 텍스트만 표시되도록 반영
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/MainLayout.tsx
### 2026-03-31
- 사용자 명령 요약:
	- 푸터 링크 앞에 각각 알맞은 이미지 추가 요청
- 결과:
	- 각 링크 앞에 아이콘 이미지 배치
	- 아이콘 파일 3개 추가: github.svg, instagram.svg, email.svg
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/MainLayout.tsx
	- public/instagram.svg
	- public/email.svg

### 2026-03-31
- 사용자 명령 요약:
	- 인스타그램: https://www.instagram.com/04_kangho/
	- 이메일 링크는 기존 값 유지 요청
- 결과:
	- GitHub 링크를 사용자 계정 URL로 변경
	- Instagram 링크를 사용자 계정 URL로 변경
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/MainLayout.tsx
- 사용자 명령 요약:
	- 자기소개 아래에 최근 글 목록 컴포넌트 작성 요청
	- 제목 hover 시에만 밑줄 표시 요청
- 결과:
	- `RecentPostList` 컴포넌트 추가
	- 리스트를 `ul > li` 구조로 구성하고 각 항목을 `flex justify-between`으로 좌우 배치
	- 작성일은 옅은 회색, 제목은 검은색 스타일 적용
	- 제목 링크에 hover 시 밑줄만 표시되도록 반영
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/RecentPostList.tsx
	- app/page.tsx

### 2026-03-31
	- 상단 네비게이션에서 글 목록 메뉴가 사라진 현상 확인 요청
	- 원인 확인: 네비게이션 메뉴 배열에서 /daily 항목 label이 빈 문자열로 설정되어 있었음
	- 수정 완료: /daily 항목 label을 글 목록으로 복구
	- 화면에서 상단 메뉴에 글 목록이 다시 표시되도록 반영
- 변경 파일:
	- app/components/MainLayout.tsx

- 사용자 명령 요약:
	- 메인 페이지에 글들이 글 목록에 들어가도록 개선 요청
- 결과:
	- 메인 페이지는 이미 `mockPosts` 기반 글 목록(작성일 + 제목 링크)으로 렌더링되고 있음을 확인
	- 사용 동선 일관성을 위해 글 목록 탭(`/daily`)도 동일한 `mockPosts` 텍스트 리스트로 변경
	- 글 제목 클릭 시 상세 페이지(`/posts/[id]`)로 이동하도록 동일하게 연결
	- 타입/문법 오류 없음 확인
	- app/daily/page.tsx
### 2026-03-31
- 사용자 명령 요약:
	- 메인 페이지 최상단에 이미지 없는 자기소개 Hero 영역 추가 요청
	- 큰 제목(h1) + 옅은 회색 소개 문단(p) + 넉넉한 상하 여백 적용 요청
- 결과:
	- 큰 제목: 안녕하세요, 김강호입니다.
	- 소개 문단: 작성자 소개와 글 주제 설명 2문장 반영
	- 상하 여백 확대: `py-20 md:py-28` 적용
	- 기존 글 목록은 Hero 아래 섹션으로 분리 유지
- 변경 파일:

### 2026-04-01
- 사용자 명령 요약:
	- 댓글 기능에 이어 작성된 글 자체를 상세 페이지에서 수정하는 기능 추가 요청
	- 게시글 상세에 `게시글 수정` 섹션 추가
	- 사용자 작성 글(`user-*`)에서만 제목/내용 수정 UI 노출
	- `수정 시작`, `저장`, `취소` 동작 추가
	- 저장 시 상세 화면 즉시 반영 + `community-posts` localStorage 동기화
- 변경 파일:

### 2026-04-01
- 사용자 명령 요약:
	- 푸터 Email 아이콘/텍스트에 hover 또는 클릭 시 작은 정보창(tooltip/popover) 표시 요청
- 결과:
	- `FooterEmailLink` 클라이언트 컴포넌트 추가
	- hover 시 툴팁 표시, 클릭 시 첫 클릭은 툴팁 표시/두 번째 클릭은 기존 mailto 동작 유지
	- Esc 키 닫기, 바깥 영역 클릭 닫기 처리
	- MainLayout Email 항목을 새 컴포넌트로 교체
- 변경 파일:
	- app/components/FooterEmailLink.tsx
	- app/components/MainLayout.tsx

- 사용자 명령 요약:
	- Email 클릭 시 `mailto` 이동을 제거하고 정보창만 뜨도록 변경 요청
- 결과:
	- Email 요소를 링크에서 버튼으로 변경하여 메일 앱 이동 동작 제거
	- hover 시 열림 + 클릭 시 고정 토글(열기/닫기) 동작 적용
	- Esc 및 바깥 클릭 시 닫기 동작 유지
	- 툴팁 문구를 mailto 안내에서 정보창 안내로 변경
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/FooterEmailLink.tsx

### 2026-04-01
- 사용자 명령 요약:
	- 정보창의 이메일 주소 오른쪽에 복사 버튼 추가 요청
- 결과:
	- 학교/개인 이메일 각 줄 오른쪽에 `복사` 버튼 추가
	- 클릭 시 클립보드 복사, 성공 시 잠시 `복사됨` 상태 표시
	- 툴팁 너비 및 줄 레이아웃을 버튼 포함 형태로 조정
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/FooterEmailLink.tsx

### 2026-04-01
- 사용자 명령 요약:
	- 메인 페이지 시간 표기를 실시간으로 변경 요청
- 결과:
	- `KoreaLiveClock` 클라이언트 컴포넌트 추가
	- 1초 간격(`setInterval`)으로 대한민국(Asia/Seoul) 시간 갱신 처리
	- 초기 렌더는 서버 시간 값을 받아 하이드레이션 안정성 유지
	- 메인 페이지의 기존 정적 시간 문구를 실시간 컴포넌트로 교체
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/KoreaLiveClock.tsx
	- app/page.tsx

### 2026-04-01
- 사용자 명령 요약:
	- 게시글 상세 페이지에서 댓글 작성/수정/삭제 및 저장 기능 추가 요청
	- 작은 "<-" 화살표가 포함된 `커뮤니티로 돌아가기` 버튼 추가 요청
- 결과:
	- 상세 페이지에 댓글 입력 폼 추가(댓글 등록)
	- 등록된 댓글을 게시글 단위로 `localStorage`에 저장하여 재접속 시 유지
	- 댓글별 `수정/저장/취소/삭제` 기능 추가
	- 댓글 작성/수정 시각 표시(대한민국 시간 기준)
	- 상세 상단에 작은 `<- 커뮤니티로 돌아가기` 버튼 추가(글 없음 상태 포함)
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/PostDetailClient.tsx

### 2026-04-01
- 사용자 명령 요약:
	- 앱 전반의 "글 목록" 명칭을 "커뮤니티"로 변경 요청
- 결과:
	- 상단 네비게이션의 "글 목록" 메뉴를 "커뮤니티"로 변경
	- `/daily` 페이지 제목을 "커뮤니티"로 변경
	- 메인 최근 섹션의 aria-label 및 제목을 "최근 커뮤니티"로 변경
	- 상세 페이지 복귀 링크 문구를 "커뮤니티로 돌아가기"로 변경
	- 커뮤니티 보드 목록 제목을 "커뮤니티"로 변경
	- 앱 디렉터리 재검색으로 "글 목록" 문구 잔존 없음 확인
- 변경 파일:
	- app/components/MainLayout.tsx
	- app/daily/page.tsx
	- app/components/RecentPostList.tsx
	- app/components/DailyPostBoard.tsx
	- app/components/PostDetailClient.tsx

### 2026-04-01
- 사용자 명령 요약:
	- 메인 페이지에 세계 시간 기준 대한민국(Asia/Seoul) 서버 시간 표시 요청
- 결과:
	- 메인 페이지에 `서버 시간(대한민국)` 텍스트 추가
	- `Intl.DateTimeFormat` + `timeZone: Asia/Seoul`로 시간 포맷 적용
	- `dynamic = force-dynamic` 설정으로 요청 시마다 서버 시간이 갱신되도록 반영
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/page.tsx

### 2026-04-01
- 사용자 명령 요약:
	- 다크모드 토글 추가 요청
- 결과:
	- 헤더에 테마 토글 버튼(`라이트/다크`) 추가
	- `ThemeToggle` 클라이언트 컴포넌트 생성(localStorage 저장 + html[data-theme] 반영)
	- `globals.css`에 data-theme 기반 다크모드 오버라이드 스타일 추가
	- 기존 레이아웃의 배경/텍스트/보더 색상이 다크모드에서 함께 전환되도록 반영
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/ThemeToggle.tsx
	- app/components/MainLayout.tsx
	- app/globals.css

### 2026-04-01
- 사용자 명령 요약:
	- 작성된 글 삭제 기능 추가 요청
- 결과:
	- 글 목록 각 항목 우측에 `삭제` 버튼 추가
	- 삭제 버튼 클릭 시 해당 글이 목록 상태에서 즉시 제거되도록 구현
	- 작성일/삭제 버튼을 한 줄에 배치해 목록 사용성 개선
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/DailyPostBoard.tsx

### 2026-04-01
- 사용자 명령 요약:
	- 작성/삭제한 글이 다음 방문에도 유지되도록 저장 기능 요청
	- 메인 페이지 최근 글 목록과 글 목록 페이지 데이터 연동 요청
- 결과:
	- `useCommunityPosts` 공용 훅 추가(localStorage 저장/로드)
	- 글 작성/삭제 데이터가 브라우저에 영구 저장되어 재방문 시 유지
	- `DailyPostBoard`를 공용 훅 기반으로 전환하여 작성/삭제 상태를 저장소와 동기화
	- `RecentPostList`도 동일 저장소를 읽도록 변경하여 메인 최근 글 목록 자동 연동
	- 사용자 작성 글은 상세 페이지 미구현 상태를 고려해 메인에서 일반 텍스트로 표시
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/hooks/useCommunityPosts.ts
	- app/components/DailyPostBoard.tsx
	- app/components/RecentPostList.tsx
	- app/page.tsx

### 2026-04-01
- 사용자 명령 요약:
	- 사용자 작성 글도 실제 커뮤니티처럼 상세 페이지에서 열리도록 연동 요청(ㄲㄱ)
- 결과:
	- `PostDetailClient` 컴포넌트 추가(정적 글 + localStorage 글 통합 조회)
	- `/posts/[id]` 페이지를 클라이언트 상세 렌더러 기반으로 확장
	- 메인 최근 글 목록에서 사용자 작성 글도 상세 링크 이동 가능하게 변경
	- 글 목록 페이지의 제목도 상세 링크로 통일
	- 저장 훅 유틸 함수(`readCommunityPostsFromStorage`) export 처리
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/PostDetailClient.tsx
	- app/posts/[id]/page.tsx
	- app/components/RecentPostList.tsx
	- app/components/DailyPostBoard.tsx
	- app/hooks/useCommunityPosts.ts

### 2026-04-01
- 사용자 명령 요약:
	- 글 목록 페이지 디자인 개선 및 글 작성 기능 추가 요청
- 결과:
	- `DailyPostBoard` 클라이언트 컴포넌트 추가(제목/내용 입력 + 글 등록)
	- 작성 시 새 글이 목록 맨 위에 즉시 반영되도록 상태 관리 구현
	- 목록 UI를 카드형 리스트로 정리하여 작성일/제목/내용을 함께 표시
	- `/daily` 페이지에서 기존 정적 리스트를 새 작성형 컴포넌트로 교체
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/DailyPostBoard.tsx
	- app/daily/page.tsx

### 2026-04-01
- 사용자 명령 요약:
	- 다크모드에서 오른쪽 상단 네비게이션(홈, 글 목록 등) 색상을 배경과 대비되게 변경 요청
- 결과:
	- 네비게이션 링크에 전용 클래스(`nav-menu-link`) 부여
	- 다크모드에서 링크 텍스트를 밝은 색으로 강제 오버라이드
	- hover 시 더 밝은 텍스트 + 어두운 배경으로 버튼 대비 강화
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/MainLayout.tsx
	- app/globals.css

### 2026-04-01
- 사용자 명령 요약:
	- 다크모드에서 hover 시 버튼이 안 보이는 현상 수정 요청
- 결과:
	- 토글 버튼에 전용 클래스(`theme-toggle-btn`) 부여
	- 다크모드에서 버튼 기본/hover 상태의 텍스트·배경·보더 대비를 강제 오버라이드
	- hover 시에도 버튼 텍스트가 배경과 겹치지 않도록 가시성 개선
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/ThemeToggle.tsx
	- app/globals.css

### 2026-04-01
- 사용자 명령 요약:
	- 다크모드에서 푸터의 GitHub/Instagram/Email 아이콘이 안 보이는 문제 수정 요청
- 결과:
	- 푸터 아이콘들에 공통 클래스(`footer-icon`) 적용
	- 다크모드에서 아이콘에 `filter: brightness(0) invert(1)` 적용해 흰색 계열로 표시
	- GitHub/Instagram/Email 아이콘 가시성 개선
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/components/MainLayout.tsx
	- app/components/FooterEmailLink.tsx
	- app/globals.css

### 2026-04-02
- 사용자 명령 요약:
	- 로그인 기능과 커뮤니티 기능을 실제 화면 흐름에 맞게 구현 요청
	- 모바일 반응형 네비게이션 메뉴 추가 요청
	- 취미 후기와 댓글 기능 추가 요청
	- 프로필/토스트 UX를 더 자연스럽게 다듬는 요청
- 결과:
	- `AuthForm`, `AuthStatusControl`, `MyPageClient`를 중심으로 로그인/마이페이지 흐름 정리
	- `DailyPostBoard`, `PostDetailClient`, `useCommunityPosts`, `usePostComments`에 댓글·작성자 정보·확인 메시지 흐름 추가
	- `MainLayout`에 모바일 햄버거 메뉴를 붙여 작은 화면에서도 메뉴 탐색이 가능하게 개선
	- `HobbyReviewClient`와 `app/hobby/page.tsx`를 추가해 취미 후기/댓글 흐름 구현
	- 토스트/프리뷰/프로필 관련 UX를 정리하고 전역 사용자 저장소를 도입
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/auth/page.tsx
	- app/components/AuthForm.tsx
	- app/components/AuthStatusControl.tsx
	- app/components/DailyPostBoard.tsx
	- app/components/MainLayout.tsx
	- app/components/MyPageClient.tsx
	- app/components/PostDetailClient.tsx
	- app/components/PostDetailSkeleton.tsx
	- app/components/RecentPostList.tsx
	- app/components/HobbyReviewClient.tsx
	- app/hooks/useCommunityPosts.ts
	- app/hooks/usePostComments.ts
	- app/hobby/page.tsx
	- app/mypage/page.tsx
	- app/page.tsx
	- app/globals.css
	- app/loading.tsx
	- lib/toast.ts
	- next.config.ts
	- package.json
	- package-lock.json
	- public/profile-placeholder.svg
	- store/useUserStore.ts

### 2026-04-06
- 사용자 명령 요약:
	- 커뮤니티 작성 페이지 SSR 빌드 오류 수정 요청
	- 패키지 잠금 파일을 재생성하고 의존성 충돌을 무시하는 방식으로 재설치 요청
- 결과:
	- `app/community/write/page.tsx`의 세션 접근을 정리해 SSR 빌드 오류를 수정
	- `package-lock.json`을 `legacy-peer-deps` 기준으로 다시 생성하고 업데이트
	- 빌드 중 의존성 충돌 때문에 생기던 설치/잠금 문제를 정리
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/community/write/page.tsx
	- package-lock.json

### 2026-04-08
- 사용자 명령 요약:
	- Ch5: 블로그 목록/상세/작성 페이지 정리 요청
- 결과:
	- 커뮤니티 작성/목록/상세 흐름에서 세션 확인 로직을 안전한 helper로 분리
	- 홈 대시보드, 댓글, 마이페이지, 취미 후기, 게시글 상세 쪽에서 `safe session/user` 접근을 통일
	- `lib/supabaseAuth.ts`를 추가해 세션 조회를 재사용 가능한 공용 함수로 정리
	- 커뮤니티/취미/마이페이지/상세 페이지 전반에 걸친 빌드 안정성을 높임
	- 타입/문법 오류 없음 확인
- 변경 파일:
	- app/community/write/page.tsx
	- app/components/DailyPostBoard.tsx
	- app/components/HobbyReviewClient.tsx
	- app/components/HomeDashboardGrid.tsx
	- app/components/MyPageClient.tsx
	- app/components/PostDetailClient.tsx
	- app/hooks/useCommunityPosts.ts
	- app/page.tsx
	- lib/supabaseAuth.ts

### YYYY-MM-DD HH:mm
- 사용자 명령 요약:
	- (요청 핵심 1~2줄)
- 결과:
	- (무엇을 만들거나 수정했는지)
	- (검증 결과: 오류 여부)
- 변경 파일:
	- (파일 경로 목록)


