import { expect, test } from "./fixtures/test";
import { installApiMocks } from "./fixtures/api";
import { sampleProduct } from "./fixtures/data";

async function revealCategoryNav(page: import("@playwright/test").Page) {
  await page.locator("#the-drop").scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "All" })).toBeVisible();
}

test.describe("Storefront", () => {
  test("homepage shows drop, packs, discovery, and newsletter for guests", async ({
    page,
  }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/");

    await expect(page.getByRole("link", { name: /Hoodini/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Wear the/i })).toBeVisible();
    await expect(page.getByText(sampleProduct.name)).toBeVisible();
    await expect(page.getByText("2 products")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Packs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Filters" })).toBeVisible();
    await revealCategoryNav(page);
    await expect(page.getByRole("button", { name: "Anime" }).first()).toBeVisible();
    await expect(page.locator("#newsletter")).toContainText("Stay in the night");
    await expect(page.getByRole("contentinfo")).toContainText("Terms of Service");
    await expect(page.getByRole("contentinfo")).toContainText("Privacy Policy");
  });

  test("product detail add to cart flow", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto(`/products/${sampleProduct.slug}`);

    await expect(page.getByRole("heading", { name: sampleProduct.name })).toBeVisible();
    await expect(page.getByText("45.00 €")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Anime" }),
    ).toHaveAttribute("href", "/?collection=anime");

    await page.getByRole("button", { name: "Black" }).click();
    await page.getByRole("button", { name: "M", exact: true }).click();
    await page.getByRole("button", { name: "Add to cart" }).click();

    await expect(page.getByRole("button", { name: "Added to cart" })).toBeVisible();
  });

  test("discovery rail filters the drop", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/");

    await revealCategoryNav(page);
    await page.getByRole("button", { name: "Anime" }).first().click();
    await expect(page).toHaveURL(/\?collection=anime/);
    await expect(page.getByRole("heading", { name: "The Drop" })).toBeVisible();
  });

  test("quick view opens from product stage", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/");

    await page.getByRole("button", { name: "Quick view" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(sampleProduct.name)).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
