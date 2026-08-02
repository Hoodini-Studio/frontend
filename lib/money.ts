export const MIN_PRODUCT_PRICE_CENTS = 500;

export function formatPriceEntry(cents: number): string {
  const safe = Math.max(0, Math.floor(cents));
  const [whole, fraction] = (safe / 100).toFixed(2).split(".");

  return `${whole.padStart(2, "0")}.${fraction}`;
}

export function formatEuroFromCents(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}

export function appendPriceDigit(cents: number, digit: number): number {
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
    return cents;
  }

  const next = cents * 10 + digit;

  return Math.min(next, 99_999_999);
}

export function removePriceDigit(cents: number): number {
  return Math.floor(Math.max(0, cents) / 10);
}
