import { describe, expect, it } from "vitest";
import { isAppLocale, normalizeLocale } from "@/lib/i18n/config";

describe("locale helpers", () => {
  it("validates app locales", () => {
    expect(isAppLocale("en")).toBe(true);
    expect(isAppLocale("sq")).toBe(true);
    expect(isAppLocale("de")).toBe(false);
  });

  it("normalizes unknown locales to default", () => {
    expect(normalizeLocale("sq")).toBe("sq");
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale(undefined)).toBe("en");
    expect(normalizeLocale("fr")).toBe("en");
  });
});

