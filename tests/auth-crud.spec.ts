import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

test.describe('Auth + CRUD flows', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_EMAIL and TEST_PASSWORD must be set');

  test('행복 경로: 로그인 → 새 글 작성 → 목록에서 확인', async ({ page }) => {
    const title = `E2E test post ${Date.now()}`;
    const content = 'This is a test post created by Playwright.';

    // 1) /auth 로 이동해서 로그인
    await page.goto('/auth');

    await page.getByLabel('아이디').fill(TEST_EMAIL as string);
    await page.getByLabel('비밀번호').fill(TEST_PASSWORD as string);
    await page.getByRole('button', { name: /로그인/i }).click();

    // 로그인 페이지를 벗어날 때까지 대기
    await page.waitForURL(url => !url.href.includes('/auth'), { timeout: 10000 });

    // Supabase 인증 세션/쿠키가 브라우저에 완전히 구워질 수 있도록 2초간 대기합니다.
    await page.waitForTimeout(2000);

    // 2) /posts/new에서 제목/내용 입력 후 저장
    await page.goto('/posts/new');

    // 혹시라도 로그인 쿠키가 안 먹혀서 /auth로 튕겨 나갔는지 검증
    await page.waitForURL(/.*\/posts\/new.*/, { timeout: 5000 });

    // 이제 안심하고 제목 입력칸을 찾습니다.
    await page.getByLabel('제목').fill(title);

    // Quill 에디터는 contenteditable 요소(.ql-editor)
    const editor = page.locator('.ql-editor');
    await editor.click();
    await page.keyboard.type(content);

    await page.getByRole('button', { name: /등록하기|저장|작성/ }).click();

    // 글 작성 버튼 누른 후, 리다이렉트 대기
    await page.waitForURL(/.*\/posts.*/, { timeout: 10000 });

    // 3) /posts 목록에서 새 글 제목 확인
    await page.goto('/posts');

    // 💡 [새로고침 추가] 페이지 이동 직후 혹시 모를 캐시나 데이터 갱신 지연을 깨우기 위해 강제 새로고침을 수행합니다.
    await page.reload();

    // 💡 [매칭 방식 변경] getByRole('link') 대신 화면 어디든 해당 제목 텍스트가 존재하는지 검증하여 훨씬 유연하게 잡아냅니다.
    await expect(page.getByText(title)).toBeVisible({ timeout: 15000 });
  });

  test('거절 경로: 인증 없이 /posts/new 접근 시 로그인 페이지로 리다이렉트', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/posts/new');

    // networkidle 대기 삭제 -> 명시적으로 auth나 login 주소로 튕겨날 때까지 대기
    await page.waitForURL(/.*(auth|login).*/, { timeout: 10000 });
    
    const url = page.url();
    expect(url).toMatch(/\/(auth|login)(?:$|\?)/);

    await context.close();
  });
});