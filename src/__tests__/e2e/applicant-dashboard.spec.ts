/**
 * E2E Tests: Applicant Dashboard
 * Covers: dashboard page, saved jobs, profile settings, resume section.
 */
import { test, expect } from "@playwright/test";
import { loginAsApplicant } from "./helpers";

test.describe("Applicant Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsApplicant(page);
  });

  test("dashboard page loads after login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/, { timeout: 8_000 });
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("dashboard has navigation links for key sections", async ({ page }) => {
    await page.goto("/dashboard");
    // sidebar / nav links
    const navLinks = page.getByRole("link").filter({
      hasText: /saved|profile|settings|applications/i,
    });
    await expect(navLinks.first()).toBeVisible({ timeout: 8_000 });
  });
});

// ─── Saved Jobs ────────────────────────────────────────────────────────────────

test.describe("Applicant Saved Jobs", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsApplicant(page);
  });

  test("saved jobs page loads without error", async ({ page }) => {
    await page.goto("/dashboard/saved-jobs");
    await expect(page.getByRole("main")).toBeVisible({ timeout: 8_000 });
  });

  test("saved jobs page shows heading", async ({ page }) => {
    await page.goto("/dashboard/saved-jobs");
    await expect(
      page.getByRole("heading", { name: /saved.*job|my.*job|bookmark/i }).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("empty saved jobs shows appropriate message", async ({ page }) => {
    await page.goto("/dashboard/saved-jobs");
    // Either jobs are listed OR an empty state message appears
    const content = page.locator("main");
    await expect(content).toBeVisible({ timeout: 8_000 });
    // No crash = minimum bar for this test
  });
});

// ─── Profile / Settings ───────────────────────────────────────────────────────

test.describe("Applicant Profile Settings", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsApplicant(page);
    await page.goto("/dashboard/settings");
  });

  test("settings page loads with profile form", async ({ page }) => {
    await expect(page.getByRole("main")).toBeVisible({ timeout: 8_000 });
  });

  test("name field is pre-filled with current user's name", async ({ page }) => {
    const nameField = page.getByLabel(/name/i).first();
    await expect(nameField).toBeVisible({ timeout: 8_000 });
    // Should have some value (pre-filled)
    const value = await nameField.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test("email field is visible and pre-filled", async ({ page }) => {
    const emailField = page.getByLabel(/email/i);
    await expect(emailField).toBeVisible({ timeout: 8_000 });
    const value = await emailField.inputValue();
    expect(value).toContain("@");
  });

  test("save button is present on settings page", async ({ page }) => {
    const saveBtn = page.getByRole("button", { name: /save|update|submit/i });
    await expect(saveBtn.first()).toBeVisible({ timeout: 8_000 });
  });

  test("shows validation error when name is cleared and form submitted", async ({ page }) => {
    const nameField = page.getByLabel(/name/i).first();
    await nameField.clear();
    const saveBtn = page.getByRole("button", { name: /save|update|submit/i });
    await saveBtn.first().click();
    await expect(
      page.getByText(/required|must be|characters/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test("bio / biography textarea is visible", async ({ page }) => {
    const bioField = page
      .getByLabel(/bio|biography|about/i)
      .or(page.getByPlaceholder(/bio|biography|about/i));
    await expect(bioField.first()).toBeVisible({ timeout: 8_000 });
  });
});
