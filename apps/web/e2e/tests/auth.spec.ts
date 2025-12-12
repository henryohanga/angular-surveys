import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(
      page.getByRole('heading', { name: /Welcome back/i })
    ).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');

    await expect(
      page.getByRole('heading', { name: /Create your account/i })
    ).toBeVisible();
    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
    await expect(page.locator('label[for="confirmPassword"]')).toBeVisible();
  });

  test('should show validation errors on invalid login', async ({ page }) => {
    await page.goto('/login');

    // Touch email field to trigger validation
    await page.getByLabel('Email address').focus();
    await page.getByLabel('Email address').blur();

    // Check for validation errors
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('should show validation errors on invalid register', async ({
    page,
  }) => {
    await page.goto('/register');

    // Touch name field to trigger validation
    await page.getByLabel('Full name').focus();
    await page.getByLabel('Full name').blur();

    // Check for validation errors
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');

    // Click create account link
    await page.getByRole('link', { name: /Create one for free/i }).click();
    await expect(page).toHaveURL(/\/register/);

    // Click sign in link (in auth-footer)
    await page
      .locator('.auth-footer')
      .getByRole('link', { name: /Sign in/i })
      .click();
    await expect(page).toHaveURL(/\/login/);
  });
});
