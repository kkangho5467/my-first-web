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

    // 💡 [수정됨] 하드코딩된 아이디/비번 대신 GitHub Secrets에서 가져온 변수 사용
    await page.getByLabel('아이디').fill(TEST_EMAIL as string);
    await page.getByLabel('비밀번호').fill(TEST_PASSWORD as string);
    await page.getByRole('button', { name: /로그인/i }).click();

    // 💡 [수정됨] networkidle 대기 삭제 -> URL이 /auth에서 다른 곳으로 넘어갈 때까지 대기
    await page.waitForURL(url => !url.href.includes('/auth'), { timeout: 10000 });

    // 2) /posts/new에서 제목/내용 입력 후 저장
    await page.goto('/posts/new');

    await page.getByLabel('제목').fill(title);

    // Quill 에디터는 contenteditable 요소(.ql-editor)
    const editor = page.locator('.ql-editor');
    await editor.click();
    await page.keyboard.type(content);

    await page.getByRole('button', { name: /등록하기|저장|작성/ }).click();

    // 💡 [수정됨] 글 작성 버튼 누른 후, 서버 통신을 기다려주기 위해 대기
    await page.waitForURL(/.*\/posts.*/, { timeout: 10000 });

    // 3) /posts 목록에서 새 글 제목 확인
    await page.goto('/posts');

    // 💡 [수정됨] 깃허브 컴퓨터가 느릴 수 있으므로 최대 15초 동안 넉넉하게 기다려줌
    await expect(page.getByRole('link', { name: title })).toBeVisible({ timeout: 15000 });
  });

  test('거절 경로: 인증 없이 /posts/new 접근 시 로그인 페이지로 리다이렉트', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/posts/new');

    // 💡 [수정됨] networkidle 대기 삭제 -> 명시적으로 auth나 login 주소로 튕겨날 때까지 대기
    await page.waitForURL(/.*(auth|login).*/, { timeout: 10000 });
    
    const url = page.url();
    expect(url).toMatch(/\/(auth|login)(?:$|\?)/);

    await context.close();
  });
});