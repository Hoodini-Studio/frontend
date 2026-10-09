import { expect, test } from "./fixtures/test";
import { installApiMocks } from "./fixtures/api";
import { filledCart, sampleProduct } from "./fixtures/data";

test.describe("Cart and checkout", () => {
  test("empty cart state", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/cart");

    await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
  });

  test("filled cart shows line and checkout link", async ({ page }) => {
    await installApiMocks(page, { auth: "customer", cart: filledCart });
    await page.goto("/cart");

    await expect(page.getByText(sampleProduct.name)).toBeVisible();
    await expect(page.getByText("45.00 €").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
  });

  test("checkout places COD order for logged-in customer", async ({ page }) => {
    await installApiMocks(page, { auth: "customer", cart: filledCart });
    await page.goto("/checkout");

    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

    // Profile may prefill; ensure country is set via custom Select
    const countryTrigger = page.locator("#country_code");
    if (await countryTrigger.count()) {
      const text = await countryTrigger.innerText();
      if (!text || text.includes("Select")) {
        await countryTrigger.click();
        await page.getByRole("option", { name: "Kosovo" }).click();
      }
    }

    await page.getByRole("button", { name: /Place order|Confirm/i }).click();
    await expect(page).toHaveURL(/\/checkout\/success/);
  });

  test("guest checkout requires terms consent", async ({ page }) => {
    await installApiMocks(page, { auth: "guest", cart: filledCart });
    await page.goto("/checkout");

    await page.locator("#customer_name").fill("Guest Buyer");
    await page.locator("#phone").fill("+38344111222");
    await page.locator("#email").fill("guest@example.com");
    await page.locator("#country_code").click();
    await page.getByRole("option", { name: "Kosovo" }).click();
    await page.locator("#city").fill("Prishtina");
    await page.locator("#address_line").fill("Main St 1");
    await page.locator("#postal_code").fill("10000");

    await page.getByRole("button", { name: /Place order|Confirm/i }).click();
    await expect(page.getByText(/Terms|accept/i).first()).toBeVisible();

    await page.locator("#terms_accepted").check();
    await page.getByRole("button", { name: /Place order|Confirm/i }).click();
    await expect(page).toHaveURL(/\/checkout\/success/);
  });
});
