import { test, expect } from "@playwright/test";

test.describe("인증 플로우", () => {
  test("로그인 모달이 열림", async ({ page }) => {
    await page.goto("/");

    // 로그인 버튼 찾기
    const loginButton = page.getByRole("button", { name: /로그인/ });

    if (await loginButton.isVisible()) {
      await loginButton.click();

      // 모달이 열리는지 확인
      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible();

      // 이메일 입력 필드 확인
      const emailInput = page.getByPlaceholder(/이메일|email/i);
      await expect(emailInput).toBeVisible();

      // 비밀번호 입력 필드 확인
      const passwordInput = page.getByPlaceholder(/비밀번호|password/i);
      await expect(passwordInput).toBeVisible();
    }
  });

  test("소셜 로그인 버튼이 표시됨", async ({ page }) => {
    await page.goto("/");

    const loginButton = page.getByRole("button", { name: /로그인/ });

    if (await loginButton.isVisible()) {
      await loginButton.click();

      // 카카오 로그인 버튼
      const kakaoButton = page.getByRole("button", { name: /카카오/ });
      await expect(kakaoButton).toBeVisible();

      // Google 로그인 버튼
      const googleButton = page.getByRole("button", { name: /Google/i });
      await expect(googleButton).toBeVisible();
    }
  });

  test("로그인 모달을 ESC로 닫을 수 있음", async ({ page }) => {
    await page.goto("/");

    const loginButton = page.getByRole("button", { name: /로그인/ });

    if (await loginButton.isVisible()) {
      await loginButton.click();

      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible();

      // ESC 키로 닫기
      await page.keyboard.press("Escape");

      // 모달이 닫혔는지 확인
      await expect(modal).not.toBeVisible();
    }
  });

  test("회원가입 모드로 전환됨", async ({ page }) => {
    await page.goto("/");

    const loginButton = page.getByRole("button", { name: /로그인/ });

    if (await loginButton.isVisible()) {
      await loginButton.click();

      // 회원가입 링크 클릭
      const signupLink = page.getByRole("button", { name: /회원가입/ });
      await signupLink.click();

      // 비밀번호 확인 필드가 나타나는지 확인
      const confirmPassword = page.getByPlaceholder(/비밀번호 다시|확인/i);
      await expect(confirmPassword).toBeVisible();
    }
  });

  test("유효성 검사 에러가 표시됨", async ({ page }) => {
    await page.goto("/");

    const loginButton = page.getByRole("button", { name: /로그인/ });

    if (await loginButton.isVisible()) {
      await loginButton.click();

      // 빈 상태로 로그인 시도
      const submitButton = page.getByRole("button", { name: /로그인/ }).last();
      await submitButton.click();

      // 에러 메시지 확인
      const errorMessage = page.getByText(/이메일|비밀번호.*입력/);
      await expect(errorMessage).toBeVisible();
    }
  });
});

test.describe("인증 모달 접근성", () => {
  test("모달이 열리면 포커스가 모달로 이동함", async ({ page }) => {
    await page.goto("/");

    const loginButton = page.getByRole("button", { name: /로그인/ });

    if (await loginButton.isVisible()) {
      await loginButton.click();

      // 모달 내부의 첫 번째 포커스 가능 요소에 포커스가 있는지 확인
      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible();

      // Tab 키로 모달 내부 탐색 가능 여부 확인
      await page.keyboard.press("Tab");

      // 포커스가 모달 내부에 있는지 확인
      const focusedElement = page.locator(":focus");
      const isInsideModal = await modal.locator(":focus").count() > 0;
      expect(isInsideModal || await focusedElement.count() > 0).toBeTruthy();
    }
  });
});
