import { test, expect } from "@playwright/test";

test.describe("Gate 1: Home Page", () => {
  test("home page loads with hero, CTAs, and footer", async ({ page }) => {
    await page.goto("/");

    // Hero title visible
    await expect(page.getByRole("heading", { name: "Good Vibes Golf" })).toBeVisible();

    // Tagline visible
    await expect(
      page.getByText("It's not about the score.", { exact: false })
    ).toBeVisible();

    // CTAs present (Gate 2 changed these from buttons to links)
    await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();

    // Footer links present
    await expect(page.getByRole("link", { name: "Terms of Service" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible();

    // Copyright present
    await expect(page.getByText("© 2026 Good Vibes Golf")).toBeVisible();
  });

  // Gate 2 replaced modals with dedicated /signup and /login routes.
  // These tests have been updated to reflect the new navigation behavior.

  test("Sign Up link navigates to /signup", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign Up" }).click();
    await expect(page).toHaveURL("/signup");
  });

  test("Login link navigates to /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Gate 1: Legal Pages", () => {
  test("Terms of Service page loads", async ({ page }) => {
    await page.goto("/terms");

    // Header present
    await expect(page.getByRole("link", { name: "Back to Home" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();
    await expect(page.getByText("Last updated: March 11, 2026")).toBeVisible();

    // Content sections present
    await expect(page.getByText("Acceptance of Terms", { exact: false })).toBeVisible();
    await expect(page.getByText("Use of Service", { exact: false })).toBeVisible();

    // Footer links present
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
  });

  test("Privacy Policy page loads", async ({ page }) => {
    await page.goto("/privacy");

    // Header present
    await expect(page.getByRole("link", { name: "Back to Home" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
    await expect(page.getByText("Last updated: March 11, 2026")).toBeVisible();

    // Content sections present
    await expect(
      page.getByRole("heading", { name: "1. Information We Collect" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "2. How We Use Your Information" })
    ).toBeVisible();

    // Footer links present
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Terms of Service" })).toBeVisible();
  });
});

test.describe("Gate 1: Navigation", () => {
  test("navigation from home to terms and back", async ({ page }) => {
    await page.goto("/");

    // Navigate to Terms
    await page.getByRole("link", { name: "Terms of Service" }).click();
    await expect(page).toHaveURL("/terms");

    // Navigate back to Home
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("navigation from home to privacy and back", async ({ page }) => {
    await page.goto("/");

    // Navigate to Privacy
    await page.getByRole("link", { name: "Privacy Policy" }).click();
    await expect(page).toHaveURL("/privacy");

    // Navigate back to Home
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page).toHaveURL("/");
  });
});
