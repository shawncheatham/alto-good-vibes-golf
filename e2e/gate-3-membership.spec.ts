import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://alto-good-vibes-golf.vercel.app";

test.describe("Gate 3: Membership Page", () => {
  test("membership page loads with all three tier cards", async ({ page }) => {
    await page.goto(`${BASE_URL}/membership`);
    await expect(page.getByText("Good Vibes Golf")).toBeVisible();
    await expect(page.getByText("Choose Your Plan")).toBeVisible();

    // All three tier names visible
    await expect(page.getByRole("heading", { name: "Free" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Grounds Keeper" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Players Club" })).toBeVisible();
  });

  test("all tier names are visible", async ({ page }) => {
    await page.goto(`${BASE_URL}/membership`);
    await expect(page.getByText("Free")).toBeVisible();
    await expect(page.getByText("Grounds Keeper")).toBeVisible();
    await expect(page.getByText("Players Club")).toBeVisible();
  });

  test('"Most Popular" badge is visible on Grounds Keeper card', async ({ page }) => {
    await page.goto(`${BASE_URL}/membership`);
    await expect(page.getByText("Most Popular")).toBeVisible();
  });

  test("Grounds Keeper CTA has correct BMC level ID (309472)", async ({ page }) => {
    await page.goto(`${BASE_URL}/membership`);
    // Find link with buymeacoffee.com that includes level 309472
    const groundsKeeperLink = page.locator('a[href*="buymeacoffee.com"]').filter({ hasText: /trial|Trial|upgrade|Upgrade/i }).first();
    // Look for any BMC link with the correct level
    const allBmcLinks = page.locator('a[href*="buymeacoffee.com"][href*="309472"]');
    await expect(allBmcLinks.first()).toBeVisible();
  });

  test("Players Club CTA has correct BMC level ID (309474)", async ({ page }) => {
    await page.goto(`${BASE_URL}/membership`);
    const allBmcLinks = page.locator('a[href*="buymeacoffee.com"][href*="309474"]');
    await expect(allBmcLinks.first()).toBeVisible();
  });

  test("upgrade CTAs have href containing buymeacoffee.com", async ({ page }) => {
    await page.goto(`${BASE_URL}/membership`);
    const bmcLinks = page.locator('a[href*="buymeacoffee.com"]');
    const count = await bmcLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("FAQ section is visible", async ({ page }) => {
    await page.goto(`${BASE_URL}/membership`);
    await expect(page.getByText("Frequently Asked Questions")).toBeVisible();
    await expect(page.getByText(/7-day free trial/i)).toBeVisible();
    await expect(page.getByText(/cancel anytime/i)).toBeVisible();
  });

  test("page is mobile responsive (375px viewport)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/membership`);
    await expect(page.getByText("Choose Your Plan")).toBeVisible();
    await expect(page.getByText("Free")).toBeVisible();
    await expect(page.getByText("Grounds Keeper")).toBeVisible();
    await expect(page.getByText("Players Club")).toBeVisible();
    await expect(page.getByText("Most Popular")).toBeVisible();
  });
});
