import { test, expect } from '@playwright/test';

test('builder can add page and edit metadata', async ({ page }) => {
  await page.goto('/builder');
  await expect(page.getByText('Survey Builder')).toBeVisible();

  await page.getByRole('button', { name: 'Add Page' }).click();
  await page.getByLabel('Name').fill('Intro');
  await page.getByLabel('Description').fill('Welcome');
  await page.getByText('Named page').click();

  await expect(page.getByText('Page 2')).toBeVisible();
});

test('builder can add radio question with page flow', async ({ page }) => {
  await page.goto('/builder');
  await page.getByRole('button', { name: 'Add Question' }).click();
  await page.getByLabel('Id').fill('q1');
  await page.getByRole('textbox', { name: 'Text' }).fill('Choose');
  await page.getByRole('combobox', { name: 'Type' }).click();
  await page.getByRole('option', { name: 'Radio' }).click();
  await page.getByRole('button', { name: 'Add Option' }).click();
  await page.getByLabel('Value').fill('Go');
  await page.getByLabel('Go to page').click();
  await page.getByRole('option', { name: 'Page 2' }).click();
  await page.locator('app-question-editor form').getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByText('Choose (radio)')).toBeVisible();
});
