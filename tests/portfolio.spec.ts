import { test, expect } from '@playwright/test';

test('homepage has title and contact link', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page).toHaveTitle(/NGUYEN BUI NHUT Y/);
  const contactLink = page.locator('a[href="#contact"]');
  await expect(contactLink).toBeVisible();
});

test('blog page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/blog');
  await expect(page.locator('h1')).toContainText('Blog');
});
