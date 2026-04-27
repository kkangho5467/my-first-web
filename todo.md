# 할 일 목록

## 0단계. 문서화 및 컨텍스트 - 100%

- [x] 프로젝트 목표 및 비목표 정의
- [x] 초기 워크스페이스 상태 기록
- [x] 기준 페이지 맵 작성
- [x] 데이터 모델 방향 기록
- [x] shadcn/ui 테마 계획 문서화

### 0단계 검증 결과 (2026-04-15)

- [x] 목표/비목표: ARCHITECTURE.md에 제품 목표, 비목표 섹션 존재
- [x] 초기 상태 기록: context.md에 초기 상태 스냅샷, 기술 결정 사항 존재
- [x] 페이지 맵: ARCHITECTURE.md에 경로/상태/목적 기반 페이지 맵 표 존재
- [x] 데이터 모델: ARCHITECTURE.md에 profiles, posts, comments와 관계 정의 존재
- [x] 테마 계획: copilot-instructions.md에 디자인 토큰 및 컴포넌트 규칙 존재

## 1단계. 기반 설정 - 100%

- [x] npx shadcn init 실행
- [x] shadcn/ui 컴포넌트 레지스트리 생성 또는 업데이트
- [x] app/globals.css에 테마 CSS 변수 추가
- [x] shadcn 토큰을 다크 우선 팔레트에 매핑
- [x] 앱 셸에 새 테마 토큰 반영 여부 확인

### 1단계 검증 결과 (2026-04-15)

- [x] 초기화 완료: components.json 생성
- [x] 기본 프리미티브 생성: components/ui/button.tsx, card.tsx, input.tsx, dialog.tsx
- [x] 토큰 적용: app/globals.css에 background/surface/primary/accent/border 등 CSS 변수 반영
- [x] 셸 반영: MainLayout 루트/헤더/푸터에 bg-background, bg-surface, border-border 적용
- [x] 유틸 연결: lib/utils.ts의 cn 헬퍼 추가

## 2단계. 정보 구조 - 100%

- [x] Copilot Vision 또는 v0로 AI 와이어프레임 2장 생성
- [x] 생성한 와이어프레임을 디자인 노트에 첨부
- [x] /posts 및 /posts/new 기준 라우트 구조 확정
- [x] /daily를 영구 커뮤니티 라우트로 유지할지 alias로 둘지 결정
- [x] 인증 필요 화면의 라우트 보호 규칙을 명시적으로 유지

### 2단계 진행 메모 (2026-04-15)

- [x] /posts 라우트 생성 및 목록 화면 연결
- [x] /posts/new 라우트 생성 및 작성 화면 연결
- [x] /daily -> /posts 리디렉션 적용(alias 결정)
- [x] 보호 대상 경로(/mypage, /posts/new, /community/write) 정책 문서화
- [x] 와이어프레임 문서 초안 2장 생성(docs/wireframes/home-dashboard-v1.md, docs/wireframes/post-editor-v1.md)
- [x] 와이어프레임 이미지 자산 2장 생성(docs/wireframes/home-dashboard-v1.svg, docs/wireframes/post-editor-v1.svg)

## 3단계. 데이터 모델 - 100%

- [x] profiles 테이블 구조 확정
- [x] posts 테이블 구조 확정
- [x] comments 테이블 구조 확정
- [x] 외래 키 관계 정의
- [x] 선택적 카운터 컬럼 유지 범위 결정

### 3단계 검증 결과 (2026-04-15)

- [x] 실행 가능한 SQL 마이그레이션 작성(supabase/migrations/20260415_001_core_schema.sql)
- [x] profiles: auth.users 1:1 + nickname/avatar_url + updated_at 트리거
- [x] posts: author FK + category 제약 + views/likes 기본값 및 음수 방지 제약
- [x] comments: posts/profiles FK + post_id 기준 정렬 인덱스
- [x] 관계/정책 내용을 ARCHITECTURE.md, context.md와 동기화

## 4단계. UI 시스템 - 100%

- [x] 앱에 필요한 shadcn/ui 기본 프리미티브 구성
- [x] 임의 버튼/폼 컨트롤을 shadcn 컴포넌트로 대체
- [x] 로딩/빈 상태/오류 상태 표현 표준화
- [x] 카드/배지/액션 바 패턴을 페이지 전반에서 정규화
- [x] 레이아웃 간격과 타이포그래피 일관성 유지

### 4단계 진행 메모 (2026-04-15)

- [x] AuthForm을 shadcn Card/Input/Button 기반으로 치환
- [x] DailyPostBoard의 검색/주요 액션/페이지네이션 버튼을 shadcn Button/Input으로 치환
- [x] Supabase 스키마 적용 가이드 문서 작성(docs/supabase-schema-apply.md)
- [x] CommunityWritePage를 shadcn Card/Input/Button 기반으로 치환
- [x] PostDetailClient를 shadcn Card/Button/Textarea/Badge 기반으로 치환
- [x] 누락 프리미티브(Textarea, Badge)를 components/ui에 보강

## 5단계. 페이지 구현 - 100%

- [x] 홈 페이지를 새 테마 시스템에 맞게 개편
- [x] 커뮤니티 피드를 기준 페이지 구조로 리팩터링
- [x] 신규 게시글 에디터 라우트 생성 또는 정렬
- [x] 게시글 상세의 액션/댓글 일관성 개선
- [x] 인증 및 프로필 페이지 시각 언어 통일

### 5단계 검증 메모 (2026-04-15)

- [x] 홈(/)에서 최신 커뮤니티/취미/방명록 섹션이 렌더링됨
- [x] /posts 에서 검색/필터/목록 카드가 렌더링됨
- [x] /posts/144, /posts/143 에서 상세 본문/좋아요/댓글 영역이 렌더링됨
- [x] /community/write?mode=edit&id=144 는 비로그인 시 인증 화면으로 안내됨
- [x] /mypage 와 /auth 는 로그인/프로필 진입 흐름으로 렌더링됨

## 6단계. 검증 - 60%

- [x] 주요 변경마다 lint 점검 실행
- [x] 데스크톱/모바일 폭에서 브라우저 동작 확인
- [x] 보호 라우트의 인증 흐름 점검
- [ ] 게시글 작성/수정/삭제 흐름 점검
- [ ] 최종 디자인을 와이어프레임과 대조 검토

### 6단계 진행 메모 (2026-04-15)

- [x] `npm run lint` 실행 완료
- [x] lint 에러는 0건으로 정리
- [x] 홈(/), 목록(/posts), 작성(/posts/new) 렌더링 확인
- [x] /posts/new, /community/write는 비로그인 시 인증 화면으로 안내됨
- [x] 이미지 최적화/unused warning 등 비치명 경고 정리 완료

## 7단계. 다음 개발 마일스톤 (포트폴리오 + 커뮤니티 완성)

### 현재 시스템 분석 요약 (기준선)
- [x] Auth + RLS로 작성자 권한 제어와 비로그인 예외 처리 안정화
- [x] Quill 기반 커스텀 글쓰기(정렬/폰트/이미지 업로드/썸네일 추출) 구현
- [x] 동적 상세 페이지 본문 렌더링 안정화(ql-editor + HTML 출력)

### Phase 1. 커뮤니티 핵심 기능 완성 (CRUD/UX)

- [x] 게시글 목록의 로딩/빈 상태/에러 상태를 컴포넌트 단위로 표준화
	- 활용 스택: React Hooks(useState, useEffect), Tailwind CSS v4, Sonner

- [ ] 커뮤니티 목록에서 검색 + 카테고리 필터 + 페이지네이션 동작을 E2E 시나리오 기준으로 검증하고 버그 수정
	- 활용 스택: React Hooks, TypeScript(strict), Tailwind CSS v4

- [ ] 상세 페이지 댓글 작성/삭제에 낙관적 업데이트 적용(실패 시 롤백)
	- 활용 스택: React Hooks, Supabase Database + RLS, Sonner

- [ ] 게시글 수정/삭제 성공/실패 피드백을 토스트 중심으로 일원화(alert 최소화)
	- 활용 스택: Sonner, Supabase, TypeScript

- [ ] 커뮤니티 작성/수정 폼의 공통 검증 스키마(제목/본문/카테고리) 유틸 분리
	- 활용 스택: TypeScript, React Hooks, Next.js App Router

### Phase 1 진행 메모 (2026-04-27)

- [x] 게시글 목록에 로딩/빈/에러 상태 UI와 재시도 액션 반영

### Phase 2. 포트폴리오 경험 강화 (브랜딩/프로젝트 섹션)

- [ ] 홈 화면에 Portfolio Hero 섹션 추가(소개, 핵심 스택, CTA)
	- 활용 스택: Next.js App Router, Tailwind CSS v4, Lucide Icons

- [ ] Skills 섹션 추가(기술 카테고리별 뱃지/숙련도/사용 프로젝트 연결)
	- 활용 스택: React + TypeScript, Tailwind CSS v4, Radix Primitives

- [ ] Projects 섹션 추가(대표 프로젝트 카드, 문제/해결/성과, 링크)
	- 활용 스택: Next.js, Tailwind CSS v4, Lucide Icons

- [ ] 커뮤니티 최신 글/취미 최신 글 패널을 포트폴리오 콘텐츠와 시각적으로 통일
	- 활용 스택: Tailwind CSS v4, React 컴포넌트 분리, Zustand(표시 상태)

- [ ] About/Contact 섹션에 이메일 복사, 외부 링크, 이력서 다운로드 동선 추가
	- 활용 스택: React Hooks, Sonner, Next.js Link

### Phase 3. 데이터/보안/운영 안정화

- [ ] Supabase 테이블 인덱스 점검 및 느린 쿼리 대상 최적화(posts created_at, comments post_id)
	- 활용 스택: Supabase Database, SQL, Next.js fetch 패턴

- [ ] RLS 정책 회귀 테스트 시나리오 문서화(본인/타인/관리자 권한 케이스)
	- 활용 스택: Supabase Auth + RLS, TypeScript 테스트 스크립트

- [ ] Storage 업로드 정책/파일명 규칙/용량 제한을 명시하고 업로드 실패 처리 강화
	- 활용 스택: Supabase Storage, React Quill 이미지 업로드, Sonner

- [ ] 클라이언트 전역 상태(Zustand)와 Supabase 세션 동기화 지점 단일화
	- 활용 스택: Zustand, React Hooks, Supabase Auth

- [ ] 환경변수 누락/오설정 시 런타임 가드 및 오류 메시지 개선
	- 활용 스택: Next.js, TypeScript, Supabase Client 초기화 가드

### Phase 4. 성능/품질/배포 준비

- [ ] 라우트별 번들/렌더링 비용 점검 후 무거운 컴포넌트 동적 로딩 적용(에디터/하이라이터)
	- 활용 스택: Next.js App Router(dynamic import), React 19

- [ ] 이미지 최적화 정책 정리(썸네일 크기, lazy-loading, remotePatterns 검증)
	- 활용 스택: Next/Image, Supabase Storage, next.config.ts

- [ ] 접근성 점검(키보드 포커스, aria-label, 색 대비) 체크리스트 작성 및 반영
	- 활용 스택: React, Tailwind CSS v4, Radix Primitives

- [ ] 품질 게이트 정립(ESLint 통과, 핵심 사용자 시나리오 수동 QA, 회귀 체크)
	- 활용 스택: ESLint(Next + TS), TypeScript strict, QA 문서

- [ ] 배포 전 최종 점검 문서 작성(환경변수, RLS, 스토리지 버킷, 라우트 보호)
	- 활용 스택: Next.js, Supabase(Auth/DB/Storage/RLS), 운영 문서화

### 실행 우선순위 제안
- [ ] 1주차: Phase 1 완료 (커뮤니티 기능 안정화)
- [ ] 2주차: Phase 2 완료 (포트폴리오 표현력 강화)
- [ ] 3주차: Phase 3 완료 (보안/데이터 운영 안정화)
- [ ] 4주차: Phase 4 완료 (성능/품질/배포 준비)
