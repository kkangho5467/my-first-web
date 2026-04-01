# A회차: 강의

> **미션**: 수업이 끝나면 Next.js 기본 페이지가 인터넷에 올라간다
> 

---

## 학습목표

1. 웹이 동작하는 기본 구조(클라이언트-서버, HTTP)를 설명할 수 있다
2. Node.js, VS Code, Git을 설치하고 개발 환경을 구성할 수 있다
3. create-next-app으로 프로젝트를 생성하고 개발 서버를 실행할 수 있다
4. GitHub 저장소를 만들어 코드를 올리고, Vercel로 배포할 수 있다

---

## 1.1 웹이 동작하는 방식

### 클라이언트-서버 아키텍처

웹은 **클라이언트**(브라우저)와 **서버** 두 역할로 나뉜다. 브라우저가 요청하면 서버가 HTML, CSS, JS 파일을 보내주고, 브라우저가 화면을 그린다.

```
[브라우저] ---요청(Request)---> [서버]
[브라우저] <--응답(Response)--- [서버]
```

이 수업에서는 Next.js로 웹 앱을 만들고, **Vercel**이 서버 역할을 대신한다.

### HTTP 상태 코드

| 코드 | 의미 | 쉽게 말하면 |
| --- | --- | --- |
| 200 | OK | 정상 응답 |
| 301 | Moved Permanently | 주소가 바뀌었다 |
| 404 | Not Found | 페이지를 찾을 수 없다 |
| 500 | Internal Server Error | 서버에 문제가 생겼다 |

### 브라우저 렌더링 과정

1. **HTML 파싱** → DOM 트리 생성
2. **CSS 파싱** → 스타일 정보 정리
3. **렌더링** → DOM + CSS를 합쳐 화면에 그림
4. **JavaScript 실행** → DOM을 조작하여 동적 변경

> 지금은 이 흐름의 존재를 아는 것으로 충분하다. 3장(HTML)과 4장(JavaScript)에서 실습한다.
> 

---

## 1.2 개발 환경 설정

macOS 기준으로 안내한다.

### 1.2.1 Node.js

**Node.js**는 JavaScript를 브라우저 밖에서 실행하는 런타임이다.

1. [nodejs.org](http://nodejs.org) → **LTS** 버전 다운로드 → 설치
2. 확인:

```bash
node --version   # v20.x.x 또는 v22.x.x
npm --version    # npm은 Node.js와 함께 설치됨
```

> 터미널 여는 방법: Spotlight(`Cmd + Space`) → "Terminal" 검색
> 

### 1.2.2 VS Code

1. [code.visualstudio.com](http://code.visualstudio.com) → 다운로드 → 설치
2. 필수 확장 설치:

| 확장명 | 용도 |
| --- | --- |
| Korean Language Pack | VS Code 한국어 지원 |
| Prettier - Code formatter | 코드 자동 정렬 |
| ES7+ React/Redux/React-Native snippets | React 코드 자동완성 |

> Copilot과 Tailwind CSS IntelliSense는 Ch2에서 설치한다.
> 

### 1.2.3 Git + GitHub

**Git** 설치:

```bash
git --version   # Xcode Command Line Tools 설치 안내가 나오면 따른다
```

**GitHub** 계정:

1. [github.com](http://github.com) → 회원가입
2. 학교 이메일(.[ac.kr](http://ac.kr))로 가입하면 Education 혜택(Copilot 무료)을 받을 수 있다

**Git 초기 설정**:

```bash
git config --global user.name "본인 이름"
git config --global user.email "본인@이메일.com"
```

### 1.2.4 터미널 기본 명령어

| 명령어 | 기능 | 예시 |
| --- | --- | --- |
| `cd 폴더명` | 폴더 이동 | `cd my-project` |
| `cd ..` | 상위 폴더로 이동 | `cd ..` |
| `ls` | 현재 폴더 파일 목록 | `ls` |
| `mkdir 폴더명` | 새 폴더 생성 | `mkdir projects` |
| `pwd` | 현재 위치 확인 | `pwd` |

---

## 1.3 Next.js 프로젝트 생성

**Next.js**는 React 기반 웹 프레임워크로, 페이지 라우팅, 서버 렌더링, 배포 최적화를 제공한다.

### 1.3.1 create-next-app 실행

```bash
npx create-next-app@latest my-first-web
```

질문이 나오면 **Yes (recommended defaults)** 를 선택한다:

```
? Would you like to use the recommended Next.js defaults?
>   Yes, use recommended defaults - TypeScript, ESLint, Tailwind CSS, App Router, AGENTS.md
```

프로젝트 폴더로 이동:

```bash
cd my-first-web
```

**버전 확인** — Ch2에서 [copilot-instructions.md](http://copilot-instructions.md)에 기록할 버전이다:

```bash
node -e "const p = require('./package.json'); console.log('next:', p.dependencies.next)"
```

### 1.3.2 프로젝트 구조

```bash
code .
```

> `code .`이 안 되면: VS Code → `Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH"
> 

| 파일/폴더 | 역할 |
| --- | --- |
| `app/` | 페이지가 들어가는 폴더 (핵심) |
| `app/page.tsx` | 메인 페이지 (`/` 경로) — **Ch2에서 수정** |
| `app/layout.tsx` | 모든 페이지에 공통 적용되는 레이아웃 |
| `app/globals.css` | 전역 스타일 (Tailwind 설정 포함) |
| `public/` | 이미지 등 정적 파일 |
| `package.json` | 프로젝트 설정과 의존성 목록 |
| `next.config.ts` | Next.js 설정 파일 |

### 1.3.3 개발 서버 실행

```bash
npm run dev
```

```
▲ Next.js (turbo)
- Local:    http://localhost:3000
```

브라우저에서 http://localhost:3000을 열면 Next.js 기본 페이지가 나타난다.

- `localhost`: 내 컴퓨터 자신
- `3000`: 개발 서버 포트 번호
- **핫 리로드**: `app/page.tsx`를 수정하면 브라우저에 즉시 반영된다

> 개발 서버 종료: `Ctrl + C`
> 

### 1.3.4 DevTools

브라우저에서 `Cmd + Option + I` (또는 `F12`)로 개발자 도구를 연다.

| 탭 | 용도 | 지금 해볼 것 |
| --- | --- | --- |
| Elements | HTML 구조와 CSS 확인 | 텍스트를 클릭해서 HTML 위치 확인 |
| Console | JavaScript 실행, 에러 확인 | `console.log("Hello")` 입력 |
| Network | HTTP 요청/응답 확인 | 새로고침 후 요청 목록 확인 |

---

## 1.4 GitHub에 올리기

### Git 명령어

`create-next-app`은 Git 저장소를 자동 초기화한다. 커밋이 안 되어 있다면:

```bash
git add .
git commit -m "Initial commit: create-next-app"
```

| 명령어 | 의미 | 비유 |
| --- | --- | --- |
| `git add .` | 변경 파일을 준비 상태로 올림 | 택배 상자에 물건 넣기 |
| `git commit -m "메시지"` | 하나의 기록으로 저장 | 택배 상자에 송장 붙이기 |
| `git push` | GitHub에 올림 | 택배 발송 |

### GitHub 저장소 생성

1. [github.com](http://github.com) → `+` → **New repository**
2. Repository name: `my-first-web`, **Public**, 나머지 옵션 모두 해제
3. **Create repository** 클릭 후 안내 명령어 실행:

```bash
git remote add origin https://github.com/본인아이디/my-first-web.git
git branch -M main
git push -u origin main
```

> 인증 오류 시: `gh auth login` 또는 Personal Access Token 사용. 자세한 방법은 부록 A 참고.
> 

---

## 1.5 Vercel 배포

### 가입 및 연동

1. [vercel.com](http://vercel.com) → **Sign Up** → **Continue with GitHub**

### 프로젝트 임포트

1. Vercel 대시보드 → **Add New...** → **Project**
2. `my-first-web` 저장소 → **Import** → **Deploy**
3. 완료 후 Dashboard에서 배포 URL 확인

### 자동 배포

```
코드 수정 → git push → GitHub 업데이트 → Vercel 감지 → 자동 재배포
```

`git push`할 때마다 자동으로 새 버전이 배포된다. 이것이 이 수업의 핵심 흐름이다.

---

## 실습 체크포인트

### 체크포인트 1: 환경 확인

1. `node --version`, `git --version`으로 설치를 확인한다
2. `npm run dev` → [localhost:3000](http://localhost:3000)에서 Next.js 기본 페이지가 보이는지 확인한다

### 체크포인트 2: GitHub + Vercel 배포

1. GitHub 저장소를 생성하고 `git push`한다
2. Vercel에서 프로젝트를 Import하고 Deploy한다
3. 배포 URL에서 기본 페이지가 보이는지 확인한다
4. 모바일에서도 접속해본다

> `app/page.tsx` 수정(블로그 소개 페이지)은 **Ch2에서 Copilot과 함께** 진행한다.
> 

---

## 흔한 실수

| 실수 | 증상 | 해결 |
| --- | --- | --- |
| Node.js 미설치 | `npx: command not found` | Node.js LTS 설치 |
| 프로젝트 폴더 밖에서 `npm run dev` | `Missing script: dev` | `cd my-first-web`으로 이동 |
| `git push` 인증 실패 | `Authentication failed` | `gh auth login` 또는 PAT 발급 |
| Vercel에 저장소가 안 보임 | Import 목록 비어있음 | GitHub 앱 권한 재설정 |

---

## 핵심 정리

1. 웹은 **클라이언트(브라우저)**가 **서버**에 요청을 보내고, 서버가 응답을 돌려보내는 구조이다
2. **create-next-app**으로 프로젝트를 만들고, **npm run dev**로 개발 서버를 실행한다
3. **git push → Vercel 자동 배포** — 이 흐름을 매주 반복한다

---

## 제출 안내 (Google Classroom)

```
① 배포 URL
   예: https://my-first-web-xxxxx.vercel.app
```

> Ch1은 기본 템플릿 배포만 확인한다. 페이지 수정과 AI 로그는 Ch2에서 시작한다.
>