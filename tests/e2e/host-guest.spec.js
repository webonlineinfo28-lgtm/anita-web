// Tests e2e: Host-Guest sync (simplified)
import { test, expect } from "@playwright/test";

test.describe("Host-Guest Sync", () => {
  test("user can login with name", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "UserTest");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const userText = page.locator("text=UserTest");
    await expect(userText).toBeVisible({ timeout: 3000 });
  });

  test("user can see DJ booth section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "DJUser");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const djSection = page.locator("text=/cabina|DJ|En Directo/i");
    await expect(djSection.first()).toBeVisible({ timeout: 3000 });
  });

  test("user can see chat section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "ChatUser");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const chatSection = page.locator("text=/Chat/i");
    await expect(chatSection.first()).toBeVisible({ timeout: 3000 });
  });

  test("user can see bingo section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "BingoUser");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const bingoSection = page.locator("text=/Bingo/i");
    await expect(bingoSection.first()).toBeVisible({ timeout: 3000 });
  });
});
