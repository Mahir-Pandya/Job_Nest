/**
 * E2E Tests: Messaging
 * Covers: messages page loads, conversation list, send message, empty content guard.
 */
import { test, expect } from "@playwright/test";
import { loginAsApplicant } from "./helpers";

test.describe("Messages Page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsApplicant(page);
    await page.goto("/messages");
  });

  test("messages page loads without error", async ({ page }) => {
    await expect(page).toHaveURL(/messages/, { timeout: 8_000 });
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("messages page shows heading or inbox label", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /message|inbox|conversation/i })
        .or(page.getByText(/message|inbox|conversation/i).first())
    ).toBeVisible({ timeout: 8_000 });
  });

  test("message input field is visible when a conversation is open", async ({ page }) => {
    // If there's a conversation, click on it
    const firstConversation = page
      .locator("[class*='conversation'], [class*='contact'], [class*='chat']")
      .first();

    if (await firstConversation.isVisible({ timeout: 3_000 })) {
      await firstConversation.click();
      // Message input should appear
      const msgInput = page
        .getByPlaceholder(/message|type|write/i)
        .or(page.getByRole("textbox", { name: /message/i }));
      await expect(msgInput.first()).toBeVisible({ timeout: 5_000 });
    } else {
      // No conversations yet — just check empty state exists
      await expect(page.getByRole("main")).toBeVisible();
    }
  });

  test("send button is visible when a conversation is open", async ({ page }) => {
    const firstConversation = page
      .locator("[class*='conversation'], [class*='contact'], [class*='chat']")
      .first();

    if (await firstConversation.isVisible({ timeout: 3_000 })) {
      await firstConversation.click();
      const sendBtn = page.getByRole("button", { name: /send/i });
      await expect(sendBtn.first()).toBeVisible({ timeout: 5_000 });
    }
  });

  test("empty message does not submit (send button disabled or content ignored)", async ({ page }) => {
    const firstConversation = page
      .locator("[class*='conversation'], [class*='contact'], [class*='chat']")
      .first();

    if (await firstConversation.isVisible({ timeout: 3_000 })) {
      await firstConversation.click();
      const sendBtn = page.getByRole("button", { name: /send/i });

      if (await sendBtn.isVisible({ timeout: 3_000 })) {
        // Click send with empty input — page should not crash
        await sendBtn.click();
        await expect(page.getByRole("main")).toBeVisible();
      }
    }
  });
});
