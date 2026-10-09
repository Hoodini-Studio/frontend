import { describe, expect, it } from "vitest";
import { jsonLdScript, productJsonLd } from "@/lib/structured-data";

describe("product structured data", () => {
  it("uses the real price in euros and skips ratings and availability", () => {
    const data = productJsonLd({
      name: "Night Hoodie",
      description: "Heavy cotton.",
      url: "https://hoodini.studio/products/night-hoodie",
      image: "https://cdn.example/hoodie.jpg",
      priceCents: 4500,
    });

    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Night Hoodie",
      url: "https://hoodini.studio/products/night-hoodie",
      description: "Heavy cotton.",
      image: "https://cdn.example/hoodie.jpg",
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: "45.00",
        url: "https://hoodini.studio/products/night-hoodie",
      },
    });
    expect(data).not.toHaveProperty("aggregateRating");
    expect(data?.offers).not.toHaveProperty("availability");
  });

  it("omits description, image, and offers when the api did not provide them", () => {
    const data = productJsonLd({
      name: "Night Hoodie",
      url: "https://hoodini.studio/products/night-hoodie",
      priceCents: null,
    });

    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Night Hoodie",
      url: "https://hoodini.studio/products/night-hoodie",
    });
  });

  it("escapes angle brackets in the script payload", () => {
    expect(jsonLdScript({ name: "</script><script>" })).toBe(
      '{"name":"\\u003c/script>\\u003cscript>"}',
    );
  });
});
