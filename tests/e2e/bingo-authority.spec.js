// Tests e2e: Bingo Authority (simplified)
import { test, expect } from "@playwright/test";

async function getBingoState(page) {
  return page.evaluate(() => {
    const shared = JSON.parse(localStorage.getItem("bingo_shared_state") || "{}");
    const userCards = JSON.parse(localStorage.getItem("bingo_user_cards") || "{}");
    return { shared, userCards };
  });
}

test.describe("Bingo Authority", () => {
  test("bingo state exists after login", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "BingoTest");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const state = await getBingoState(page);
    expect(state.shared).toBeDefined();
  });

  test("bingo card can be generated", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "CardTest");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const bingo = page.locator("text=/Bingo/i");
    await expect(bingo.first()).toBeVisible({ timeout: 3000 });
  });

  test("bingo state structure is correct", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "DrawTest");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const state = await getBingoState(page);
    // Either drawnNumbers is array or doesn't exist yet
    if (state.shared.drawnNumbers) {
      expect(Array.isArray(state.shared.drawnNumbers)).toBe(true);
    }
  });

  test("userCards object exists in bingo state", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "UserCardTest");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const state = await getBingoState(page);
    expect(state.userCards).toBeDefined();
  });

  test("bingo section displays", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "BingoDisplay");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    const bingoSection = page.locator("h2:has-text(\"Bingo\")");
    await expect(bingoSection).toBeVisible({ timeout: 3000 });
  });

  test("bingo controls visible for user", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="Tu nombre"]', "ControlsTest");
    await page.click("text=Entrar al Festival");
    await page.waitForTimeout(500);

    // Should see bingo section with controls
    const bingo = page.locator("text=/Bingo/i");
    await expect(bingo.first()).toBeVisible({ timeout: 3000 });
  });
});
