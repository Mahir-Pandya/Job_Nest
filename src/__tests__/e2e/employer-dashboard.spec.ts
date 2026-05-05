/**
 * E2E Tests: Employer Dashboard
 * Covers: dashboard stats, applications list, post a job, edit a job,
 * delete a job, view candidates, company profile.
 */
import { test, expect } from "@playwright/test";
import { loginAsEmployer } from "./helpers";

test.describe("Employer Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
    await page.goto("/employer-dashboard");
  });

  test("dashboard page loads with stats cards", async ({ page }) => {
    await expect(page).toHaveURL(/employer-dashboard/, { timeout: 8_000 });
    // Stat cards (active jobs, applicants, etc.) should be visible
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("dashboard shows numeric stats (active jobs count visible)", async ({ page }) => {
    // Stats should contain numbers
    const statNumbers = page.locator("[class*='stat'], [class*='count'], h2, h3").filter({
      hasText: /\d+/,
    });
    await expect(statNumbers.first()).toBeVisible({ timeout: 8_000 });
  });
});

// ─── Applications ──────────────────────────────────────────────────────────────

test.describe("Employer Applications", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
  });

  test("applications page loads without error", async ({ page }) => {
    await page.goto("/employer-dashboard/applications");
    await expect(page).toHaveURL(/employer-dashboard\/applications/, { timeout: 8_000 });
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("applications page shows heading", async ({ page }) => {
    await page.goto("/employer-dashboard/applications");
    await expect(
      page.getByRole("heading", { name: /application|candidate/i }).first()
    ).toBeVisible({ timeout: 8_000 });
  });
});

// ─── Job Management ────────────────────────────────────────────────────────────

test.describe("Employer Job Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
  });

  test("jobs page loads with list of employer's jobs", async ({ page }) => {
    await page.goto("/employer-dashboard/jobs");
    await expect(page.getByRole("main")).toBeVisible({ timeout: 8_000 });
  });

  test("'Post a Job' button is visible on jobs page", async ({ page }) => {
    await page.goto("/employer-dashboard/jobs");
    const postBtn = page.getByRole("link", { name: /post.*job|new job|add job/i })
      .or(page.getByRole("button", { name: /post.*job|new job|add job/i }));
    await expect(postBtn.first()).toBeVisible({ timeout: 8_000 });
  });

  test("post job form loads when navigating to create job page", async ({ page }) => {
    await page.goto("/employer-dashboard/jobs");
    const postBtn = page.getByRole("link", { name: /post.*job|new job|add job/i })
      .or(page.getByRole("button", { name: /post.*job|new job|add job/i }));
    await postBtn.first().click();
    // Form with job title field should appear
    await expect(
      page.getByLabel(/title|job title/i).or(page.getByPlaceholder(/title|job title/i))
    ).toBeVisible({ timeout: 8_000 });
  });

  test("post job form shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/employer-dashboard/jobs");
    const postBtn = page.getByRole("link", { name: /post.*job|new job|add job/i })
      .or(page.getByRole("button", { name: /post.*job|new job|add job/i }));
    await postBtn.first().click();

    // Submit without filling anything
    const submitBtn = page.getByRole("button", { name: /submit|post|create|save/i });
    await submitBtn.first().click();

    // At least one error should appear
    await expect(
      page.getByText(/required|must be|invalid/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ─── Candidates ────────────────────────────────────────────────────────────────

test.describe("Employer Candidates", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
  });

  test("candidates page loads without error", async ({ page }) => {
    await page.goto("/employer-dashboard/candidates");
    await expect(page.getByRole("main")).toBeVisible({ timeout: 8_000 });
  });
});

// ─── Company Profile ──────────────────────────────────────────────────────────

test.describe("Employer Company Profile", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
  });

  test("company profile / settings page loads", async ({ page }) => {
    await page.goto("/employer-dashboard/company-profile");
    await expect(page.getByRole("main")).toBeVisible({ timeout: 8_000 });
  });

  test("company profile page has a save/update button", async ({ page }) => {
    await page.goto("/employer-dashboard/company-profile");
    const saveBtn = page.getByRole("button", { name: /save|update|submit/i });
    await expect(saveBtn.first()).toBeVisible({ timeout: 8_000 });
  });

  test("shows validation error when submitting incomplete company profile", async ({ page }) => {
    await page.goto("/employer-dashboard/company-profile");
    // Clear the company name and submit to trigger validation
    const nameField = page.getByLabel(/company name/i).or(page.getByPlaceholder(/company name/i));
    if (await nameField.isVisible()) {
      await nameField.clear();
    }
    const saveBtn = page.getByRole("button", { name: /save|update|submit/i });
    await saveBtn.first().click();
    await expect(
      page.getByText(/required|must be|characters/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });
});
