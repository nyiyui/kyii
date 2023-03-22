const { test, expect } = require('@playwright/test');

test('index', async ({ page }) => {
  await page.goto('http://localhost:5000');
  await expect(page).toHaveTitle(/Silica/);
});

test('signuo', async ({ page }) => {
  await page.goto('http://localhost:5000/signup');
  await expect(page).toHaveTitle(/Silica/);
});
