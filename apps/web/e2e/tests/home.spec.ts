import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page with features', async ({ page }) => {
    await page.goto('/');

    // Check main heading
    await expect(
      page.getByRole('heading', { name: /Angular Surveys/i })
    ).toBeVisible();

    // Check features section
    await expect(page.getByText('Drag & Drop Builder')).toBeVisible();
    await expect(page.getByText('18+ Question Types')).toBeVisible();

    // Check CTA buttons
    await expect(
      page.getByRole('link', { name: /Get Started/i })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /View Demo/i })).toBeVisible();
  });

  test('should navigate to demo when clicking View Demo', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /View Demo/i }).click();

    await expect(page).toHaveURL(/\/surveys/);
  });

  test('should show templates section', async ({ page }) => {
    await page.goto('/');

    // Scroll to templates section
    await expect(page.getByText('Customer Satisfaction')).toBeVisible();
    await expect(page.getByText('Employee Feedback')).toBeVisible();
  });
});
