import { expect, test } from "@playwright/test";
import { installApiMocks } from "./fixtures/api";

test.describe("Auth", () => {
  test("login page renders and signs customer in", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveCount(0);
  });

  test("admin login lands on dashboard", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/login");

    await page.getByLabel("Email").fill("admin@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("register validates terms and succeeds", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: /Create/i })).toBeVisible();
    await page.getByLabel("Name").fill("New User");
    await page.getByLabel("Email").fill("new@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("password123");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Create|Register/i }).click();

    await expect(page).toHaveURL(/\/verify-email/);
  });

  test("forgot password page submits", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/forgot-password");

    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByRole("button", { name: "Send email" }).click();
    await expect(
      page.getByText("If that email address exists, we sent an email to change your password."),
    ).toBeVisible();
  });

  test("guest-only pages redirect authenticated customers away", async ({ page }) => {
    await installApiMocks(page, { auth: "customer" });
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test("auth-only pages redirect guests to login", async ({ page }) => {
    await installApiMocks(page, { auth: "guest" });
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/login/);
  });
});
