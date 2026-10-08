import { expect, test } from "@playwright/test";
import { installApiMocks } from "./fixtures/api";
import { sampleProduct } from "./fixtures/data";

test.describe("Storefront", () => {
  test("homepage shows catalog, sort, and newsletter for guests", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Hoodini Studio" })).toBeVisible();
    await expect(page.getByText(sampleProduct.name)).toBeVisible();
    await expect(page.getByText("1 product")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Sort" })).toBeVisible();
    await expect(page.locator("#newsletter")).toContainText("Newsletter");
    await expect(page.getByRole("contentinfo")).toContainText("Terms of Service");
    await expect(page.getByRole("contentinfo")).toContainText("Privacy Policy");
  });

  test("product detail add to cart flow", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto(`/products/${sampleProduct.slug}`);

    await expect(page.getByRole("heading", { name: sampleProduct.name })).toBeVisible();
    await expect(page.getByText("45.00 €")).toBeVisible();

    await page.getByRole("button", { name: "Black" }).click();
    await page.getByRole("button", { name: "M", exact: true }).click();
    await page.getByRole("button", { name: "Add to cart" }).click();

    await expect(page.getByRole("button", { name: "Added to cart" })).toBeVisible();
  });

  test("filters panel opens on catalog", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/");

    await page.getByRole("button", { name: "Filters" }).click();
    await expect(page.getByText("Category")).toBeVisible();
    await expect(page.getByText("Collection")).toBeVisible();
  });
});
