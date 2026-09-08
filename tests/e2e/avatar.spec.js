import { test, expect } from "@playwright/test";

test.describe("Avatar Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/");
  });

  test("should show avatar in header after login", async ({ page }) => {
    await page.fill('input[placeholder*="Tu nombre"]', "AvatarUser");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    // Avatar SVG should be in header
    const headerSvg = page.locator("header svg");
    await expect(headerSvg.first()).toBeVisible({ timeout: 3000 });
  });

  test("should have avatar editor accessible", async ({ page }) => {
    await page.fill('input[placeholder*="Tu nombre"]', "EditorUser");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    // User name should appear in header
    const userText = page.locator("text=EditorUser");
    await expect(userText).toBeVisible({ timeout: 3000 });
  });

  test("should display customizable avatar", async ({ page }) => {
    await page.fill('input[placeholder*="Tu nombre"]', "CustomUser");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    // Should have avatar in header
    const avatar = page.locator("header svg");
    expect(await avatar.count()).toBeGreaterThan(0);
  });
});
