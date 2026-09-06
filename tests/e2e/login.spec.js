import { test, expect } from '@playwright/test';

test('should login and show app', async ({ page }) => {
  const errors = [];
  page.on('console', m => { if(m.type()==='error') errors.push(m.text()); });
  await page.goto('/');
  await expect(page.locator('text=Tu nombre')).toBeVisible({ timeout: 5000 });
  await page.fill('input[placeholder*="Tu nombre"]', 'TestUser');
  await page.click('text=Entrar al Festival');
  await page.waitForTimeout(2000);
  const body = await page.textContent('body');
  console.log('App content: ', body.substring(0,200));
  console.log('Errors: ', errors.length, errors.slice(0,3));
  expect(body.length).toBeGreaterThan(50);
});
