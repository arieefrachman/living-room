import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// T034 — US1: View 3D Chair in the Browser
// ---------------------------------------------------------------------------

test.describe('US1 — View 3D Chair', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page title is "3D Chair Showcase"', async ({ page }) => {
    await expect(page).toHaveTitle('3D Chair Showcase');
  });

  test('header with app name is visible', async ({ page }) => {
    const heading = page.getByRole('heading', { name: '3D Chair Showcase' });
    await expect(heading).toBeVisible();
  });

  test('3D viewer section is present with accessible label', async ({ page }) => {
    const viewerSection = page.getByRole('region', { name: '3D chair viewer' });
    await expect(viewerSection).toBeVisible();
  });

  test('model-viewer element or error state is rendered in the viewer', async ({ page }) => {
    // model-viewer renders on mount; if chair.glb is absent it transitions to error state.
    // Either outcome confirms the viewer component is alive.
    const viewerOrError = page.locator('model-viewer').or(page.locator('[role="alert"]'));
    await expect(viewerOrError.first()).toBeAttached({ timeout: 10000 });
  });

  test('"Reset view" button is visible with accessible label', async ({ page }) => {
    const resetBtn = page.getByRole('button', { name: 'Reset camera view' });
    await expect(resetBtn).toBeVisible();
  });

  test('clicking "Reset view" does not throw a page error', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const resetBtn = page.getByRole('button', { name: 'Reset camera view' });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Allow a tick for any async errors to surface
    await page.waitForTimeout(200);
    expect(pageErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// T035 — US2: Change Chair Color
// ---------------------------------------------------------------------------

test.describe('US2 — Change Chair Color', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('4 color swatch buttons are present', async ({ page }) => {
    // Color swatches are within the "Color options" group
    const swatches = page.getByRole('group', { name: 'Color options' }).getByRole('button');
    await expect(swatches).toHaveCount(4);
  });

  test('first color swatch is initially active (aria-pressed="true")', async ({ page }) => {
    const swatches = page.getByRole('group', { name: 'Color options' }).getByRole('button');
    const firstSwatch = swatches.first();
    await expect(firstSwatch).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking a different swatch makes it active and deactivates the previous', async ({ page }) => {
    const swatches = page.getByRole('group', { name: 'Color options' }).getByRole('button');

    // Initial: first is active
    await expect(swatches.nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(swatches.nth(1)).toHaveAttribute('aria-pressed', 'false');

    // Click second swatch
    await swatches.nth(1).click();

    // Second is now active; first is inactive
    await expect(swatches.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(swatches.nth(0)).toHaveAttribute('aria-pressed', 'false');
  });
});

// ---------------------------------------------------------------------------
// T035 — US3: Change Chair Material Preset
// ---------------------------------------------------------------------------

test.describe('US3 — Change Chair Material', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('3 material thumbnail buttons are present', async ({ page }) => {
    const thumbnails = page.getByRole('group', { name: 'Material options' }).getByRole('button');
    await expect(thumbnails).toHaveCount(3);
  });

  test('first material is initially active (aria-pressed="true")', async ({ page }) => {
    const thumbnails = page.getByRole('group', { name: 'Material options' }).getByRole('button');
    await expect(thumbnails.first()).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking a different material makes it active and deactivates the previous', async ({ page }) => {
    const thumbnails = page.getByRole('group', { name: 'Material options' }).getByRole('button');

    // Initial: first is active
    await expect(thumbnails.nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(thumbnails.nth(1)).toHaveAttribute('aria-pressed', 'false');

    // Click second thumbnail
    await thumbnails.nth(1).click();

    // Second is now active; first is inactive
    await expect(thumbnails.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(thumbnails.nth(0)).toHaveAttribute('aria-pressed', 'false');
  });

  test('switching material then switching color does not reset material selection', async ({ page }) => {
    const thumbnails = page.getByRole('group', { name: 'Material options' }).getByRole('button');
    const swatches = page.getByRole('group', { name: 'Color options' }).getByRole('button');

    // Select second material
    await thumbnails.nth(1).click();
    await expect(thumbnails.nth(1)).toHaveAttribute('aria-pressed', 'true');

    // Select second color
    await swatches.nth(1).click();
    await expect(swatches.nth(1)).toHaveAttribute('aria-pressed', 'true');

    // Material selection is still on second preset (FR-011 no cross-reset)
    await expect(thumbnails.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(thumbnails.nth(0)).toHaveAttribute('aria-pressed', 'false');
  });
});
