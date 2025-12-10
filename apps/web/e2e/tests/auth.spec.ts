import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /Sign In/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');

    await expect(
      page.getByRole('heading', { name: /Create Account/i })
    ).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
  });

  test('should show validation errors on invalid login', async ({ page }) => {
    await page.goto('/login');

    // Click submit without filling form
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Check for validation errors
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('should show validation errors on invalid register', async ({
    page,
  }) => {
    await page.goto('/register');

    // Click submit without filling form
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Check for validation errors
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');

    // Click create account link
    await page.getByRole('link', { name: /Create Account/i }).click();
    await expect(page).toHaveURL(/\/register/);

    // Click sign in link
    await page.getByRole('link', { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
