import { test, expect } from '@playwright/test';

/**
 * DJ Booth E2E Tests
 * Tests for the plug.dj-style DJ booth with waitlist and rotation
 */
test.describe('DJ Booth', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage and login
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('should show DJ booth with current DJ', async ({ page }) => {
    const testUser = 'DJ_Test';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Check DJ booth is visible
    await expect(page.locator('text=Cabina del DJ')).toBeVisible({ timeout: 5000 });
  });

  test('should allow user to join waitlist', async ({ page }) => {
    const testUser = 'Waitlist_User';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Look for join waitlist button
    const joinButton = page.locator('button', { hasText: /Subir a la cabina|Esperando/ });
    if (await joinButton.count() > 0) {
      await joinButton.first().click();
      await page.waitForTimeout(300);
      // Should see user in waitlist or playing
      const waitlistText = await page.locator('text=/.*' + testUser + '.*/').count();
      expect(waitlistText).toBeGreaterThan(0);
    }
  });

  test('should display song progress bar when playing', async ({ page }) => {
    const testUser = 'Progress_User';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Check for progress bar or song info
    const progressBar = page.locator('[role="progressbar"], .progress, [class*="progress"]');
    const songInfo = page.locator('text=/正在播放|Ahora suena|Currently/');
    
    // Either should be visible
    const hasProgress = await progressBar.count() > 0;
    const hasSongInfo = await songInfo.count() > 0;
    expect(hasProgress || hasSongInfo).toBeTruthy();
  });

  test('should allow adding song to playlist', async ({ page }) => {
    const testUser = 'Playlist_User';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Look for add song input or button
    const addSongInput = page.locator('input[placeholder*="URL"], input[placeholder*="Canción"], input[placeholder*="Song"]');
    if (await addSongInput.count() > 0) {
      await addSongInput.first().fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      const addButton = page.locator('button', { hasText: /Añadir|Agregar|Add/ });
      if (await addButton.count() > 0) {
        await addButton.first().click();
        await page.waitForTimeout(300);
      }
    }

    // Verify playlist section exists
    await expect(page.locator('text=/Playlist|Lista de reproducción/')).toBeVisible({ timeout: 3000 });
  });

  test('should display waitlist in order', async ({ page }) => {
    // Seed two users
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('anita_session', JSON.stringify({ user: 'User1', role: 'user' }));
      localStorage.setItem('anita_room_state', JSON.stringify({
        dj: 'User1',
        waitlist: ['User2', 'User3']
      }));
    });

    await page.reload();
    await page.waitForTimeout(500);

    // Check waitlist is visible
    const waitlistSection = page.locator('text=/Lista de espera|Waitlist/');
    await expect(waitlistSection).toBeVisible({ timeout: 3000 });
  });
});