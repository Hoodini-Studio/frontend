import { test as base, expect, type Page } from "@playwright/test";

async function waitForHydration(page: Page): Promise<void> {
  await page.locator("html[data-hydrated='true']").waitFor({
    state: "attached",
    timeout: 30_000,
  });
}

/**
 * Clicks issued before hydration are dropped. Every navigation waits until
 * the root marker is set, including when several workers compile pages at once.
 */
export const test = base.extend({
  page: async ({ page }, run) => {
    const goto = page.goto.bind(page);
    page.goto = (async (url, options) => {
      const response = await goto(url, options);
      await waitForHydration(page);
      return response;
    }) as Page["goto"];
    await run(page);
  },
});

export { expect };
