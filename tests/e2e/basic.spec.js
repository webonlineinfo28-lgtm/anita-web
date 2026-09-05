import { test, expect } from '@playwright/test';

test('should load the login page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Anita');
});

test('should login and show rules panel', async ({ page }) => {
  await page.goto('/');
  // Login first
  await page.fill('input[placeholder*="Dj cosmic"]', 'TestUser');
  await page.click('text=Entrar al Festival');
  await page.waitForTimeout(1000);
  // Then click rules button
  await page.click('button[title="Reglas del Festival"]');
  await expect(page.locator('text=Protocolo Cosmico')).toBeVisible();
});
