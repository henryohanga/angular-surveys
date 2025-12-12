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

    // Check CTA buttons in hero section
    await expect(
      page.locator('.hero-actions').getByRole('link', { name: /Get Started/i })
    ).toBeVisible();
    await expect(
      page.locator('.hero-actions').getByRole('link', { name: /Try Demo/i })
    ).toBeVisible();
  });

  test('should navigate to demo when clicking Try Demo', async ({ page }) => {
    await page.goto('/');

    await page
      .locator('.hero-actions')
      .getByRole('link', { name: /Try Demo/i })
      .click();

    await expect(page).toHaveURL(/\/demo/);
  });

  test('should show templates section', async ({ page }) => {
    await page.goto('/');

    // Scroll to templates section
    await expect(
      page.getByRole('heading', { name: /Quick Start Templates/i })
    ).toBeVisible();
    // Use more specific locator to avoid strict mode violation
    await expect(
      page
        .locator('.template-card h4')
        .filter({ hasText: 'Customer Satisfaction' })
        .first()
    ).toBeVisible();
  });
});
