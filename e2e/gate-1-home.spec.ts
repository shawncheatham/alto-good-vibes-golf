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

    // CTAs present
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();

    // Footer links present
    await expect(page.getByRole("link", { name: "Terms of Service" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible();

    // Copyright present
    await expect(page.getByText("© 2026 Good Vibes Golf")).toBeVisible();
  });

  test("Sign Up modal opens and closes via button click", async ({ page }) => {
    await page.goto("/");

    // Open modal
    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(
      page.getByRole("heading", { name: "Sign Up", exact: true })
    ).toBeVisible();
    await expect(page.getByText("Sign up flow coming soon...")).toBeVisible();

    // Close via X button
    await page.getByLabel("Close modal").click();
    await expect(page.getByText("Sign up flow coming soon...")).not.toBeVisible();
  });

  test("Sign Up modal closes via overlay click", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(page.getByText("Sign up flow coming soon...")).toBeVisible();

    // Click overlay (not the modal content)
    await page.locator('[class*="fixed inset-0"]').first().click({ position: { x: 10, y: 10 } });
    await expect(page.getByText("Sign up flow coming soon...")).not.toBeVisible();
  });

  test("Sign Up modal closes via ESC key", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(page.getByText("Sign up flow coming soon...")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("Sign up flow coming soon...")).not.toBeVisible();
  });

  test("Login modal opens and closes via button click", async ({ page }) => {
    await page.goto("/");

    // Open modal
    await page.getByRole("button", { name: "Login" }).click();
    await expect(
      page.getByRole("heading", { name: "Login", exact: true })
    ).toBeVisible();
    await expect(page.getByText("Login flow coming soon...")).toBeVisible();

    // Close via X button
    await page.getByLabel("Close modal").click();
    await expect(page.getByText("Login flow coming soon...")).not.toBeVisible();
  });

  test("Login modal closes via overlay click", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByText("Login flow coming soon...")).toBeVisible();

    // Click overlay (not the modal content)
    await page.locator('[class*="fixed inset-0"]').first().click({ position: { x: 10, y: 10 } });
    await expect(page.getByText("Login flow coming soon...")).not.toBeVisible();
  });

  test("Login modal closes via ESC key", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByText("Login flow coming soon...")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("Login flow coming soon...")).not.toBeVisible();
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
