import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

test.describe('Auth + CRUD flows', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_EMAIL and TEST_PASSWORD must be set');

  test('행복 경로: 로그인 → 새 글 작성 → 목록에서 확인', async ({ page, browser }) => {
    const title = `E2E test post ${Date.now()}`;
    const content = 'This is a test post created by Playwright.';

    // 1) /login에서 로그인 — App에서 /auth 라우트를 사용하는 경우가 있어 /login 대신 /auth로 이동
    await page.goto('/auth');

    // 입력 필드: 레이블 우선 사용
    await page.getByLabel('아이디').fill(TEST_EMAIL);
    await page.getByLabel('비밀번호').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /로그인/i }).click();

    // 로그인 후 리다이렉트/상태 반영 대기
    await page.waitForLoadState('networkidle');

    // 2) /posts/new에서 제목/내용 입력 후 저장
    await page.goto('/posts/new');

    await page.getByLabel('제목').fill(title);

    // Quill 에디터는 contenteditable 요소(.ql-editor)
    const editor = page.locator('.ql-editor');
    await editor.click();
    await page.keyboard.type(content);

    await page.getByRole('button', { name: /등록하기|저장|작성/ }).click();

    // 3) /posts 목록에서 새 글 제목 확인
    await page.goto('/posts');

    // 제목이 링크 또는 텍스트로 렌더될 것을 기대
    await expect(page.getByRole('link', { name: title })).toBeVisible();
  });

  test('거절 경로: 인증 없이 /posts/new 접근 시 로그인 페이지로 리다이렉트', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/posts/new');

    // 인증이 필요한 경우 /auth 또는 /login으로 리다이렉트되는지 확인
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toMatch(/\/(auth|login)(?:$|\?)/);

    await context.close();
  });
});
