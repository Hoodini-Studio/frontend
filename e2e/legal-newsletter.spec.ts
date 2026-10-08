import { expect, test } from "@playwright/test";
import { installApiMocks } from "./fixtures/api";

test.describe("Legal and newsletter", () => {
  test("terms page", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/terms");

    await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();
    await expect(page.getByText(/Hoodini Studio terms/i)).toBeVisible();
  });

  test("privacy page", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/privacy");

    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
    await expect(page.getByText(/Hoodini Studio privacy policy/i)).toBeVisible();
  });

  test("newsletter subscribe on homepage", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/");

    await page.getByPlaceholder("you@email.com").fill("news@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();
    await expect(
      page.getByText("If that email is valid, it is subscribed to the newsletter."),
    ).toBeVisible();
  });

  test("newsletter unsubscribe status page", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/newsletter/unsubscribe?status=ok");

    await expect(page.getByRole("heading", { name: "Unsubscribed" })).toBeVisible();
    await page.goto("/newsletter/unsubscribe");
    await expect(page.getByRole("heading", { name: "Link invalid" })).toBeVisible();
  });
});
