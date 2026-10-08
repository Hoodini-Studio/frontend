# Frontend tests

## Unit (Vitest / Vite)

```bash
npm run test
npm run test:watch
```

Covers money helpers, auth roles, locale normalization, and API message mapping.

## E2E (Playwright)

API calls are mocked in `e2e/fixtures/api.ts`, so the Laravel backend does not need to be running for these tests.

Coverage:

- Storefront catalog, filters, product detail, add to cart
- Auth (login, register, forgot password, route guards)
- Cart + guest/customer checkout
- Account settings, orders, favourites
- Admin dashboard, products, catalog, orders, shipping, coupons, newsletter, legal, users
- Terms/privacy pages and newsletter subscribe/unsubscribe

```bash
npm run test:e2e
npm run test:e2e:ui
```

Use `http://localhost` (not `127.0.0.1`) so the browser origin matches Laravel CORS when a real API is present.

First-time browser install (if needed):

```bash
npx playwright install chromium
```

## All

```bash
npm run test:all
```
