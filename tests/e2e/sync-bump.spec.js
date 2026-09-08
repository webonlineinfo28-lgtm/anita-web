// Tests e2e: Waitlist rotation (simplified)
import { test, expect } from "@playwright/test";

test.describe("DJ Waitlist", () => {
  test("puede ver la lista de espera de DJs", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder(/tu nombre/i).fill("DJWaitlist");
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.waitForTimeout(500);

    // Should see DJ booth section
    const djSection = page.locator("text=/cabina|Cabina|DJ|En Directo/i");
    await expect(djSection.first()).toBeVisible({ timeout: 5000 });
  });

  test("puede ver botón para subir a la cabina", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder(/tu nombre/i).fill("DJSubscribe");
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.waitForTimeout(500);

    // Should see join booth button
    const joinBtn = page.locator("text=/Subir a la cabina|Subir|Up to the booth/i");
    await expect(joinBtn.first()).toBeVisible({ timeout: 3000 });
  });

  test("puede ver cola de reproducción", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder(/tu nombre/i).fill("PlaylistUser");
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.waitForTimeout(500);

    // Should see player/playlist section
    const player = page.locator("text=/Player|Playlist|Reproducción/i");
    await expect(player.first()).toBeVisible({ timeout: 5000 });
  });
});
