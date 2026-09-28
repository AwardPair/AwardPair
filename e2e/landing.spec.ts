import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows the hero headline and primary navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /find the trip your points and perks were meant for/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "AwardPair" })).toBeVisible();
    const primaryNav = page.getByRole("navigation", { name: "Primary" });
    await expect(primaryNav.getByRole("link", { name: "Explore" })).toBeVisible();
    await expect(primaryNav.getByRole("link", { name: "Pair Calendar" })).toBeVisible();
    await expect(primaryNav.getByRole("link", { name: "Alerts" })).toBeVisible();
    await expect(primaryNav.getByRole("link", { name: "My Wallet" })).toBeVisible();
  });

  test("shows the search card with all primary fields", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("From", { exact: true })).toBeVisible();
    await expect(page.getByLabel("To", { exact: true })).toBeVisible();
    await expect(page.getByLabel("When", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Travelers", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Cabin", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /search award pairs/i })).toBeVisible();
  });

  test("labels the travel wallet preview as sample data", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /your travel wallet/i })).toBeVisible();
    await expect(page.getByText("Sample", { exact: true })).toBeVisible();
  });

  test("nav links navigate to their placeholder pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Alerts" }).click();
    await expect(page).toHaveURL(/\/alerts$/);
  });
});

test.describe("Responsive layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("collapses navigation into a mobile menu", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /open menu/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Explore" })).toBeVisible();
  });
});
