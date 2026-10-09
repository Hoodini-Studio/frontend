import { expect, test } from "@playwright/test";
import { installApiMocks } from "./fixtures/api";
import { packCart, samplePack, sampleProduct, sampleProductB } from "./fixtures/data";

test.describe("Packs", () => {
  test("homepage shows packs section", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Packs" })).toBeVisible();
    await expect(page.getByRole("link", { name: samplePack.name })).toBeVisible();
  });

  test("pack detail add to cart flow", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto(`/packs/${samplePack.slug}`);

    await expect(page.getByRole("heading", { name: samplePack.name })).toBeVisible();
    await expect(page.getByText("60.00 €")).toBeVisible();
    await expect(
      page.getByRole("button", { name: sampleProduct.name, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: sampleProductB.name, exact: true }),
    ).toBeVisible();

    // Single color/size per line auto-selects; add should succeed.
    await page.getByRole("button", { name: "Add pack to cart" }).click();
    await expect(page.getByRole("button", { name: "Added to cart" })).toBeVisible();
  });

  test("cart shows pack line with selections", async ({ page }) => {
    await installApiMocks(page, { auth: "guest", cart: packCart });
    await page.goto("/cart");

    await expect(page.getByRole("link", { name: samplePack.name })).toHaveAttribute(
      "href",
      `/packs/${samplePack.slug}`,
    );
    await expect(page.getByText(sampleProduct.name)).toBeVisible();
    await expect(page.getByText(sampleProductB.name)).toBeVisible();
    await expect(page.getByText("60.00 €").first()).toBeVisible();
  });

  test("admin packs list", async ({ page }) => {
    await installApiMocks(page, { auth: "admin" });
    await page.goto("/admin/packs");

    await expect(page.getByRole("heading", { name: "Packs" })).toBeVisible();
    await expect(page.getByText(samplePack.name)).toBeVisible();
    await expect(page.getByRole("link", { name: "New pack" })).toBeVisible();
  });
});
