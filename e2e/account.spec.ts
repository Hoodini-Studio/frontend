import { expect, test } from "@playwright/test";
import { installApiMocks } from "./fixtures/api";
import { sampleOrder, sampleProduct } from "./fixtures/data";

test.describe("Account", () => {
  test("settings hub and profile", async ({ page }) => {
    await installApiMocks(page, { auth: "customer" });
    await page.goto("/account-settings");

    await expect(page.getByRole("heading", { name: "Account settings" })).toBeVisible();
    await page
      .getByRole("navigation", { name: "Account settings" })
      .getByRole("link", { name: /Profile/i })
      .click();
    await expect(page).toHaveURL(/\/account-settings\/profile/);
    await expect(page.getByText("Ada Customer")).toBeVisible();
  });

  test("language settings", async ({ page }) => {
    await installApiMocks(page, { auth: "customer" });
    await page.goto("/account-settings/language");

    await expect(page.getByRole("heading", { name: "Language" })).toBeVisible();
    await page.getByRole("button", { name: "Albanian" }).click();
    await expect(page.getByText("Language updated.")).toBeVisible();
  });

  test("email preferences", async ({ page }) => {
    await installApiMocks(page, { auth: "customer" });
    await page.goto("/account-settings/emails");

    await expect(page.getByRole("heading", { name: "Email preferences" })).toBeVisible();
    await page.getByRole("switch", { name: "Studio updates" }).click();
    await expect(page.getByText("Email preferences updated.")).toBeVisible();
  });

  test("shipping address form", async ({ page }) => {
    await installApiMocks(page, { auth: "customer" });
    await page.goto("/account-settings/address");

    await expect(page.getByRole("heading", { name: "Shipping address" })).toBeVisible();
    await page.getByLabel("City").fill("Prizren");
    await page.getByRole("button", { name: "Save address" }).click();
    await expect(page.getByText("Address saved.")).toBeVisible();
  });

  test("my orders list and detail", async ({ page }) => {
    await installApiMocks(page, { auth: "customer" });
    await page.goto("/orders");

    await expect(page.getByText(sampleOrder.number)).toBeVisible();
    await page.locator(`a[href="/orders/${sampleOrder.id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/orders/${sampleOrder.id}`), {
      timeout: 15_000,
    });
    await expect(page.getByText(sampleProduct.name)).toBeVisible();
  });

  test("favourites empty and with items", async ({ page }) => {
    const api = await installApiMocks(page, { auth: "customer" });
    await page.goto("/favourites");
    await expect(page.getByText("No favourites yet")).toBeVisible();

    api.setFavouriteIds([sampleProduct.id]);
    await page.reload();
    await expect(page.getByText(sampleProduct.name)).toBeVisible();
  });
});
