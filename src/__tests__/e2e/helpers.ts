/**
 * Shared E2E test helpers and page-object utilities.
 * Import these in every spec to keep tests DRY.
 */
import { Page, expect } from "@playwright/test";

// ─── Test Credentials ────────────────────────────────────────────────────────
// These users must exist in your dev database before running E2E tests.
// Run the app, register them manually once, then E2E tests can login as them.

export const TEST_APPLICANT = {
  name: "E2E Applicant",
  email: "e2e.applicant@test.com",
  password: "TestPass1",
};

export const TEST_EMPLOYER = {
  name: "E2E Employer Corp",
  email: "e2e.employer@test.com",
  password: "TestPass1",
};

// ─── Page Object Helpers ──────────────────────────────────────────────────────

export async function loginAs(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /login|sign in/i }).click();
  // Wait for redirect away from /login
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 10_000,
  });
}

export async function loginAsApplicant(page: Page): Promise<void> {
  await loginAs(page, TEST_APPLICANT.email, TEST_APPLICANT.password);
}

export async function loginAsEmployer(page: Page): Promise<void> {
  await loginAs(page, TEST_EMPLOYER.email, TEST_EMPLOYER.password);
}

export async function logout(page: Page): Promise<void> {
  // Try common logout button selectors
  const logoutBtn = page
    .getByRole("button", { name: /logout|sign out/i })
    .or(page.getByText(/logout|sign out/i).first());
  await logoutBtn.click();
  await page.waitForURL("**/login", { timeout: 8_000 });
}

/** Wait for a toast/notification containing `text` to appear */
export async function expectToast(page: Page, text: string | RegExp): Promise<void> {
  const toast = page.locator("[data-sonner-toast], [role='status'], .toast").filter({
    hasText: text,
  });
  await expect(toast).toBeVisible({ timeout: 8_000 });
}

/** Fill a form field by its label text */
export async function fillByLabel(
  page: Page,
  label: string | RegExp,
  value: string
): Promise<void> {
  await page.getByLabel(label).fill(value);
}
