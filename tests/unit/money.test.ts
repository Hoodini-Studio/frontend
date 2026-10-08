import { describe, expect, it } from "vitest";
import {
  appendPriceDigit,
  formatEuroFromCents,
  formatPriceEntry,
  removePriceDigit,
} from "@/lib/money";

describe("money helpers", () => {
  it("formats euro from cents", () => {
    expect(formatEuroFromCents(4500)).toBe("45.00 €");
    expect(formatEuroFromCents(0)).toBe("0.00 €");
  });

  it("formats price entry with padded whole euros", () => {
    expect(formatPriceEntry(500)).toBe("05.00");
    expect(formatPriceEntry(1234)).toBe("12.34");
  });

  it("appends and removes price digits", () => {
    expect(appendPriceDigit(12, 3)).toBe(123);
    expect(removePriceDigit(123)).toBe(12);
    expect(removePriceDigit(0)).toBe(0);
  });
});
