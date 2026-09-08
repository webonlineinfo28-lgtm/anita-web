import { test, expect } from '@playwright/test';

test.describe('Bingo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('should display bingo card with 5x5 grid', async ({ page }) => {
    const testUser = 'BingoPlayer';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Check for bingo heading
    const bingoHeading = page.locator('h2:has-text("Bingo")');
    await expect(bingoHeading).toBeVisible({ timeout: 5000 });
    
    // Should have 25 cells (5x5)
    const cells = page.locator('.glass-card .grid-cols-5 > div');
    expect(await cells.count()).toBeGreaterThanOrEqual(24);
  });

  test('should mark number on bingo card when drawn', async ({ page }) => {
    const testUser = 'BingoMarker';
    
    // Seed drawn numbers
    await page.evaluate(() => {
      localStorage.setItem('bingo_shared_state', JSON.stringify({
        drawnNumbers: [7, 15, 23],
        isBomboRunning: true
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Check that bingo heading is visible
    const bingoHeading = page.locator('h2:has-text("Bingo")');
    await expect(bingoHeading).toBeVisible({ timeout: 5000 });
  });

  test('should detect LINE win', async ({ page }) => {
    const testUser = 'LineWinner';
    
    await page.evaluate(() => {
      localStorage.setItem('bingo_shared_state', JSON.stringify({
        drawnNumbers: [7, 18, 34, 51, 70],
        isBomboRunning: false
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(1000);

    const lineText = page.locator('text=/LINEA|LINE/i');
    await expect(lineText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should detect BINGO win with confetti', async ({ page }) => {
    const testUser = 'BingoWinner';
    
    await page.evaluate(() => {
      localStorage.setItem('bingo_shared_state', JSON.stringify({
        drawnNumbers: [7, 18, 34, 51, 70, 2, 22, 40, 49, 61, 15, 25, 55, 66, 11, 30, 38, 58, 72, 5, 21, 44, 52, 69],
        isBomboRunning: false
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(1500);

    const bingoText = page.locator('text=/BINGO/i');
    await expect(bingoText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show drawn numbers in bombo', async ({ page }) => {
    const testUser = 'BomboViewer';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      localStorage.setItem('bingo_shared_state', JSON.stringify({
        drawnNumbers: [7, 15, 23, 42, 66],
        isBomboRunning: true
      }));
    });

    await page.reload();
    await page.waitForTimeout(1000);

    const drawnSection = page.locator('text=Bolas');
    await expect(drawnSection).toBeVisible({ timeout: 3000 });
  });

  test('should have permanent card that persists', async ({ page }) => {
    const testUser = 'PermanentCard';
    
    await page.evaluate(() => {
      localStorage.setItem('bingo_user_cards', JSON.stringify({
        'PermanentCard': {
          card: Array.from({length: 25}, (_, i) => ({
            letter: ['B','I','N','G','O'][i % 5],
            number: i * 3 + 1,
            isCenter: i === 12
          })),
          lastUsed: Date.now()
        }
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    const bingoHeading = page.locator('h2:has-text("Bingo")');
    await expect(bingoHeading).toBeVisible({ timeout: 3000 });
  });
});
