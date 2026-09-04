import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage should have no automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('http://localhost:3000/en');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test('homepage has title and contact link', async ({ page }) => {
  await page.goto('http://localhost:3000/en');
  await expect(page).toHaveTitle(/NGUYEN BUI NHUT Y/);
  // Target the specific contact link in the nav/hero
  const contactLink = page.getByRole('link', { name: 'Contact Me' }).first();
  await expect(contactLink).toBeVisible();
});

test('blog page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/en/blog');
  await expect(page.locator('h1')).toContainText('Blog');
});
