import { test, expect } from "@playwright/test";

test.describe("랜딩 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("페이지가 정상적으로 로드됨", async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/펫체키/);
  });

  test("메인 콘텐츠가 표시됨", async ({ page }) => {
    // 스킵 네비게이션 링크 확인 (접근성)
    const skipLink = page.getByRole("link", { name: /본문으로 건너뛰기|메인 콘텐츠로 이동/ });
    await expect(skipLink).toBeAttached();

    // 로고 또는 앱 이름 확인
    await expect(page.getByText(/펫체키|PetChecky/i)).toBeVisible();
  });

  test("로그인 버튼이 표시됨", async ({ page }) => {
    // 로그인 관련 버튼 찾기
    const loginButton = page.getByRole("button", { name: /로그인|시작하기/ });
    await expect(loginButton).toBeVisible();
  });

  test("반려동물 등록 버튼이 동작함", async ({ page }) => {
    // 등록 버튼 클릭
    const registerButton = page.getByRole("button", { name: /등록|시작/ });

    if (await registerButton.isVisible()) {
      await registerButton.click();

      // 모달 또는 폼이 나타나는지 확인
      const modal = page.getByRole("dialog");
      const form = page.getByRole("form");

      const hasModalOrForm = await modal.isVisible().catch(() => false) ||
                             await form.isVisible().catch(() => false);

      expect(hasModalOrForm).toBeTruthy();
    }
  });
});

test.describe("접근성 테스트", () => {
  test("스킵 네비게이션이 동작함", async ({ page }) => {
    await page.goto("/");

    // Tab 키로 스킵 링크에 포커스
    await page.keyboard.press("Tab");

    const skipLink = page.locator("[href='#main-content']");
    if (await skipLink.isVisible().catch(() => false)) {
      // Enter 키로 스킵 링크 활성화
      await page.keyboard.press("Enter");

      // 메인 콘텐츠로 이동했는지 확인
      const mainContent = page.locator("#main-content");
      if (await mainContent.isVisible().catch(() => false)) {
        await expect(mainContent).toBeFocused();
      }
    }
  });

  test("모든 이미지에 alt 텍스트가 있음", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const ariaLabel = await img.getAttribute("aria-label");
      const ariaHidden = await img.getAttribute("aria-hidden");

      // 장식용 이미지가 아니면 alt 또는 aria-label이 있어야 함
      if (ariaHidden !== "true") {
        expect(alt !== null || ariaLabel !== null).toBeTruthy();
      }
    }
  });

  test("버튼에 접근 가능한 이름이 있음", async ({ page }) => {
    await page.goto("/");

    const buttons = page.getByRole("button");
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute("aria-label") ||
                   await button.textContent();

      expect(name?.trim().length).toBeGreaterThan(0);
    }
  });
});
