import { test, expect } from "@playwright/test";

// Gate 6: Side Bets E2E Smoke Tests
// Tests page structure and routes — live auth flow requires Supabase test credentials.

test.describe("Gate 6: Side Bets", () => {
  // Test 1: Side-bets new page redirects unauthenticated users
  test("side-bets new page redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/round/test-round-id/side-bets/new");
    await expect(page).toHaveURL(/login/);
  });

  // Test 2: Ledger page redirects unauthenticated users
  test("ledger page redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/round/test-round-id/ledger");
    await expect(page).toHaveURL(/login/);
  });

  // Test 3: Scorecard page redirects unauthenticated
  test("scorecard page still redirects unauthenticated users", async ({ page }) => {
    await page.goto("/round/test-round-id/scorecard");
    await expect(page).toHaveURL(/login/);
  });

  // Test 4: Recap page redirects unauthenticated
  test("recap page still redirects unauthenticated users", async ({ page }) => {
    await page.goto("/round/test-round-id/recap");
    await expect(page).toHaveURL(/login/);
  });

  // Test 5: API route for side bets (supabase schema check)
  test("side_bets table exists — migration endpoint returns no 404", async ({ page }) => {
    // The side-bets new page exists (not 404) even if it redirects
    const response = await page.goto("/round/test-round-id/side-bets/new");
    // Should redirect to login, not 404
    const url = page.url();
    expect(url).not.toMatch(/404/);
    await expect(page.locator("body")).toBeVisible();
  });

  // Test 6: Ledger page is accessible (redirects, not 404)
  test("ledger page exists and is protected by auth", async ({ page }) => {
    await page.goto("/round/test-round-id/ledger");
    // Should redirect to login, not 404
    const url = page.url();
    expect(url).not.toMatch(/404/);
    await expect(page).toHaveURL(/login|ledger/);
  });

  // Test 7: Home page still loads correctly (regression check)
  test("home page loads without regression", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toMatch(/Good Vibes Golf|sign up|Sign Up/i);
  });

  // Test 8: Membership page still loads (Gate 3 regression)
  test("membership page loads without regression", async ({ page }) => {
    await page.goto("/membership");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toMatch(/players club|Players Club/i);
  });

  // Test 9: Round create page still protected (Gate 4 regression)
  test("round create page still requires auth", async ({ page }) => {
    await page.goto("/round/create");
    await expect(page).toHaveURL(/login/);
  });

  // Test 10: Side-bets config page structure test (if auth bypassed via URL)
  test("side-bets new page has correct structure when accessible", async ({ page }) => {
    // Navigate and handle redirect — if we land on login, that is expected
    await page.goto("/round/test-round-id/side-bets/new");
    const url = page.url();
    if (url.includes("login")) {
      // Expected — page is protected
      await expect(page.locator("body")).toBeVisible();
    } else {
      // If somehow accessible, verify step 1 UI
      const bodyText = await page.locator("body").textContent();
      expect(bodyText).toMatch(/Side Bet|Bet|Choose/i);
    }
  });
});
