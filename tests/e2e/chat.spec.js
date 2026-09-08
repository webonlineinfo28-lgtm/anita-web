import { test, expect } from '@playwright/test';

test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('should display chat panel', async ({ page }) => {
    const testUser = 'ChatUser';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Check chat heading is visible
    const chatHeading = page.locator('h3:has-text("Chat")');
    await expect(chatHeading).toBeVisible({ timeout: 5000 });
  });

  test('should send a chat message', async ({ page }) => {
    const testUser = 'MessageSender';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Find chat input and send message
    const chatInput = page.locator('input[placeholder*="mensaje"], textarea').first();
    await chatInput.fill('Test message');
    await chatInput.press('Enter');
    await page.waitForTimeout(300);

    // Message should appear in chat
    const message = page.locator('text=Test message');
    await expect(message).toBeVisible({ timeout: 3000 });
  });

  test('should show user name in chat messages', async ({ page }) => {
    const testUser = 'AvatarUser';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // User name should appear somewhere
    const userName = page.locator(`text=${testUser}`);
    await expect(userName.first()).toBeVisible({ timeout: 3000 });
  });

  test('should have reaction buttons', async ({ page }) => {
    const testUser = 'ReactionUser';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Look for reaction buttons (SVG icons in buttons)
    const reactionBtns = page.locator('[class*="reaccion"], button:has(svg)');
    expect(await reactionBtns.count()).toBeGreaterThan(0);
  });

  test('should have Send button or Enter to send', async ({ page }) => {
    const testUser = 'SendUser';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Chat input should exist
    const chatInput = page.locator('input[placeholder*="mensaje"], textarea').first();
    await expect(chatInput).toBeVisible({ timeout: 3000 });
  });
});
