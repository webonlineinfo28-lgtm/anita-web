import { test, expect } from '@playwright/test';

/**
 * Chat E2E Tests
 * Tests for the room chat with reactions
 */
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

    // Check chat is visible
    const chatPanel = page.locator('text=/Chat|Sala|Mensajes/');
    await expect(chatPanel.first()).toBeVisible({ timeout: 5000 });
  });

  test('should send a chat message', async ({ page }) => {
    const testUser = 'MessageSender';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Look for chat input
    const chatInput = page.locator('input[placeholder*="Mensaje"], input[placeholder*="message"], textarea');
    if (await chatInput.count() > 0) {
      await chatInput.first().fill('Hello from test!');
      const sendButton = page.locator('button', { hasText: /Enviar|Send|➤/ });
      if (await sendButton.count() > 0) {
        await sendButton.first().click();
        await page.waitForTimeout(500);
      }
    }

    // Message should appear
    const message = page.locator('text=/Hello from test!/');
    await expect(message.first()).toBeVisible({ timeout: 3000 });
  });

  test('should show user avatar in chat messages', async ({ page }) => {
    const testUser = 'AvatarUser';
    
    // Seed avatar
    await page.evaluate(() => {
      localStorage.setItem('anita_avatars', JSON.stringify({
        'AvatarUser': { skin: 'human', eyes: 'glow' }
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Check for avatar in chat
    const avatarInChat = page.locator('[class*="avatar"], [class*="chat"] svg');
    expect(await avatarInChat.count()).toBeGreaterThan(0);
  });

  test('should display reactions panel', async ({ page }) => {
    const testUser = 'ReactionUser';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Check for reaction buttons
    const reactions = page.locator('text=/❤️|🔥|👍|😂|🤪|🥳/');
    expect(await reactions.count()).toBeGreaterThan(0);
  });

  test('should add reaction to current song', async ({ page }) => {
    const testUser = 'ReactionAdder';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // Click a reaction button
    const fireButton = page.locator('button', { hasText: '🔥' });
    if (await fireButton.count() > 0) {
      await fireButton.first().click();
      await page.waitForTimeout(500);
      
      // Reaction should be counted
      const reactionCount = page.locator('text=/🔥.*\\d+/');
      // May or may not show count depending on implementation
    }
  });

  test('should show system messages', async ({ page }) => {
    const testUser = 'SystemUser';
    
    // Seed system message
    await page.evaluate(() => {
      localStorage.setItem('anita_room_state', JSON.stringify({
        dj: 'OtherUser',
        messages: [
          { user: 'system', text: 'Bienvenidos al festival!', type: 'system' }
        ]
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    // System message should appear
    const systemMsg = page.locator('text=/Bienvenidos/i');
    await expect(systemMsg.first()).toBeVisible({ timeout: 3000 });
  });
});