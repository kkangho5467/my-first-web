Ch14. 기말 평가 기준
평가 개요
항목
내용
총점
30점 + 보너스 최대 5점
제출물
GitHub 저장소 URL + Vercel 배포 URL
평가 방법
배포 사이트 기능 테스트 + GitHub 코드 열람
배점 요약
영역
배점
해당 챕터
A. 인증
7점
Ch9
B. 게시글 CRUD
8점
Ch10
C. RLS 보안
5점
Ch11
D. UX & 에러 처리
4점
Ch12
E. 프로젝트 구조 & 코드 품질
3점
Ch4–Ch8
F. 테스트 & 배포
3점
Ch13
합계
30점
G. 보너스
최대 3점
추가 구현
제출물

GitHub 저장소 URL 제출

Vercel 배포 URL 제출 (접속 가능해야 함)
A. 인증 (7점)
#
평가 항목
배점
확인 방법
A1
/signup에서 회원가입이 된다
1
배포 사이트에서 새 이메일로 가입
A2
/login에서 로그인이 된다
1
가입한 계정으로 로그인 → 페이지 이동 확인
A3
로그아웃 버튼이 작동한다
1
로그아웃 클릭 → 로그인/회원가입 링크 재표시
A4
새로고침해도 로그인이 유지된다
1
로그인 후 F5 → 여전히 로그인 상태
A5
비로그인 시 /posts/new → /login 이동
1
로그아웃 후 /posts/new 직접 입력
A6
lib/auth.ts에서 signInWithPassword, signUp, signOut 사용
1
GitHub 코드 확인
A7
AuthProvider(또는 동등 컨텍스트)와 middleware.ts 존재
1
GitHub 코드 확인
B. 게시글 CRUD (8점)
#
평가 항목
배점
확인 방법
B1
/posts에서 게시글 목록이 보인다
1
배포 사이트 접속
B2
게시글 클릭 시 상세 페이지로 이동한다
1
목록에서 글 클릭 → 제목·내용·작성일 표시
B3
로그인 후 새 글을 작성할 수 있다
2
/posts/new에서 작성 → 목록에 반영 확인
B4
본인 글을 수정할 수 있다
1
수정 버튼 → 내용 변경 → 저장 후 반영 확인
B5
본인 글을 삭제할 수 있다
1
삭제 버튼 → 목록에서 사라짐 확인
B6
다른 사람의 글에는 수정/삭제 버튼이 보이지 않는다
1
다른 계정으로 로그인 후 확인
B7
코드에서 Supabase select/insert/update/delete 사용
1
GitHub 코드 확인
C. RLS 보안 (5점)
#
평가 항목
배점
확인 방법
C1
비로그인 사용자도 /posts 목록을 볼 수 있다
1
로그아웃 상태에서 /posts 접속
C2
다른 사용자의 글을 수정하면 실패한다 (DB 차단)
1
다른 계정으로 수정 시도
C3
다른 사용자의 글을 삭제하면 실패한다 (DB 차단)
1
다른 계정으로 삭제 시도
C4
supabase/migrations/ 아래 RLS SQL 파일이 있다
1
GitHub 코드 확인
C5
INSERT에 WITH CHECK, UPDATE에 USING + WITH CHECK 사용
1
GitHub SQL 파일 확인
D. UX & 에러 처리 (4점)
#
평가 항목
배점
확인 방법
D1
loading.tsx 파일이 2개 이상 존재한다
1
GitHub 코드 확인
D2
app/error.tsx 에러 바운더리가 있다
1
GitHub 코드 확인 ("use client", reset() 포함)
D3
게시글 0개일 때 안내 문구 + 새 글 폼 검증이 있다
1
배포 사이트에서 빈 제목 제출 시도
D4
에러 메시지가 사용자 친화적이다 (lib/error-message.ts)
1
로그인 실패 시 한국어 안내 메시지 표시 확인
E. 프로젝트 구조 & 코드 품질 (3점)
#
평가 항목
배점
확인 방법
E1
pages/ 폴더 없음, next/router 미사용
1
GitHub 코드 확인
E2
service_role 등 민감 키가 코드에 노출되지 않았다
1
GitHub 코드 검색
E3
lib/supabase/client.ts를 사용한다
1
GitHub 코드 확인
F. 테스트 & 배포 (3점)
#
평가 항목
배점
확인 방법
F1
Vercel 배포 URL이 정상 작동한다
1
배포 URL 접속
F2
tests/ 폴더에 Playwright 테스트 파일이 있다
1
GitHub 코드 확인
F3
npm run build가 통과한다 (Vercel 배포 성공으로 증명)
1
Vercel 배포 상태 확인
G. 보너스 (최대 5점)
아래 중 구현한 항목당 1점, 최대 5점까지 인정됩니다.
#
항목
확인 방법
G1
댓글 기능
게시글 상세에서 댓글 작성·표시
G2
좋아요 / 추천
좋아요 버튼 클릭 시 카운트 증가
G3
프로필 페이지
/profile 또는 /mypage에서 사용자 정보 표시
G4
이미지 업로드
글 작성 시 이미지 첨부 가능
G5
검색 기능
/posts에서 검색 시 제목/내용 필터링
G6
다크 모드
토글로 다크/라이트 모드 전환
G7
반응형 디자인
모바일 뷰포트에서 레이아웃 정상
G8
기타
수업 범위 밖 추가 기능 자유 구현
