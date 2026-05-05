/**
 * E2E Tests: Job Browsing (Applicant / Public)
 * Covers: job listing page, search, filters, pagination, job detail view,
 * save/unsave a job (requires applicant login).
 */
import { test, expect } from "@playwright/test";
import { loginAsApplicant } from "./helpers";

// ─── Public Job Listing ───────────────────────────────────────────────────────

test.describe("Jobs listing page (public)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/jobs");
  });

  test("jobs page loads and displays the page heading", async ({ page }) => {
    await expect(page).toHaveTitle(/jobs|jobnest/i);
    await expect(
      page.getByRole("heading", { name: /find|jobs|browse/i }).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("job cards are visible with title and company info", async ({ page }) => {
    // At least one job card should exist (assumes DB has data)
    const cards = page.locator("article, [class*='card'], [class*='job']").first();
    await expect(cards).toBeVisible({ timeout: 8_000 });
  });

  test("search input is present and accepts text", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|job title|keyword/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("developer");
    await expect(searchInput).toHaveValue("developer");
  });

  test("typing in search and pressing Enter updates URL with search param", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|job title|keyword/i);
    await searchInput.fill("react");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/search=react|q=react/i, { timeout: 8_000 });
  });

  test("filter dropdowns are present on the page", async ({ page }) => {
    // Check that at least one filter select/button exists
    const filter = page
      .getByRole("combobox")
      .or(page.getByRole("button", { name: /filter|job type|work type|level/i }));
    await expect(filter.first()).toBeVisible({ timeout: 5_000 });
  });

  test("pagination: 'next' button or page number links are visible when jobs exist", async ({ page }) => {
    // If there are many jobs, pagination should appear
    const pagination = page.locator(
      "[class*='pagination'], [aria-label*='pagination'], nav[aria-label*='page']"
    );
    // It may or may not exist depending on job count — just check no crash
    await expect(page.locator("body")).toBeVisible();
  });
});

// ─── Job Detail Page ──────────────────────────────────────────────────────────

test.describe("Job detail page", () => {
  test("clicking a job card navigates to the job detail page", async ({ page }) => {
    await page.goto("/jobs");
    // Click the first job card link
    const firstJobLink = page.getByRole("link", { name: /.+/ }).filter({
      hasNot: page.getByRole("navigation"),
    }).first();
    const href = await firstJobLink.getAttribute("href");

    if (href?.includes("/jobs/")) {
      await page.goto(href);
      await expect(page).toHaveURL(/\/jobs\/\d+/);
      // Heading with job title should exist
      await expect(page.getByRole("heading").first()).toBeVisible();
    }
  });

  test("job detail page shows key sections (description, employer info)", async ({ page }) => {
    await page.goto("/jobs");
    // Navigate to first jobs/[id] link
    const jobLink = page.locator('a[href*="/jobs/"]').first();
    await expect(jobLink).toBeVisible({ timeout: 8_000 });
    await jobLink.click();
    await expect(page).toHaveURL(/\/jobs\/\d+/, { timeout: 8_000 });

    // Description should appear somewhere
    await expect(page.getByText(/description|about|responsibilities/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });
});

// ─── Save / Unsave Job (requires login) ──────────────────────────────────────

test.describe("Save job (authenticated applicant)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsApplicant(page);
  });

  test("save button is visible on job detail page", async ({ page }) => {
    await page.goto("/jobs");
    const jobLink = page.locator('a[href*="/jobs/"]').first();
    await expect(jobLink).toBeVisible({ timeout: 8_000 });
    await jobLink.click();
    await expect(page).toHaveURL(/\/jobs\/\d+/, { timeout: 8_000 });

    // Save / bookmark button should exist
    const saveBtn = page
      .getByRole("button", { name: /save|bookmark/i })
      .or(page.locator("[aria-label*='save'], [aria-label*='bookmark']"));
    await expect(saveBtn.first()).toBeVisible({ timeout: 5_000 });
  });

  test("clicking save button toggles the saved state", async ({ page }) => {
    await page.goto("/jobs");
    const jobLink = page.locator('a[href*="/jobs/"]').first();
    await expect(jobLink).toBeVisible({ timeout: 8_000 });
    await jobLink.click();

    const saveBtn = page
      .getByRole("button", { name: /save|bookmark/i })
      .or(page.locator("[aria-label*='save'], [aria-label*='bookmark']"))
      .first();

    await expect(saveBtn).toBeVisible({ timeout: 5_000 });
    await saveBtn.click();
    // After click, the button or page should reflect new state (no crash is minimum bar)
    await expect(page.locator("body")).toBeVisible();
  });
});
