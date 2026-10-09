import { type FullConfig } from "@playwright/test";

const paths = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/checkout",
  "/checkout/success",
  "/cart",
];

/** Compile the routes the suite navigates to before workers compete for them. */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) {
    return;
  }

  for (const path of paths) {
    try {
      await fetch(new URL(path, baseURL));
    } catch {
      // The web server is started before this runs. A single miss should not
      // hide a later test failure.
    }
  }
}
