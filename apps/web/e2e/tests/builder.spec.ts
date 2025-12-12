import { test, expect } from '@playwright/test';

test.describe('Builder Access', () => {
  test('should redirect unauthenticated users to login when accessing builder', async ({
    page,
  }) => {
    // Builder requires authentication, so it should redirect to login
    await page.goto('/builder');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users to login when accessing builder with ID', async ({
    page,
  }) => {
    // Builder with ID also requires authentication
    await page.goto('/builder/some-survey-id');
    await expect(page).toHaveURL(/\/login/);
  });
});
