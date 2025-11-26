import { test, expect } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-root')).toBeVisible();
  await expect(page.locator('text=angular-surveys')).toBeVisible();
});

