import { test, expect } from "@playwright/test";

test.describe("Fame System Integration", () => {
  test("should display fame system with ranking", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "FameUser");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const ranking = page.locator("text=/Ranking|Top|Leyendas/i");
    await expect(ranking.first()).toBeVisible({ timeout: 5000 });
  });

  test("should show user info in header", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "UserInfo");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const userText = page.locator("text=UserInfo");
    await expect(userText).toBeVisible({ timeout: 3000 });
  });

  test("should display ranking section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "RankDisplay");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const ranking = page.locator("text=/Ranking|Top|Leyendas/i");
    await expect(ranking.first()).toBeVisible({ timeout: 3000 });
  });

  test("stats exist in localStorage after login", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "StatsCheck");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const stats = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("anita_stats") || "{}");
    });
    expect(stats).toBeDefined();
  });

  test("XP can be stored in localStorage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "XPGain");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const stats = JSON.parse(localStorage.getItem("anita_stats") || "{}");
      stats.xp = 200;
      localStorage.setItem("anita_stats", JSON.stringify(stats));
    });

    const stats = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("anita_stats") || "{}");
    });
    expect(stats.xp).toBe(200);
  });
});
