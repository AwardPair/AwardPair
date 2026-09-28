import { expect, test } from "@playwright/test";

test.describe("Explore — Pairs (default)", () => {
  test("shows Pair results by default with score, economics, and a detail link", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByRole("tab", { name: "Pairs" })).toHaveAttribute("aria-selected", "true");

    await expect(page.getByText("Net cash cost").first()).toBeVisible();
    await expect(page.getByText("Perk-adjusted (subjective)").first()).toBeVisible();
    await expect(page.getByText("Why this pair ranks highly").first()).toBeVisible();
  });

  test("switching to Flights shows a sortable table", async ({ page }) => {
    await page.goto("/explore?tab=flights");
    await expect(page.getByRole("tab", { name: "Flights" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /route/i })).toBeVisible();
  });

  test("switching to Hotels shows hotel cards with program and confidence info", async ({ page }) => {
    await page.goto("/explore?tab=hotels");
    await expect(page.getByRole("tab", { name: "Hotels" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText(/confidence/i).first()).toBeVisible();
  });

  test("a search outside the fixture window shows a friendly empty state, not a crash", async ({ page }) => {
    await page.goto("/explore?tab=pairs&departFrom=2030-01-01&departTo=2030-01-02");
    await expect(page.getByText(/no award-flight \+ hotel pairs found/i)).toBeVisible();
  });

  test("following a Pair's full-page link opens a real detail page with the economics breakdown", async ({ page }) => {
    await page.goto("/explore");
    await page.getByRole("link", { name: /full page/i }).first().click();
    await expect(page).toHaveURL(/\/pairs\/.+/);
    await expect(page.getByText("Reference / gross hotel cost")).toBeVisible();
    await expect(page.getByText("Net cash cost", { exact: true })).toBeVisible();
    await expect(page.getByText(/perk-adjusted value \(subjective/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /verify on/i })).toBeVisible();
  });

  test("a malformed Pair id resolves to a non-crashing not-found state", async ({ page }) => {
    const response = await page.goto("/pairs/not-a-real-pair-id");
    expect(response?.status()).toBeLessThan(500);
    await expect(page.getByRole("heading", { name: /pair not found/i })).toBeVisible();
  });
});

test.describe("Pair Calendar", () => {
  test("shows one cell per date in the fixture window, linking into Explore", async ({ page }) => {
    await page.goto("/pair-calendar");
    await expect(page.getByRole("heading", { name: "Pair Calendar" })).toBeVisible();
    await expect(page.getByText("Wed, Apr 1")).toBeVisible();
    await expect(page.getByText("Sat, Apr 11")).toBeVisible();
  });
});
