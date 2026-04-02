import { test, expect } from '@playwright/test';

test('home page has a visible heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible();
});

test('page title is set', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Next\.js/i);
});
