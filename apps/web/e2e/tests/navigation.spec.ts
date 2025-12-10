import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages using header', async ({ page }) => {
    // Start at surveys page (not home, to see header)
    await page.goto('/surveys');

    // Check header is visible
    await expect(page.locator('header.site-topbar')).toBeVisible();

    // Check brand link
    await expect(
      page.getByRole('link', { name: /Angular Surveys/i })
    ).toBeVisible();

    // Navigate to demo
    await page.getByRole('link', { name: /Demo/i }).click();
    await expect(page).toHaveURL(/\/surveys/);
  });

  test('should show auth buttons when not logged in', async ({ page }) => {
    await page.goto('/surveys');

    // Should show Sign In and Get Started buttons
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Get Started/i })
    ).toBeVisible();
  });

  test('should redirect to login when accessing protected routes', async ({
    page,
  }) => {
    // Try to access dashboard without being logged in
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing builder', async ({ page }) => {
    // Try to access builder without being logged in
    await page.goto('/builder');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
