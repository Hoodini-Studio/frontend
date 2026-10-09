import { getSiteUrl } from "@/lib/site";

export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Product node from fields the API actually returned.
 * Omits ratings and availability: the catalog has no reviews and no inventory.
 */
export function productJsonLd(input: {
  name: string;
  description?: string | null;
  url: string;
  image?: string | null;
  priceCents?: number | null;
}): Record<string, unknown> | null {
  const name = input.name.trim();
  if (!name) {
    return null;
  }

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url: input.url,
  };

  const description = input.description?.trim();
  if (description) {
    data.description = description;
  }

  const image = input.image?.trim();
  if (image) {
    data.image = image;
  }

  if (
    typeof input.priceCents === "number" &&
    Number.isFinite(input.priceCents) &&
    input.priceCents >= 0
  ) {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (input.priceCents / 100).toFixed(2),
      url: input.url,
    };
  }

  return data;
}

/** Site identity only. No logo URL until a public logo file exists. */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hoodini Studio",
    url: getSiteUrl(),
  };
}
