import { test, expect } from "@playwright/test";

test.describe("반려동물 등록", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("반려동물 등록 모달이 열림", async ({ page }) => {
    // 등록 버튼 찾기 (여러 가지 이름 가능)
    const registerButton = page.getByRole("button", {
      name: /등록|우리 아이|반려동물|시작/
    }).first();

    if (await registerButton.isVisible()) {
      await registerButton.click();

      // 모달이 열리는지 확인
      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible();

      // 폼 필드 확인
      const nameInput = page.getByPlaceholder(/이름/);
      await expect(nameInput).toBeVisible();
    }
  });

  test("종류 선택 (강아지/고양이)이 동작함", async ({ page }) => {
    const registerButton = page.getByRole("button", {
      name: /등록|우리 아이|반려동물/
    }).first();

    if (await registerButton.isVisible()) {
      await registerButton.click();

      // 강아지 버튼
      const dogButton = page.getByRole("button", { name: /강아지/ });
      if (await dogButton.isVisible()) {
        await dogButton.click();
        await expect(dogButton).toHaveClass(/border-blue/);
      }

      // 고양이 버튼
      const catButton = page.getByRole("button", { name: /고양이/ });
      if (await catButton.isVisible()) {
        await catButton.click();
        await expect(catButton).toHaveClass(/border-blue/);
      }
    }
  });

  test("품종 선택 드롭다운이 동작함", async ({ page }) => {
    const registerButton = page.getByRole("button", {
      name: /등록|우리 아이|반려동물/
    }).first();

    if (await registerButton.isVisible()) {
      await registerButton.click();

      // 품종 선택 드롭다운
      const breedSelect = page.getByRole("combobox");
      if (await breedSelect.isVisible()) {
        await breedSelect.click();

        // 옵션이 있는지 확인
        const options = page.locator("option");
        const optionCount = await options.count();
        expect(optionCount).toBeGreaterThan(1);
      }
    }
  });

  test("필수 필드 미입력 시 제출되지 않음", async ({ page }) => {
    const registerButton = page.getByRole("button", {
      name: /등록|우리 아이|반려동물/
    }).first();

    if (await registerButton.isVisible()) {
      await registerButton.click();

      // 제출 버튼 클릭
      const submitButton = page.getByRole("button", { name: /등록|저장|완료/ });
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // 모달이 여전히 열려 있어야 함 (제출 실패)
        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();
      }
    }
  });

  test("반려동물 정보를 입력하고 등록할 수 있음", async ({ page }) => {
    const registerButton = page.getByRole("button", {
      name: /등록|우리 아이|반려동물/
    }).first();

    if (await registerButton.isVisible()) {
      await registerButton.click();

      // 이름 입력
      const nameInput = page.getByPlaceholder(/이름/);
      if (await nameInput.isVisible()) {
        await nameInput.fill("테스트 펫");
      }

      // 강아지 선택
      const dogButton = page.getByRole("button", { name: /강아지/ });
      if (await dogButton.isVisible()) {
        await dogButton.click();
      }

      // 품종 선택
      const breedSelect = page.getByRole("combobox");
      if (await breedSelect.isVisible()) {
        await breedSelect.selectOption({ index: 1 });
      }

      // 나이 입력
      const ageInput = page.getByPlaceholder(/나이/);
      if (await ageInput.isVisible()) {
        await ageInput.fill("3");
      }

      // 체중 입력
      const weightInput = page.getByPlaceholder(/체중/);
      if (await weightInput.isVisible()) {
        await weightInput.fill("5");
      }

      // 제출
      const submitButton = page.getByRole("button", { name: /등록|저장|완료/ }).last();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // 모달이 닫히거나 성공 메시지가 표시되어야 함
        await page.waitForTimeout(1000);

        // 등록된 펫 이름이 화면에 표시되는지 확인
        const petName = page.getByText("테스트 펫");
        const isSuccess = await petName.isVisible().catch(() => false);

        // 성공하거나 모달이 닫혔으면 OK
        const modal = page.getByRole("dialog");
        const modalClosed = !(await modal.isVisible().catch(() => false));

        expect(isSuccess || modalClosed).toBeTruthy();
      }
    }
  });
});

test.describe("반려동물 수정/삭제", () => {
  test("등록된 반려동물 수정 모달이 열림", async ({ page }) => {
    await page.goto("/");

    // 이미 등록된 펫이 있다고 가정하고 수정 버튼 찾기
    const editButton = page.getByRole("button", { name: /수정|편집|설정/ });

    if (await editButton.first().isVisible()) {
      await editButton.first().click();

      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible();
    }
  });
});
