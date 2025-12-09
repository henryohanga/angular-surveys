import { test, expect } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-root')).toBeVisible();
  await expect(page.getByRole('heading', { name: /angular-surveys app is running!/i })).toBeVisible();
});
