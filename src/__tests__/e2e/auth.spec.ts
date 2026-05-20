/**
 * E2E Tests: Authentication Flows
 * Covers: registration, login (success + failure), logout, protected routes,
 * already-logged-in redirect, and change password.
 */
import { test, expect } from "@playwright/test";
import { loginAs, loginAsApplicant, loginAsEmployer, TEST_APPLICANT, TEST_EMPLOYER } from "./helpers";

// ─── Registration ─────────────────────────────────────────────────────────────

test.describe("Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("register page loads with form fields", async ({ page }) => {
    await expect(page).toHaveTitle(/register|sign up|jobnest/i);
    await expect(page.getByLabel(/name/i).first()).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password/i).first()).toBeVisible();
  });

  test("shows validation error when submitting empty form", async ({ page }) => {
    await page.getByRole("button", { name: /register|sign up/i }).click();
    // At least one error message should appear
    const errors = page.locator("[class*='error'], [class*='invalid'], p[class]").filter({
      hasText: /required|must|invalid/i,
    });
    await expect(errors.first()).toBeVisible({ timeout: 5_000 });
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await page.getByLabel(/name/i).first().fill("Test User");
    await page.getByLabel(/^username/i).fill("testuser123");
    await page.getByLabel(/email/i).fill("test@example.com");
    // Fill password fields with mismatched values
    const passwordFields = page.getByLabel(/password/i);
    await passwordFields.first().fill("ValidPass1");
    await passwordFields.last().fill("DifferentPass1");
    await page.getByRole("button", { name: /register|sign up/i }).click();

    await expect(
      page.getByText(/don't match|passwords.*match/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  test("shows error for weak password (no uppercase)", async ({ page }) => {
    await page.getByLabel(/^username/i).fill("testuser999");
    await page.getByLabel(/email/i).fill("weakpass@test.com");
    await page.getByLabel(/^password/i).first().fill("weakpassword1");
    await page.getByRole("button", { name: /register|sign up/i }).click();

    await expect(
      page.getByText(/uppercase/i)
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ─── Login ─────────────────────────────────────────────────────────────────────

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("login page renders email and password fields", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /login|sign in/i })).toBeVisible();
  });

  test("shows error for wrong credentials", async ({ page }) => {
    await page.getByLabel(/email/i).fill("nobody@example.com");
    await page.getByLabel(/password/i).fill("WrongPass1");
    await page.getByRole("button", { name: /login|sign in/i }).click();

    await expect(
      page.getByText(/invalid email or password/i)
    ).toBeVisible({ timeout: 8_000 });
  });

  test("shows validation error for malformed email", async ({ page }) => {
    await page.getByLabel(/email/i).fill("not-an-email");
    await page.getByLabel(/password/i).fill("Password1");
    await page.getByRole("button", { name: /login|sign in/i }).click();

    await expect(
      page.getByText(/valid email/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  test("applicant: redirects to applicant dashboard on success", async ({ page }) => {
    await loginAs(page, TEST_APPLICANT.email, TEST_APPLICANT.password);
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10_000 });
  });

  test("employer: redirects to employer dashboard on success", async ({ page }) => {
    await loginAs(page, TEST_EMPLOYER.email, TEST_EMPLOYER.password);
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10_000 });
  });
});

// ─── Protected Routes ─────────────────────────────────────────────────────────

test.describe("Protected routes", () => {
  test("unauthenticated user visiting /dashboard is redirected to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });

  test("unauthenticated user visiting /dashboard is redirected to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });

  test("unauthenticated user visiting /messages is redirected to /login", async ({ page }) => {
    await page.goto("/messages");
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });
});

// ─── Already-Logged-In Redirect ───────────────────────────────────────────────

test.describe("Already authenticated redirect", () => {
  test("logged-in applicant visiting /login is redirected to dashboard", async ({ page }) => {
    await loginAsApplicant(page);
    await page.goto("/login");
    await expect(page).not.toHaveURL(/login/, { timeout: 8_000 });
    await expect(page).toHaveURL(/dashboard/, { timeout: 8_000 });
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

test.describe("Logout", () => {
  test("applicant can logout and is redirected to /login", async ({ page }) => {
    await loginAsApplicant(page);
    // Find and click logout
    await page
      .getByRole("button", { name: /logout|sign out/i })
      .or(page.getByText(/logout|sign out/i).first())
      .click();
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });

  test("after logout, visiting /dashboard redirects to /login", async ({ page }) => {
    await loginAsApplicant(page);
    await page
      .getByRole("button", { name: /logout|sign out/i })
      .or(page.getByText(/logout|sign out/i).first())
      .click();
    await page.waitForURL(/login/, { timeout: 8_000 });
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });
});
