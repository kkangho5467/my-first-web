# B회차 작업 체크리스트

## 전체 진행률

- 진행률: 100%
- 기준일: 2026-04-29

## 1단계. 제출물 매핑 점검 - 100%

- [x] ① 페이지 맵 보강 여부 확인
- [x] ② AI 와이어프레임 2장 이상 존재 확인
- [x] ③ shadcn init 및 테마 커스터마이징 상태 확인
- [x] ④ 데이터 모델(2개 이상 + 관계) 확인
- [x] ⑤ copilot-instructions 섹션(Design Tokens + Component Rules) 확인
- [x] ⑥ ARCHITECTURE 통합 문서 존재 확인
- [x] ⑦ context 현재 상태 문서 존재 확인
- [x] ⑧ todo 체크리스트 문서 존재 확인

검증 메모:

- [x] 와이어프레임 자산: `docs/wireframes/home-dashboard-v1.svg`, `docs/wireframes/post-editor-v1.svg`
- [x] shadcn 설정: `components.json`
- [x] 핵심 스키마: `supabase/migrations/20260415_001_core_schema.sql`

## 2단계. 아키텍처 설계서 보강 - 100%

- [x] 페이지 맵을 현재 라우트 기준으로 재정리
- [x] 컴포넌트 계층을 앱 셸/페이지/프리미티브로 분리
- [x] 데이터 모델을 core + hobby 도메인으로 통합
- [x] 인증/권한/보호 라우트 구조 문서화
- [x] Ch8~12 대비 RLS 정책 초안 추가
- [x] 성능/운영 기준과 후속 우선순위 추가
- [x] CRUD + 인증 흐름 매트릭스 추가
- [x] `hobby_likes` 적용 정책명 명시
- [x] 문서 단일 기준(Source of Truth) 섹션 추가

검증 메모:

- [x] `ARCHITECTURE.md` 전면 갱신 완료

## 3단계. 프로젝트 상태 기록 정리 - 100%

- [x] 현재 스택/라우트/권한 상태 최신화
- [x] 최근 반영 사항(B회차 문서화/썸네일 정책/상세 레이아웃) 기록
- [x] 남은 리스크 항목 명시
- [x] 문서 기준 계약(역할 분담) 정리
- [x] Copilot 지침 파일 단일화(`.github/copilot-instructions.md`) 반영

검증 메모:

- [x] `context.md` 최신 상태 반영 완료

## 4단계. 코드/문서 일관성 보강 - 70%

- [x] 라이트/다크 모드 색상 정책 정리(다크에서만 어둡게)
- [x] 홈 최신글 썸네일 fallback/미표시 정책 적용
- [x] 상세 페이지 헤더/댓글 폼 여백 보정
- [ ] 커뮤니티/취미 최신글 UI 토큰을 디자인 토큰 변수 기반으로 재정리
- [ ] alert 기반 피드백을 toast 중심으로 일원화

## 5단계. Supabase 대비 마무리 (Ch8~12 준비) - 55%

- [x] `hobby_likes` RLS 정책/토글 RPC 반영 상태 확인
- [x] `posts`/`comments` RLS 정책 SQL 초안 파일 분리
- [x] 관리자 권한 판별을 role/claim 기반으로 전환(정책 함수 초안 추가)
- [x] `hobbies` 테이블 DDL 기준선 문서화(마이그레이션 명시)
- [ ] 권한 회귀 테스트 시나리오 문서 추가

## 6단계. 최종 제출 전 점검 - 60%

- [x] 빌드 확인 (`npm run build`)
- [x] 린트 재확인 (`npm run lint`)
- [ ] 제출물 8개 항목 스크린샷/증빙 체크
- [ ] 문서 간 용어 통일(경로명, 테이블명, 권한 용어)

## 즉시 다음 액션 (우선순위)

- [ ] `supabase/migrations`에 RLS 초안 SQL 추가
- [ ] `hobbies` DDL 기준선 문서화
- [ ] lint 최종 실행 후 결과를 `context.md`에 기록

완료 메모:

- [x] `supabase/migrations/20260429_001_posts_comments_hobbies_rls_baseline.sql` 추가
- [x] ARCHITECTURE/context/todo 동기화 완료
