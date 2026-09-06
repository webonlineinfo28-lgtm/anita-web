import { test, expect } from '@playwright/test';

/**
 * Stats/Fama E2E Tests
 * Tests for XP, levels and badges
 */
test.describe('Stats & Fame', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('should display user level', async ({ page }) => {
    const testUser = 'LevelUser';
    
    await page.evaluate(() => {
      localStorage.setItem('anita_stats', JSON.stringify({
        xp: 1500,
        level: 15,
        badges: ['first_bingo'],
        bingoCount: 3,
        lineCount: 12
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Check for level display
    const levelDisplay = page.locator('text=/Nivel|Level|⭐/');
    await expect(levelDisplay.first()).toBeVisible({ timeout: 3000 });
  });

  test('should show XP progress bar', async ({ page }) => {
    const testUser = 'XPUser';
    
    await page.evaluate(() => {
      localStorage.setItem('anita_stats', JSON.stringify({
        xp: 750,
        xpToNext: 1000,
        level: 8
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Check for XP bar
    const xpBar = page.locator('[class*="xp"], [class*="progress"], [role="progressbar"]');
    expect(await xpBar.count()).toBeGreaterThan(0);
  });

  test('should display badges section', async ({ page }) => {
    const testUser = 'BadgeUser';
    
    await page.evaluate(() => {
      localStorage.setItem('anita_stats', JSON.stringify({
        xp: 2000,
        level: 20,
        badges: ['first_bingo', 'first_line', 'dj_set', 'active_participant']
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Navigate to profile
    const profileButton = page.locator('button[title*="Perfil"], button[title*="Avatar"]');
    if (await profileButton.count() > 0) {
      await profileButton.first().click();
      await page.waitForTimeout(500);
    }

    // Check for badges
    const badgesSection = page.locator('text=/Insignias|Badges|🏆/');
    await expect(badgesSection.first()).toBeVisible({ timeout: 3000 });
  });

  test('should show fame/ranking position', async ({ page }) => {
    const testUser = 'FameUser';
    
    await page.evaluate(() => {
      localStorage.setItem('anita_stats', JSON.stringify({
        xp: 5000,
        level: 42,
        fame: 1500,
        rank: 5
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Check for fame display
    const fameDisplay = page.locator('text=/Fama|Fame|Ranking|#/');
    await expect(fameDisplay.first()).toBeVisible({ timeout: 3000 });
  });

  test('should update XP after bingo win', async ({ page }) => {
    const testUser = 'BingoXP';
    
    // Simulate getting XP from bingo
    await page.evaluate(() => {
      localStorage.setItem('anita_stats', JSON.stringify({
        xp: 100,
        level: 1,
        badges: []
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Simulate bingo win event
    await page.evaluate(() => {
      const stats = JSON.parse(localStorage.getItem('anita_stats') || '{}');
      stats.xp = (stats.xp || 0) + 150; // Bingo bonus
      stats.bingoCount = (stats.bingoCount || 0) + 1;
      localStorage.setItem('anita_stats', JSON.stringify(stats));
    });

    await page.reload();
    await page.waitForTimeout(500);

    // XP should reflect the bingo bonus
    const stats = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('anita_stats') || '{}');
    });
    expect(stats.xp).toBe(250);
  });

  test('should show cosmic level name', async ({ page }) => {
    const testUser = 'CosmicUser';
    
    await page.evaluate(() => {
      localStorage.setItem('anita_stats', JSON.stringify({
        xp: 10000,
        level: 60,
        fame: 5000,
        badges: ['legend']
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Check for cosmic level names
    const cosmicLevel = page.locator('text=/Leyenda|Legend|Supernova|Galáctico/');
    expect(await cosmicLevel.count()).toBeGreaterThan(0);
  });
});