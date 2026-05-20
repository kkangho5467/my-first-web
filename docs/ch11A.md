# Chapter 11. Row Level Security (RLS)

# Chapter 11. Row Level Security (RLS) — A회차: 강의

> **미션**: 게시글은 누구나 읽되, 작성·수정·삭제 권한은 데이터베이스가 직접 강제하게 만든다
> 

---

**고정 버전** (Ch7·Ch8 교재 기준):

| 패키지 | 버전 |
| --- | --- |
| `next` | 16.2.1 |
| `@supabase/supabase-js` | 2.47.12 |
| `@supabase/ssr` | 0.5.2 |

> Supabase 대시보드 메뉴는 2026년 5월 기준으로 안내한다. 그러나 RLS 정책 적용은 Ch8에서 배운 CLI 마이그레이션을 기준으로 진행한다.
> 

---

## 학습목표

1. 클라이언트 UI 분기와 데이터베이스 보안의 차이를 설명할 수 있다
2. RLS, `CREATE POLICY`, `USING`, `WITH CHECK`, `auth.uid()`의 역할을 읽을 수 있다
3. Supabase CLI 마이그레이션으로 보안 정책을 코드에 남길 수 있다
4. 비로그인/다른 사용자 시나리오로 RLS를 검증할 수 있다

---

## 11.1 왜 RLS인가?

Ch10에서 “작성자에게만 수정/삭제 버튼 표시”를 만들었다. 하지만 버튼을 숨기는 것은 보안이 아니다. 브라우저 콘솔이나 직접 요청으로 다른 사람 글을 수정하려고 할 수 있다.

| 위치 | 예시 | 보안인가? |
| --- | --- | --- |
| React UI | `user.id === post.user_id`일 때 버튼 표시 | ❌ UX |
| PostgreSQL RLS | `auth.uid() = user_id` 정책 | ✅ 보안 |

> 핵심 원칙: **클라이언트를 신뢰하지 않는다.** 최종 권한은 Supabase 데이터베이스가 검사해야 한다.
> 

---

## 11.2 Ch8 Supabase CLI 연결 확인 `⌨️ CLI`

RLS는 반드시 마이그레이션으로 남긴다. 먼저 Ch8에서 연결한 프로젝트가 맞는지 확인한다.

```bash
npx supabase --version
npx supabase projects list
```

필요하면 다시 연결한다.

```bash
npx supabase link --project-ref 프로젝트참조ID
```

---

## 11.3 프로젝트 기준 문서 정비와 Ch10 상태 확인 `🤖 바이브코딩`

```
#file:context.md #file:todo.md #file:ARCHITECTURE.md

Ch11 RLS 작업을 시작하기 전에 기준 문서와 프로젝트 상태를 정비해줘.

작업 규칙:
1. context.md, todo.md, ARCHITECTURE.md가 없으면 Ch7 기준으로 만들어줘.
2. AGENTS.md, CLAUDE.md, .agent/rules/project.md가 없으면 필요한 경우 Ch7 기준으로 만들어줘.
3. 파일이 있으면 Ch11 기준과 충돌하는 부분을 바로 수정해줘.
4. 실제 package.json이 교재 기준보다 최신이면 "교재 기준"과 "현재 설치 기준"을 함께 적어줘.

Ch11 기준:
- RLS는 SQL Editor 직접 실행이 아니라 Supabase CLI 마이그레이션으로 남긴다.
- posts 테이블의 user_id와 auth.uid()를 기준으로 정책을 만든다.
- 클라이언트 UI 분기는 보안이 아니며, 실제 보안은 RLS가 담당한다.
- service_role 키는 클라이언트에서 절대 사용하지 않는다.

먼저 정비한 문서와 현재 상태를 요약해줘.
아직 SQL은 만들지 말고, RLS 적용 대상만 알려줘.
```

---

## 11.4 권한 시나리오 먼저 고정 `🤖 바이브코딩`

SQL을 만들기 전에 자연어 정책을 확정한다.

RLS는 Row Level Security의 약자로, 테이블의 각 행을 누가 읽고 쓸 수 있는지 데이터베이스가 직접 검사하는 기능이다. 버튼을 숨기는 UI 분기와 달리, RLS는 사용자가 요청을 직접 보내도 데이터베이스 단계에서 막는다. 그래서 SQL을 쓰기 전에 “누가 무엇을 할 수 있는가”를 자연어로 먼저 고정해야 실수할 가능성이 줄어든다.

| 작업 | 권한 |
| --- | --- |
| SELECT | 누구나 게시글 읽기 가능 |
| INSERT | 로그인 사용자만 본인 `user_id`로 작성 |
| UPDATE | 작성자만 수정 |
| DELETE | 작성자만 삭제 |

```
아직 SQL은 실행하지 마.

posts 테이블에 적용할 RLS 정책을 자연어로 먼저 정리해줘.

권한 시나리오:
- SELECT: 누구나 읽기 가능
- INSERT: 로그인 사용자만 가능, user_id는 auth.uid()와 같아야 함
- UPDATE: 작성자만 가능, 수정 후에도 user_id는 auth.uid()와 같아야 함
- DELETE: 작성자만 가능

출력:
1. 정책 이름 목록
2. 각 정책에 사용할 USING / WITH CHECK 조건
3. 성공해야 하는 테스트 3개
4. 실패해야 하는 테스트 3개
5. 주의할 점
```

---

## 11.5 RLS SQL 생성 `🤖 바이브코딩`

자연어 정책이 맞으면 SQL을 생성한다.

RLS SQL은 권한 시나리오를 실제 데이터베이스 규칙으로 바꾸는 단계다. `USING`은 기존 행을 읽거나 수정/삭제할 수 있는 조건이고, `WITH CHECK`는 새로 넣거나 수정한 결과가 허용되는지 검사하는 조건이다. 특히 INSERT와 UPDATE에서 `WITH CHECK`가 빠지면 다른 사람의 `user_id`로 저장하는 문제가 생길 수 있다.

- `USING`: 기존 행에 접근할 수 있는지 검사
- `WITH CHECK`: 새로 생성되거나 변경된 결과 행이 허용되는지 검사

```
이제 posts 테이블 RLS SQL을 만들어줘.

요구사항:
- ALTER TABLE posts ENABLE ROW LEVEL SECURITY 포함
- SELECT/INSERT/UPDATE/DELETE 정책을 각각 별도로 생성
- auth.uid() 사용
- INSERT에는 WITH CHECK 사용
- UPDATE에는 USING과 WITH CHECK 둘 다 사용
- DELETE에는 USING 사용
- 정책 이름은 읽기 쉽게 작성
- 기존 정책이 중복 생성되지 않도록 주의 문구 포함

아직 실행하지 않고, 마이그레이션 파일에 붙여넣을 SQL만 보여줘.
```

SQL을 만든 뒤 Copilot에게 정책 조건을 다시 검토시킨다.

```
방금 만든 RLS SQL을 검토해줘.

반드시 확인할 것:
1. alter table posts enable row level security가 있는가?
2. SELECT 정책은 누구나 읽기 using (true)인가?
3. INSERT 정책은 with check (auth.uid() = user_id)를 사용하는가?
4. UPDATE 정책은 using과 with check 둘 다 auth.uid() = user_id인가?
5. DELETE 정책은 using (auth.uid() = user_id)인가?
6. 정책 이름이 중복될 가능성이 있으면 알려주는가?

문제가 있으면 SQL을 바로 수정해서 다시 제시해줘.
```

> 정책 이름은 달라도 된다. 중요한 것은 작업별 정책과 조건이다.
> 

---

## 11.6 마이그레이션으로 적용 `⌨️ CLI`

SQL Editor에 바로 실행하지 않는다. Ch8에서 배운 방식대로 마이그레이션 파일을 만든다.

마이그레이션은 데이터베이스 변경 이력을 파일로 남기는 방식이다. 대시보드 SQL Editor에서 바로 실행하면 나중에 어떤 정책을 언제 적용했는지 추적하기 어렵다. 수업에서는 Ch8에서 설치한 Supabase CLI를 계속 사용해, 보안 정책도 코드처럼 기록하고 재현할 수 있게 한다.

```bash
npx supabase migration new add_posts_rls
```

생성된 파일:

```
supabase/migrations/<timestamp>_add_posts_rls.sql
```

이 파일에 Copilot이 만든 SQL을 붙여 넣고 저장한다. 그 다음 원격 Supabase 프로젝트에 적용한다.

```bash
npx supabase db push
```

성공 후 Supabase 대시보드에서 확인할 수 있다.

```
Authentication → Policies
또는 Table Editor → posts → RLS/Policies
```

> 메뉴명은 2026년 5월 Supabase 대시보드 기준이다. 실제 적용 기준은 마이그레이션 파일이다.
> 

---

## 11.7 우회 테스트 `🖱️ 브라우저`

RLS는 “성공해야 하는 것”보다 “실패해야 하는 것”을 확인하는 장이다.

| 번호 | 시나리오 | 기대 결과 |
| --- | --- | --- |
| ① | 비로그인 사용자가 `/posts` 조회 | 성공 |
| ② | 비로그인 사용자가 `/posts/new` 접근 | 로그인 페이지 이동 |
| ③ | 사용자 A가 글 작성 | 성공 |
| ④ | 사용자 A가 본인 글 수정 | 성공 |
| ⑤ | 사용자 B가 사용자 A의 글 수정 | 실패 |
| ⑥ | 사용자 B가 사용자 A의 글 삭제 | 실패 |

테스트 방법:

1. 일반 브라우저에서 사용자 A 로그인
2. 시크릿 창에서 사용자 B 로그인
3. A가 만든 글을 B가 수정/삭제하려고 시도
4. 실패해야 정상

---

## 11.8 검증 `⌨️ 터미널 + 문서`

RLS 적용 후에는 빌드, 민감 키 노출, 마이그레이션 파일 포함 여부, 브라우저 우회 테스트 결과를 함께 확인한다.

Copilot에게 검증 명령 실행과 결과 판정을 요청한다.

```
Ch11 RLS 검증을 해줘.

확인할 것:
1. npm run build가 성공하는지
2. app, lib, components, contexts 안에 service_role, SUPABASE_SERVICE_ROLE, sb_secret_, sbp_ 같은 민감 키가 노출되지 않았는지
3. supabase/migrations/<timestamp>_add_posts_rls.sql 파일이 Git 변경 목록에 포함되는지
4. 브라우저 우회 테스트 결과가 기대와 맞는지

브라우저 테스트 결과:
- 비로그인 조회:
- 비로그인 작성:
- 사용자 A 작성:
- 사용자 B가 A 글 수정:
- 사용자 B가 A 글 삭제:

출력:
1. 실행한 명령
2. 통과/실패/추가 확인 필요 판정
3. 문제가 있으면 수정할 SQL 또는 파일
```

## 흔한 AI 실수

| 실수 | 증상 | 해결 |
| --- | --- | --- |
| 클라이언트 if문으로 보안 처리 | 콘솔/직접 요청으로 우회 가능 | RLS 정책 생성 |
| `WITH CHECK` 누락 | 다른 `user_id`로 INSERT/UPDATE 가능 | INSERT/UPDATE 조건 확인 |
| SQL Editor에만 실행 | Git 이력에 정책이 없음 | CLI 마이그레이션 사용 |
| 정책 중복 생성 | `policy already exists` 에러 | 기존 정책명 확인 후 조정 |
| `service_role` 키 사용 | RLS 우회 | 클라이언트에는 anon 키만 |

위 실수 목록도 Copilot에게 점검시킨다.

```
Ch11 흔한 AI 실수 목록과 Ch9 이후 공통 AI 실수 목록을 기준으로 현재 코드와 마이그레이션을 점검해줘.

점검할 것:
1. 보안을 클라이언트 if문으로만 처리하고 RLS 정책이 빠졌는가?
2. INSERT 정책에 WITH CHECK (auth.uid() = user_id)가 빠졌는가?
3. UPDATE 정책에 USING과 WITH CHECK 중 하나가 빠졌는가?
4. RLS SQL이 supabase/migrations 파일에 남아 있는가?
5. 정책 이름 중복 가능성이 있는가?
6. service_role 키를 클라이언트 코드에서 사용한 곳이 있는가?
7. auth.signIn()을 사용한 곳이 있는가?
8. next/router 또는 pages router를 사용한 곳이 있는가?
9. @supabase/supabase-js에서 직접 createClient를 만들어 브라우저 세션을 처리한 곳이 있는가?
10. onAuthStateChange cleanup에서 subscription.unsubscribe()가 빠진 곳이 있는가?
11. middleware.ts가 프로젝트 루트가 아니라 app/ 안에 있는가?
12. 이메일/비밀번호 외 소셜 로그인 코드가 섞였는가?

문제가 있으면 바로 수정해줘.
SQL 수정이 필요하면 마이그레이션 파일 기준으로 수정안을 제시해줘.
수정 후 어떤 파일과 어떤 항목을 고쳤는지 요약해줘.
```

---

## 과제 제출 항목

```
1. GitHub 저장소 URL
2. Vercel 배포 URL
3. supabase/migrations/<timestamp>_add_posts_rls.sql 파일 경로
4. Supabase Table Editor 또는 Policies 화면에서 posts RLS/Policies가 보이는 스크린샷
5. 사용자 A가 본인 글 수정/삭제 성공한 화면 스크린샷
6. 사용자 B가 사용자 A 글 수정/삭제 실패한 화면 스크린샷
7. npm run build 성공 결과 또는 터미널 캡처
8. 민감 키 grep 결과 캡처
```

### 컨텍스트 업데이트

작업을 마칠 때 Copilot에게 붙여 넣는다.