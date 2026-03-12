import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://alto-good-vibes-golf.vercel.app";

test.describe("Gate 2: Auth Pages", () => {
  test("signup page loads with all fields", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await expect(page.getByText("Good Vibes Golf")).toBeVisible();
    await expect(page.getByText("Track your rounds. Play better golf.")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Phone")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("signup page links to login", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await page.getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("login page loads with email field and magic link button", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.getByText("Good Vibes Golf")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Magic Link" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("login page links to signup", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/signup`);
  });

  test("signup form shows check email state on submit", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Phone").fill("555-123-4567");
    await page.getByLabel("Name").fill("Test User");
    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(page.getByText("Check your email")).toBeVisible({ timeout: 10000 });
  });

  test("login form shows check email state on submit", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByRole("button", { name: "Send Magic Link" }).click();
    await expect(page.getByText("Check your email")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Gate 2: Protected Routes", () => {
  test("round-history redirects to login when unauthenticated", async ({ page }) => {
    await page.goto(`${BASE_URL}/round-history`);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("profile redirects to login when unauthenticated", async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});

test.describe("Gate 2: Home Page CTA Update", () => {
  test("home page Sign Up links to /signup", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    const signUpLink = page.getByRole("link", { name: "Sign Up" });
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute("href", "/signup");
  });

  test("home page Login links to /login", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    const loginLink = page.getByRole("link", { name: "Login" });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });
});
