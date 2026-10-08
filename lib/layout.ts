/**
 * Shared horizontal page shells.
 * Keep storefront + admin list/dashboard widths aligned with the site header (max-w-6xl).
 */
export const PAGE_WIDTH = {
  /** Catalog, admin lists, dashboard, header/footer */
  shell: "max-w-6xl",
  /** Cart and similar focused commerce flows */
  content: "max-w-4xl",
  /** Legal docs, order detail, long-form reading */
  reading: "max-w-3xl",
  /** Settings + product forms */
  form: "max-w-2xl",
} as const;

export function pageShellClass(
  width: keyof typeof PAGE_WIDTH = "shell",
  extra = "",
): string {
  return ["mx-auto w-full px-6", PAGE_WIDTH[width], extra].filter(Boolean).join(" ");
}
