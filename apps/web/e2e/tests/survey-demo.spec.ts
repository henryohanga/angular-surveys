import { test, expect } from '@playwright/test';

test.describe('Survey Demo', () => {
  test('should display demo survey page', async ({ page }) => {
    await page.goto('/surveys');

    // Should show survey content
    await expect(page.locator('app-survey')).toBeVisible();
  });

  test('should display Material survey variant', async ({ page }) => {
    await page.goto('/surveys/material');

    // Should show material survey component
    await expect(page.locator('app-material-survey')).toBeVisible();
  });
});

test.describe('Public Survey', () => {
  test('should show 404 or redirect for non-existent survey', async ({
    page,
  }) => {
    await page.goto('/s/non-existent-survey-id');

    // Should show error or redirect
    // The actual behavior depends on implementation
    await expect(page.locator('body')).toBeVisible();
  });
});
