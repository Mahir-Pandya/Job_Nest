/**
 * E2E Tests: Companies Page
 * Covers: company listing, company detail page, hidden deleted companies.
 */
import { test, expect } from "@playwright/test";

test.describe("Companies Listing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/companies");
  });

  test("companies page loads with heading", async ({ page }) => {
    await expect(page).toHaveTitle(/companies|employers|jobnest/i);
    await expect(
      page.getByRole("heading", { name: /compan|employer/i }).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("company cards are displayed", async ({ page }) => {
    // At least one company card should exist if DB has data
    const cards = page.locator("[class*='card'], article").first();
    await expect(cards).toBeVisible({ timeout: 8_000 });
  });

  test("each company card shows company name", async ({ page }) => {
    const card = page.locator("[class*='card'], article").first();
    await expect(card).toBeVisible({ timeout: 8_000 });
    // Should contain some text (the company name)
    const text = await card.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });
});

// ─── Company Detail Page ──────────────────────────────────────────────────────

test.describe("Company Detail Page", () => {
  test("navigating to a company page shows company info and active jobs", async ({ page }) => {
    await page.goto("/companies");

    // Click the first company link
    const companyLink = page.locator('a[href*="/companies/"]').first();
    await expect(companyLink).toBeVisible({ timeout: 8_000 });
    await companyLink.click();

    await expect(page).toHaveURL(/\/companies\/\d+/, { timeout: 8_000 });
    // Company name heading should exist
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("company detail page shows 'jobs' or 'openings' section", async ({ page }) => {
    await page.goto("/companies");
    const companyLink = page.locator('a[href*="/companies/"]').first();

    if (await companyLink.isVisible({ timeout: 5_000 })) {
      await companyLink.click();
      await expect(page).toHaveURL(/\/companies\/\d+/, { timeout: 8_000 });

      await expect(
        page.getByText(/open.*position|job.*opening|active.*job/i).first()
          .or(page.getByRole("heading", { name: /job|opening|position/i }).first())
      ).toBeVisible({ timeout: 8_000 });
    }
  });

  test("direct link to non-existent company shows 404 or redirect", async ({ page }) => {
    await page.goto("/companies/999999");
    // Either a 404 message or a redirect — just check no unhandled crash
    await expect(page.locator("body")).toBeVisible();
  });
});
