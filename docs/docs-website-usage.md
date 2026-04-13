# 웹사이트 사용 파일 역할 정리

## 문서 목적
- 이 문서는 현재 웹사이트 런타임에서 실제로 사용되는 파일만 추려서 역할을 정리한 문서입니다.
- 기준: App Router 페이지에서 시작해 import로 연결되는 컴포넌트, 훅, 유틸, 상태, 데이터 파일.

## 1) 라우트(페이지 진입점)

### 공통 레이아웃
- app/layout.tsx
	- 전역 HTML/BODY 구조, 폰트, 글로벌 스타일(globals.css) 적용.
- app/loading.tsx
	- 라우트 전환/로딩 시 공통 스켈레톤 UI 표시.

### 홈
- app/page.tsx
	- 홈 라우트 진입점. MainLayout + HomeDashboardGrid 조합.

### 인증
- app/auth/page.tsx
	- 인증 페이지 진입점. MainLayout + AuthForm 조합.

### 커뮤니티 목록
- app/daily/page.tsx
	- 커뮤니티 목록 페이지 진입점. MainLayout + DailyPostBoard 조합.

### 글 작성/수정
- app/community/write/page.tsx
	- 글 작성/수정 화면.
	- mode/id 쿼리로 수정 모드 분기, 로그인/권한 체크, QuillEditor 연동, 저장 처리.

### 글 상세
- app/posts/[id]/page.tsx
	- 동적 상세 페이지 진입점.
	- params를 await 후 PostDetailClient에 id 전달.

### 취미
- app/hobby/page.tsx
	- 취미 피드 페이지 진입점. MainLayout + HobbyReviewClient 조합.

### 목표
- app/goals/page.tsx
	- 목표 페이지.
	- content/blog-content.ts의 goals 정적 데이터 렌더링.

### 마이페이지
- app/mypage/page.tsx
	- 마이페이지 진입점.
	- MainLayout + MyProfile 조합.

## 2) 핵심 UI 컴포넌트

- app/components/MainLayout.tsx
	- 상단 네비게이션/하단 푸터/모바일 메뉴/전역 토스트 컨테이너.
	- 마이페이지 접근 시 로그인 세션 검증.

- app/components/AuthForm.tsx
	- 로그인/회원가입 폼.
	- 아이디를 pseudo email로 변환해 Supabase Auth와 연동.
	- Enter 제출 지원(onSubmit).

- app/components/AuthStatusControl.tsx
	- 헤더 우측 로그인 상태 표시(아바타/닉네임/로그아웃).
	- profiles + auth 세션 동기화.

- app/components/ThemeToggle.tsx
	- 라이트/다크 테마 토글, localStorage 저장.

- app/components/FooterEmailLink.tsx
	- 푸터 이메일 툴팁/복사 UI.

- app/components/HomeDashboardGrid.tsx
	- 홈 대시보드 3패널(영상/방명록/최신 커뮤니티/최신 취미).
	- 최신 목록은 Supabase/커뮤니티 훅 데이터 사용.

- app/components/DailyPostBoard.tsx
	- 커뮤니티 목록 본체.
	- 검색/카테고리 필터/페이지네이션/선택 삭제/권한별 수정/삭제 버튼 처리.

- app/components/PostDetailClient.tsx
	- 게시글 상세 본문/좋아요/댓글 작성/삭제 처리.
	- 상세 데이터 및 댓글 데이터 로딩, 권한 체크.

- app/components/QuillEditor.tsx
	- 커뮤니티 작성 페이지용 에디터.
	- 동적 Quill 초기화, 이미지 업로드 훅 연동.

- app/components/HobbyReviewClient.tsx
	- 취미 피드 CRUD + 좋아요 + 권한 기반 수정/삭제.

- app/components/MyProfile.tsx
	- 프로필 페이지 본체.
	- 닉네임/아바타 편집, 이미지 크롭 후 Supabase Storage 업로드.

## 3) 훅(데이터/도메인 로직)

- app/hooks/useCommunityPosts.ts
	- 커뮤니티 posts 조회/생성/수정/삭제.
	- DB row를 화면용 MockPost 형태로 정규화.
	- refetchPosts로 목록 재동기화.

- app/hooks/usePostComments.ts
	- 댓글 조회/등록/삭제.
	- 관리자/작성자 권한 체크 포함.

## 4) 공용 유틸(lib)

- lib/supabaseClient.ts
	- Supabase 클라이언트 단일 생성 지점.

- lib/supabaseAuth.ts
	- 안전한 세션/유저 조회(getSafeSession, getSafeUser).
	- auth lock 계열 예외 완화.

- lib/paginatePosts.ts
	- 커뮤니티 목록 페이지네이션 슬라이싱.

- lib/searchPosts.ts
	- 제목/본문 통합 검색 필터 유틸.

- lib/toast.ts
	- 전역 커스텀 이벤트 기반 토스트 트리거.

- lib/uploadImageToSupabase.ts
	- 에디터 이미지 파일 업로드 후 public URL 반환.

## 5) 상태/콘텐츠 데이터

- store/useUserStore.ts
	- 전역 사용자 상태(email, nickname, avatarUrl) 저장.

- content/blog-content.ts
	- 목표(goals) 등 정적 콘텐츠 타입/데이터 정의.

## 6) 정적 자산(public)

- public/github.svg
- public/instagram.svg
- public/email.svg
- public/profile-placeholder.svg

위 자산은 헤더/푸터/프로필 UI에서 사용됩니다.

## 참고
- 현재 코드 기준으로 app/components/MyPageClient.tsx, app/components/PostDetailSkeleton.tsx는 import 연결이 없어 런타임 사용 목록에서 제외했습니다.
