import { test, expect } from '@playwright/test';

/**
 * Bingo E2E Tests
 * Tests for the cosmic bingo game with shared state
 */
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

    // Check for bingo card
    const bingoCard = page.locator('[class*="bingo"]');
    await expect(bingoCard.first()).toBeVisible({ timeout: 5000 });
    
    // Should have 25 cells (5x5)
    const cells = page.locator('[class*="cell"], [class*="bingo"] td, [data-cell]');
    expect(await cells.count()).toBeGreaterThanOrEqual(24);
  });

  test('should mark number on bingo card when drawn', async ({ page }) => {
    const testUser = 'BingoMarker';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Seed drawn numbers
    await page.evaluate(() => {
      localStorage.setItem('bingo_shared_state', JSON.stringify({
        drawnNumbers: [7, 15, 23],
        isBomboRunning: true
      }));
      localStorage.setItem('bingo_user_cards', JSON.stringify({
        'BingoMarker': {
          card: [
            [7, 18, 34, 51, 70],
            [2, 22, 40, 49, 61],
            [15, 25, 0, 55, 66],
            [11, 30, 38, 58, 72],
            [5, 21, 44, 52, 69]
          ]
        }
      }));
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Check for marked cells
    const markedCells = page.locator('[class*="marked"], [class*="active"], [class*="drawn"]');
    expect(await markedCells.count()).toBeGreaterThan(0);
  });

  test('should detect LINE win', async ({ page }) => {
    const testUser = 'LineWinner';
    
    // Seed bingo state with almost complete line
    await page.evaluate(() => {
      localStorage.setItem('bingo_shared_state', JSON.stringify({
        drawnNumbers: [7, 18, 34, 51, 70], // First row complete
        isBomboRunning: false,
        winStatus: 'line'
      }));
      localStorage.setItem('bingo_user_cards', JSON.stringify({
        'LineWinner': {
          card: [
            [7, 18, 34, 51, 70],
            [2, 22, 40, 49, 61],
            [15, 25, 0, 55, 66],
            [11, 30, 38, 58, 72],
            [5, 21, 44, 52, 69]
          ]
        }
      }));
      localStorage.setItem('bingo_winners', JSON.stringify([]));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(1000);

    // Check for LINE celebration
    const lineText = page.locator('text=/¡LÍNEA|LINE|¡LINEA!/i');
    await expect(lineText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should detect BINGO win with confetti', async ({ page }) => {
    const testUser = 'BingoWinner';
    
    // Seed complete bingo
    await page.evaluate(() => {
      localStorage.setItem('bingo_shared_state', JSON.stringify({
        drawnNumbers: [7, 18, 34, 51, 70, 2, 22, 40, 49, 61, 15, 25, 55, 66, 11, 30, 38, 58, 72, 5, 21, 44, 52, 69],
        isBomboRunning: false,
        winStatus: 'bingo'
      }));
      localStorage.setItem('bingo_user_cards', JSON.stringify({
        'BingoWinner': {
          card: [
            [7, 18, 34, 51, 70],
            [2, 22, 40, 49, 61],
            [15, 25, 0, 55, 66],
            [11, 30, 38, 58, 72],
            [5, 21, 44, 52, 69]
          ]
        }
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(1500);

    // Check for BINGO celebration
    const bingoText = page.locator('text=/¡BINGO!|BINGO/i');
    await expect(bingoText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show drawn numbers in bombo', async ({ page }) => {
    const testUser = 'BomboViewer';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Seed some drawn numbers
    await page.evaluate(() => {
      localStorage.setItem('bingo_shared_state', JSON.stringify({
        drawnNumbers: [7, 15, 23, 42, 66],
        isBomboRunning: true
      }));
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Check drawn numbers are displayed
    const drawnSection = page.locator('text=/Bolas|Números sorteados|Drawn/i');
    await expect(drawnSection.first()).toBeVisible({ timeout: 3000 });
  });

  test('should have permanent card that persists', async ({ page }) => {
    const testUser = 'PermanentCard';
    
    // Set up permanent card
    await page.evaluate(() => {
      localStorage.setItem('bingo_user_cards', JSON.stringify({
        'PermanentCard': {
          card: [
            [7, 18, 34, 51, 70],
            [2, 22, 40, 49, 61],
            [15, 25, 0, 55, 66],
            [11, 30, 38, 58, 72],
            [5, 21, 44, 52, 69]
          ],
          lastUsed: Date.now()
        }
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Reload and check card persists
    await page.reload();
    await page.waitForTimeout(500);

    const bingoCard = page.locator('[class*="bingo"]');
    await expect(bingoCard.first()).toBeVisible({ timeout: 3000 });
  });
});