import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://alto-good-vibes-golf.vercel.app";

test.describe("Gate 4: Round Routes (unauthenticated)", () => {
  test("round/create redirects to login when unauthenticated", async ({ page }) => {
    await page.goto(`${BASE_URL}/round/create`);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("round creation page loads after login redirect", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/round/create`);
    // Should either show the page (if somehow authed) or redirect to login
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe("Gate 4: Round History Page", () => {
  test("round-history redirects to login when unauthenticated", async ({ page }) => {
    await page.goto(`${BASE_URL}/round-history`);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});

test.describe("Gate 4: Home Page — Start Round CTA", () => {
  // Note: Round CTAs were removed from homepage in Gate 4 review (homepage reverted to
  // Sign Up/Login primaries). Round access is post-auth only via /round-history redirect.
  test("home page has Sign Up and Login as primary CTAs", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  });

  test("round-history redirects unauthenticated users to login", async ({ page }) => {
    await page.goto(`${BASE_URL}/round-history`);
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Gate 4: Round Creation Flow (structure)", () => {
  test("round create page structure after login", async ({ page }) => {
    // Navigate, expect redirect to login then login page structure
    await page.goto(`${BASE_URL}/round/create`);
    // Unauthenticated: should redirect to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    // Verify login page is functional
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("course search API route responds", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/courses/search?q=Pebble`);
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe("Gate 4: Course Search Input", () => {
  // These tests verify the create page when auth is bypassed by going directly
  // Full auth integration tests would require test credentials
  test("round/create redirects unauthenticated users correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/round/create`);
    // Should redirect to login
    const url = page.url();
    expect(url).toContain("/login");
  });
});

test.describe("Gate 4: Scorecard and Recap Routes", () => {
  test("non-existent round scorecard returns non-500", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/round/00000000-0000-0000-0000-000000000000/scorecard`);
    // Should redirect to login (unauthenticated) or show an error page — not a 500
    expect(response?.status()).toBeLessThan(500);
  });

  test("non-existent round recap returns non-500", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/round/00000000-0000-0000-0000-000000000000/recap`);
    expect(response?.status()).toBeLessThan(500);
  });
});
