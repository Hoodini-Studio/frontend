import { describe, expect, it } from "vitest";
import {
  API_MESSAGE_KEYS,
  isVerifyEmailRequiredError,
} from "@/lib/i18n/api-messages";

describe("api message mapping", () => {
  it("maps known API messages to i18n keys", () => {
    expect(API_MESSAGE_KEYS["The provided credentials are incorrect."]).toBe(
      "credentialsIncorrect",
    );
    expect(API_MESSAGE_KEYS["Invalid coupon code."]).toBe("couponCodeInvalid");
  });

  it("detects verify-email required errors", () => {
    expect(
      isVerifyEmailRequiredError(
        "Please verify your email address before signing in.",
      ),
    ).toBe(true);
    expect(isVerifyEmailRequiredError("The provided credentials are incorrect.")).toBe(
      false,
    );
  });
});
