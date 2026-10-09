import type { Page, Route } from "@playwright/test";
import type { Cart, Order } from "@/types/commerce";
import type { User as AuthUser } from "@/types/user";
import {
  API_ORIGIN,
  adminUser,
  categories,
  collections,
  colors,
  customerUser,
  emptyCart,
  filledCart,
  genders,
  listMeta,
  packCart,
  sampleCoupon,
  sampleOrder,
  samplePack,
  sampleProduct,
  sampleProductB,
  shippingZones,
  sizes,
} from "./data";

export type AuthMode = "guest" | "customer" | "admin";

export type ApiMockOptions = {
  auth?: AuthMode;
  cart?: Cart;
  orders?: Order[];
  userOverrides?: Partial<AuthUser>;
};

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

async function fulfillJson(route: Route, status: number, body: Json) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

function currentUser(auth: AuthMode, overrides?: Partial<AuthUser>): AuthUser | null {
  if (auth === "guest") {
    return null;
  }

  const base = auth === "admin" ? adminUser : customerUser;
  return { ...base, ...overrides };
}

function pathname(url: URL): string {
  return url.pathname.replace(/\/$/, "") || "/";
}

export async function installApiMocks(page: Page, options: ApiMockOptions = {}) {
  let auth = options.auth ?? "guest";
  let cart = options.cart ?? (auth === "guest" ? emptyCart : emptyCart);
  let favouriteIds: string[] = [];
  let orders = options.orders ?? [sampleOrder];
  let user = currentUser(auth, options.userOverrides);
  let coupons = [sampleCoupon];
  let zones = [...shippingZones];

  await page.route(
    (url) => {
      const href = url.href;
      return (
        href.includes("localhost:8000") ||
        href.includes("127.0.0.1:8000") ||
        href.startsWith(`${API_ORIGIN}/`)
      );
    },
    async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = pathname(url);
    const method = request.method().toUpperCase();

    if (path === "/sanctum/csrf-cookie") {
      await route.fulfill({
        status: 204,
        headers: {
          "Set-Cookie": "XSRF-TOKEN=test-xsrf; Path=/",
        },
      });
      return;
    }

    if (path === "/api/user" && method === "GET") {
      if (!user) {
        await fulfillJson(route, 401, { message: "Unauthenticated." });
        return;
      }
      await fulfillJson(route, 200, { data: user });
      return;
    }

    if (path === "/api/auth/login" && method === "POST") {
      const body = request.postDataJSON() as { email?: string };
      user =
        body.email?.includes("admin")
          ? { ...adminUser }
          : { ...customerUser, email: body.email ?? customerUser.email };
      auth = user.roles.includes("admin") ? "admin" : "customer";
      await fulfillJson(route, 200, { data: user });
      return;
    }

    if (path === "/api/auth/register" && method === "POST") {
      await fulfillJson(route, 201, {
        message: "Registration successful. Please check your email to verify your account.",
      });
      return;
    }

    if (path === "/api/auth/logout" && method === "POST") {
      user = null;
      auth = "guest";
      await fulfillJson(route, 200, { message: "Logged out successfully." });
      return;
    }

    if (path === "/api/auth/forgot-password" && method === "POST") {
      await fulfillJson(route, 200, {
        message: "If that email address exists, we sent a password reset link.",
      });
      return;
    }

    if (path === "/api/auth/reset-password" && method === "POST") {
      await fulfillJson(route, 200, { message: "Password reset successfully." });
      return;
    }

    if (path === "/api/auth/email/resend" && method === "POST") {
      await fulfillJson(route, 200, {
        message: "If that account needs verification, we sent a new email.",
      });
      return;
    }

    if (path === "/api/auth/change-password" && method === "POST") {
      await fulfillJson(route, 200, { message: "Password changed successfully." });
      return;
    }

    if (path === "/api/auth/preferred-locale" && method === "PATCH") {
      const body = request.postDataJSON() as { preferred_locale: "en" | "sq" };
      if (user) {
        user = { ...user, preferred_locale: body.preferred_locale };
      }
      await fulfillJson(route, 200, { data: user });
      return;
    }

    if (path === "/api/auth/email-preferences" && method === "PATCH") {
      const body = request.postDataJSON() as {
        marketing_new_drops?: boolean;
        marketing_studio_updates?: boolean;
      };
      if (user) {
        user = {
          ...user,
          marketing_new_drops: body.marketing_new_drops ?? user.marketing_new_drops,
          marketing_studio_updates:
            body.marketing_studio_updates ?? user.marketing_studio_updates,
        };
      }
      await fulfillJson(route, 200, { data: user });
      return;
    }

    if (path === "/api/auth/shipping-profile" && method === "PATCH") {
      const body = request.postDataJSON() as Partial<AuthUser>;
      if (user) {
        user = { ...user, ...body };
      }
      await fulfillJson(route, 200, { data: user });
      return;
    }

    if (path === "/api/categories" && method === "GET") {
      await fulfillJson(route, 200, { data: categories });
      return;
    }
    if (path === "/api/collections" && method === "GET") {
      await fulfillJson(route, 200, { data: collections });
      return;
    }
    if (path === "/api/colors" && method === "GET") {
      await fulfillJson(route, 200, { data: colors });
      return;
    }
    if (path === "/api/sizes" && method === "GET") {
      await fulfillJson(route, 200, { data: sizes });
      return;
    }
    if (path === "/api/genders" && method === "GET") {
      await fulfillJson(route, 200, { data: genders });
      return;
    }

    if (path === "/api/products" && method === "GET") {
      await fulfillJson(route, 200, {
        data: [sampleProduct, sampleProductB],
        meta: listMeta(2),
      });
      return;
    }

    if (path === `/api/products/${sampleProduct.slug}` && method === "GET") {
      await fulfillJson(route, 200, { data: sampleProduct });
      return;
    }

    if (path === `/api/products/${sampleProductB.slug}` && method === "GET") {
      await fulfillJson(route, 200, { data: sampleProductB });
      return;
    }

    if (path === "/api/bundles" && method === "GET") {
      await fulfillJson(route, 200, {
        data: [samplePack],
        meta: listMeta(1),
      });
      return;
    }

    if (path === `/api/bundles/${samplePack.slug}` && method === "GET") {
      await fulfillJson(route, 200, { data: samplePack });
      return;
    }

    if (path === "/api/cart" && method === "GET") {
      await fulfillJson(route, 200, { data: cart });
      return;
    }

    if (path === "/api/cart/items" && method === "POST") {
      const body = (request.postDataJSON() ?? {}) as {
        bundle_id?: string;
        product_id?: string;
      };
      cart = body.bundle_id ? packCart : filledCart;
      await fulfillJson(route, 200, { data: cart });
      return;
    }

    if (path.startsWith("/api/cart/items/") && method === "PATCH") {
      const body = request.postDataJSON() as { quantity: number };
      cart = {
        ...filledCart,
        items: filledCart.items.map((item) => ({
          ...item,
          quantity: body.quantity,
          line_total_cents: item.unit_price_cents * body.quantity,
        })),
        item_count: body.quantity,
        subtotal_cents: filledCart.items[0]!.unit_price_cents * body.quantity,
      };
      await fulfillJson(route, 200, { data: cart });
      return;
    }

    if (path.startsWith("/api/cart/items/") && method === "DELETE") {
      cart = emptyCart;
      await fulfillJson(route, 200, { data: cart });
      return;
    }

    if (path === "/api/favourites/ids" && method === "GET") {
      await fulfillJson(route, 200, {
        data: favouriteIds,
        meta: { count: favouriteIds.length },
      });
      return;
    }

    if (path === "/api/favourites" && method === "GET") {
      const data = favouriteIds.includes(sampleProduct.id) ? [sampleProduct] : [];
      await fulfillJson(route, 200, {
        data,
        meta: { count: data.length },
      });
      return;
    }

    if (path === "/api/favourites" && method === "POST") {
      favouriteIds = [sampleProduct.id];
      await fulfillJson(route, 200, {
        data: favouriteIds,
        meta: { count: favouriteIds.length },
      });
      return;
    }

    if (path.startsWith("/api/favourites/") && method === "DELETE") {
      favouriteIds = [];
      await fulfillJson(route, 200, {
        data: favouriteIds,
        meta: { count: 0 },
      });
      return;
    }

    if (path === "/api/shipping/zones" && method === "GET") {
      await fulfillJson(route, 200, { data: zones });
      return;
    }

    if (path === "/api/checkout/quote" && method === "POST") {
      const body = request.postDataJSON() as { coupon_code?: string | null };
      const discount = body.coupon_code ? 450 : 0;
      await fulfillJson(route, 200, {
        data: {
          subtotal_cents: cart.subtotal_cents || filledCart.subtotal_cents,
          shipping_cents: 300,
          discount_cents: discount,
          total_cents: (cart.subtotal_cents || filledCart.subtotal_cents) + 300 - discount,
          item_count: cart.item_count || filledCart.item_count,
          country_code: "XK",
          coupon_code: body.coupon_code ?? null,
        },
      });
      return;
    }

    if (path === "/api/checkout" && method === "POST") {
      cart = emptyCart;
      await fulfillJson(route, 201, { data: sampleOrder });
      return;
    }

    if (path === "/api/orders" && method === "GET") {
      await fulfillJson(route, 200, {
        data: orders,
        meta: listMeta(orders.length),
      });
      return;
    }

    if (path.startsWith("/api/orders/") && method === "GET") {
      const id = path.split("/").pop();
      const order = orders.find((item) => item.id === id) ?? sampleOrder;
      await fulfillJson(route, 200, { data: order });
      return;
    }

    if (path === "/api/newsletter/subscribe" && method === "POST") {
      await fulfillJson(route, 200, {
        message: "If that email is valid, it is subscribed to the newsletter.",
      });
      return;
    }

    if (path.startsWith("/api/newsletter/unsubscribe") && method === "GET") {
      await fulfillJson(route, 200, {
        message: "You have been unsubscribed from the newsletter.",
      });
      return;
    }

    // Admin catalog
    if (path === "/api/admin/categories" && method === "GET") {
      await fulfillJson(route, 200, { data: categories });
      return;
    }
    if (path === "/api/admin/collections" && method === "GET") {
      await fulfillJson(route, 200, { data: collections });
      return;
    }
    if (path === "/api/admin/colors" && method === "GET") {
      await fulfillJson(route, 200, { data: colors });
      return;
    }
    if (path === "/api/admin/sizes" && method === "GET") {
      await fulfillJson(route, 200, { data: sizes });
      return;
    }
    if (path === "/api/admin/genders" && method === "GET") {
      await fulfillJson(route, 200, { data: genders });
      return;
    }

    if (path === "/api/admin/products" && method === "GET") {
      await fulfillJson(route, 200, {
        data: [sampleProduct, sampleProductB],
        meta: listMeta(2),
      });
      return;
    }

    if (path === `/api/admin/products/${sampleProduct.id}` && method === "GET") {
      await fulfillJson(route, 200, { data: sampleProduct });
      return;
    }

    if (path === `/api/admin/products/${sampleProductB.id}` && method === "GET") {
      await fulfillJson(route, 200, { data: sampleProductB });
      return;
    }

    if (path === "/api/admin/bundles" && method === "GET") {
      await fulfillJson(route, 200, {
        data: [samplePack],
        meta: listMeta(1),
      });
      return;
    }

    if (path === `/api/admin/bundles/${samplePack.id}` && method === "GET") {
      await fulfillJson(route, 200, { data: samplePack });
      return;
    }

    if (path === "/api/admin/bundles" && method === "POST") {
      await fulfillJson(route, 201, { data: samplePack });
      return;
    }

    if (path === `/api/admin/bundles/${samplePack.id}` && method === "PATCH") {
      const body = (request.postDataJSON() ?? {}) as Partial<typeof samplePack>;
      await fulfillJson(route, 200, { data: { ...samplePack, ...body } });
      return;
    }

    if (path === `/api/admin/bundles/${samplePack.id}` && method === "DELETE") {
      await fulfillJson(route, 200, { message: "Pack deleted successfully." });
      return;
    }

    if (path === "/api/admin/orders" && method === "GET") {
      await fulfillJson(route, 200, {
        data: orders,
        meta: listMeta(orders.length),
      });
      return;
    }

    if (path === `/api/admin/orders/${sampleOrder.id}` && method === "GET") {
      await fulfillJson(route, 200, { data: sampleOrder });
      return;
    }

    if (path.endsWith("/status") && path.includes("/api/admin/orders/") && method === "PATCH") {
      const body = request.postDataJSON() as { status: Order["status"] };
      const updated = { ...sampleOrder, status: body.status };
      orders = [updated];
      await fulfillJson(route, 200, { data: updated });
      return;
    }

    if (
      path.endsWith("/payment-status") &&
      path.includes("/api/admin/orders/") &&
      method === "PATCH"
    ) {
      const body = request.postDataJSON() as { payment_status: Order["payment_status"] };
      const updated = { ...sampleOrder, payment_status: body.payment_status };
      orders = [updated];
      await fulfillJson(route, 200, { data: updated });
      return;
    }

    if (path === "/api/admin/shipping/zones" && method === "GET") {
      await fulfillJson(route, 200, { data: zones });
      return;
    }

    if (path.startsWith("/api/admin/shipping/zones/") && method === "PATCH") {
      const id = path.split("/").pop();
      const body = request.postDataJSON() as Partial<(typeof zones)[number]>;
      zones = zones.map((zone) => (zone.id === id ? { ...zone, ...body } : zone));
      const updated = zones.find((zone) => zone.id === id)!;
      await fulfillJson(route, 200, { data: updated });
      return;
    }

    if (path === "/api/admin/coupons" && method === "GET") {
      await fulfillJson(route, 200, { data: coupons });
      return;
    }

    if (path === "/api/admin/coupons" && method === "POST") {
      const body = request.postDataJSON() as typeof sampleCoupon;
      const created = {
        ...sampleCoupon,
        ...body,
        id: `coupon-${coupons.length + 1}`,
        uses_count: 0,
        created_at: sampleCoupon.created_at,
        updated_at: sampleCoupon.updated_at,
      };
      coupons = [...coupons, created];
      await fulfillJson(route, 201, { data: created });
      return;
    }

    if (path.startsWith("/api/admin/coupons/") && method === "DELETE") {
      const id = path.split("/").pop();
      coupons = coupons.filter((coupon) => coupon.id !== id);
      await fulfillJson(route, 200, { message: "Deleted." });
      return;
    }

    if (path === "/api/admin/newsletter" && method === "GET") {
      await fulfillJson(route, 200, {
        data: [
          {
            id: "sub-1",
            email: "guest@example.com",
            is_active: true,
            subscribed_at: "2026-01-01T00:00:00.000000Z",
            unsubscribed_at: null,
            created_at: "2026-01-01T00:00:00.000000Z",
            updated_at: "2026-01-01T00:00:00.000000Z",
          },
        ],
        meta: listMeta(1),
      });
      return;
    }

    if (path.startsWith("/api/admin/newsletter/export") && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "text/csv",
        headers: {
          "Content-Disposition": 'attachment; filename="newsletter-emails.csv"',
        },
        body: "email\nguest@example.com\n",
      });
      return;
    }

    if (path === "/api/admin/users" && method === "GET") {
      await fulfillJson(route, 200, {
        data: [customerUser, adminUser],
        meta: listMeta(2),
      });
      return;
    }

    // Fallback so missing mocks fail loudly in tests
    await fulfillJson(route, 404, {
      message: `Unmocked API route: ${method} ${path}`,
    });
  },
  );

  return {
    setAuth(next: AuthMode) {
      auth = next;
      user = currentUser(next, options.userOverrides);
    },
    setCart(next: Cart) {
      cart = next;
    },
    setFavouriteIds(ids: string[]) {
      favouriteIds = ids;
    },
  };
}
