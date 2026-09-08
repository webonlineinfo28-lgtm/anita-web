import { test, expect } from '@playwright/test';

test.describe('DJ Booth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('should show DJ booth section', async ({ page }) => {
    const testUser = 'DJ_Test';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);
    const djSection = page.locator('text=En Directo');
    await expect(djSection).toBeVisible({ timeout: 5000 });
  });

  test('should show Subir a la cabina button', async ({ page }) => {
    const testUser = 'Waitlist_User';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);
    const boothBtn = page.locator('text=Subir a la cabina');
    await expect(boothBtn).toBeVisible({ timeout: 3000 });
  });

  test('should show song input section', async ({ page }) => {
    const testUser = 'Playlist_User';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);
    const songInput = page.locator('input[placeholder*="YouTube"]');
    await expect(songInput).toBeVisible({ timeout: 3000 });
  });

  test('should display queue section', async ({ page }) => {
    const testUser = 'Queue_User';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);
    const queue = page.locator('text=/Cola|historial/i');
    await expect(queue.first()).toBeVisible({ timeout: 3000 });
  });

  test('should display current song info', async ({ page }) => {
    const testUser = 'Song_User';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);
    const playerArea = page.locator('text=/DJ|Reproducir|Directo/i');
    await expect(playerArea.first()).toBeVisible({ timeout: 3000 });
  });
});
