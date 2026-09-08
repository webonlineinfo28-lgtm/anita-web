import { test, expect } from "@playwright/test";

test.describe("Basic App", () => {
  test("should load the login page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for input field
    const nameInput = page.locator('input[placeholder*="Tu nombre"]');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Check for login button
    const loginBtn = page.locator("text=Entrar al Festival");
    await expect(loginBtn).toBeVisible();
  });

  test("should login and show main app", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "TestUser");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(1000);

    // Should see user name in page
    const userName = page.locator("text=TestUser");
    await expect(userName).toBeVisible({ timeout: 5000 });
  });
});
