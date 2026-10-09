import { expect, test } from "@playwright/test";
import { installApiMocks } from "./fixtures/api";
import { sampleCoupon, sampleOrder, samplePack, sampleProduct } from "./fixtures/data";

test.describe("Admin", () => {
  test("dashboard loads for admin", async ({ page }) => {
    await installApiMocks(page, { auth: "admin" });
    await page.goto("/admin/dashboard");

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Packs" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  });

  test("non-admin customers are redirected away", async ({ page }) => {
    await installApiMocks(page, { auth: "customer" });
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL("/");
  });

  test("products list", async ({ page }) => {
    await installApiMocks(page, { auth: "admin" });
    await page.goto("/admin/products");

    await expect(page.getByText(sampleProduct.name)).toBeVisible();
  });

  test("packs list", async ({ page }) => {
    await installApiMocks(page, { auth: "admin" });
    await page.goto("/admin/packs");

    await expect(page.getByText(samplePack.name)).toBeVisible();
  });

  test("catalog manager", async ({ page }) => {
    await installApiMocks(page, { auth: "admin" });
    await page.goto("/admin/catalog");

    await expect(page.getByText("Hoodies / Hoodie")).toBeVisible();
    await page.getByRole("button", { name: "Collections" }).click();
    await expect(page.getByText("Anime / Anime")).toBeVisible();
  });

  test("orders list", async ({ page }) => {
    await installApiMocks(page, { auth: "admin" });
    await page.goto("/admin/orders");

    await expect(page.getByText(sampleOrder.number)).toBeVisible();
  });

  test("shipping zones", async ({ page }) => {
    await installApiMocks(page, { auth: "admin" });
    await page.goto("/admin/shipping");

    await expect(page.getByText("Kosovo / Kosovë")).toBeVisible();
    await expect(page.getByText("Albania / Shqipëri")).toBeVisible();
  });

  test("coupons", async ({ page }) => {
    await installApiMocks(page, { auth: "admin" });
    await page.goto("/admin/coupons");

    await expect(page.getByText(sampleCoupon.code)).toBeVisible();
  });

  test("newsletter subscribers", async ({ page }) => {
    await installApiMocks(page, { auth: "admin" });
    await page.goto("/admin/newsletter");

    await expect(page.getByText("guest@example.com")).toBeVisible();
  });

  test("users list", async ({ page }) => {
    await installApiMocks(page, { auth: "admin" });
    await page.goto("/admin/users");

    await expect(page.getByText("ada@example.com")).toBeVisible();
    await expect(page.getByText("admin@example.com")).toBeVisible();
  });
});
