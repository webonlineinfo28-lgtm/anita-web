import { test, expect } from '@playwright/test';

test('should load the login page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Anita');
});

test('should show rules panel', async ({ page }) => {
  await page.goto('/');
  await page.click('button[title="Reglas del Festival"]');
  await expect(page.locator('text=Protocolo Cósmico')).toBeVisible();
});
