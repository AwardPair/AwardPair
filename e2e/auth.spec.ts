import { expect, test } from "@playwright/test";

test.describe("Sign in", () => {
  test("nav shows Sign In / Account when signed out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sign In / Account" }).first()).toBeVisible();
  });

  test("nav sign-in link goes to the sign-in page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign In / Account" }).first().click();
    await expect(page).toHaveURL(/\/auth\/sign-in$/);
    await expect(page.getByRole("heading", { name: /sign in to awardpair/i })).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  });

  test("submitting an unparseable email is blocked by native validation, not a crash", async ({ page }) => {
    await page.goto("/auth/sign-in");
    const emailInput = page.getByLabel("Email", { exact: true });
    await emailInput.fill("not-an-email");
    await page.getByRole("button", { name: /send sign-in link/i }).click();
    // Browser-native type="email" validation blocks submission before our
    // server action runs — the page should stay put, not crash or navigate.
    await expect(page).toHaveURL(/\/auth\/sign-in$/);
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isValid).toBe(false);
  });

  test("a bad or expired magic link resolves to a non-crashing error page", async ({ page }) => {
    const response = await page.goto("/auth/callback?code=not-a-real-code");
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/auth\/error$/);
    await expect(page.getByRole("heading", { name: /didn.t work/i })).toBeVisible();
  });

  test("/wallet redirects signed-out visitors to sign-in and remembers where to return", async ({ page }) => {
    await page.goto("/wallet");
    await expect(page).toHaveURL(/\/auth\/sign-in\?next=\/wallet$/);
  });
});
