import { test, expect } from '@playwright/test';

/**
 * Avatar Editor E2E Tests
 * Tests for the procedural avatar editor
 */
test.describe('Avatar Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('should open avatar editor', async ({ page }) => {
    const testUser = 'AvatarEditor';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    const profileButton = page.locator('button[title*="Perfil"], button[title*="Avatar"]');
    if (await profileButton.count() > 0) {
      await profileButton.first().click();
      await page.waitForTimeout(500);
    }

    const editor = page.locator('text=/Cara|Ojos|Pelo|Skin|Eyes|Hair/');
    await expect(editor.first()).toBeVisible({ timeout: 5000 });
  });

  test('should change skin color', async ({ page }) => {
    const testUser = 'SkinChanger';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    const profileButton = page.locator('button[title*="Perfil"], button[title*="Avatar"]');
    if (await profileButton.count() > 0) {
      await profileButton.first().click();
      await page.waitForTimeout(500);
    }

    const skinTab = page.locator('text=/Cara|Skin|Face/');
    if (await skinTab.count() > 0) {
      await skinTab.first().click();
      await page.waitForTimeout(300);
    }

    const skinOption = page.locator('[class*="option"], [class*="swatch"]');
    if (await skinOption.count() > 1) {
      await skinOption.nth(1).click();
    }

    const avatarSvg = page.locator('svg[class*="avatar"]');
    expect(await avatarSvg.count()).toBeGreaterThan(0);
  });

  test('should have randomize button', async ({ page }) => {
    const testUser = 'RandomUser';
    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    const profileButton = page.locator('button[title*="Perfil"], button[title*="Avatar"]');
    if (await profileButton.count() > 0) {
      await profileButton.first().click();
      await page.waitForTimeout(500);
    }

    const randomButton = page.locator('button', { hasText: /Aleatorio|Random|🎲/ });
    await expect(randomButton.first()).toBeVisible({ timeout: 3000 });
  });

  test('should display avatar in header', async ({ page }) => {
    const testUser = 'HeaderAvatar';
    await page.evaluate(() => {
      localStorage.setItem('anita_avatars', JSON.stringify({
        'HeaderAvatar': { skin: 'alien', eyes: 'glow' }
      }));
    });

    await page.fill('input[placeholder*="Tu nombre"]', testUser);
    await page.click('text=Entrar al Festival');
    await page.waitForTimeout(500);

    const headerAvatar = page.locator('header svg, header [class*="avatar"]');
    expect(await headerAvatar.count()).toBeGreaterThan(0);
  });
});