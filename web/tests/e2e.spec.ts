import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("ShiftPal workforce coordination")).toBeVisible();
});

test("dashboard shows approval card", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("Approvals")).toBeVisible();
});
