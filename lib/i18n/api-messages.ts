export const API_MESSAGE_KEYS = {
  "The given data was invalid.": "givenDataInvalid",
  "Request failed": "requestFailed",
  "Too Many Attempts.": "tooManyAttempts",

  "The provided credentials are incorrect.": "credentialsIncorrect",
  "Please verify your email address before signing in.": "verifyEmailBeforeSignIn",
  "The current password is incorrect.": "currentPasswordIncorrect",
  "Invalid verification link.": "invalidVerificationLink",

  "Registration successful. Please check your email to verify your account.":
    "registrationSuccessful",
  "Logged out successfully.": "loggedOut",
  "If that email address exists, we sent a password reset link.": "passwordResetLinkSent",
  "Password reset successfully.": "passwordResetSuccessful",
  "Password changed successfully.": "passwordChanged",
  "If that account needs verification, we sent a new email.": "verificationEmailSent",

  "This password reset token is invalid.": "passwordResetTokenInvalid",
  "We can't find a user with that email address.": "passwordResetUserNotFound",
  "Please wait before retrying.": "passwordResetThrottled",
  "passwords.token": "passwordResetTokenInvalid",
  "passwords.user": "passwordResetUserNotFound",
  "passwords.throttled": "passwordResetThrottled",

  "The name field is required.": "nameRequired",
  "The email field is required.": "emailRequired",
  "The password field is required.": "passwordRequired",
  "The token field is required.": "tokenRequired",
  "The current password field is required.": "currentPasswordRequired",
  "The email field must be a valid email address.": "emailInvalid",
  "The email has already been taken.": "emailTaken",
  "The password field must be at least 8 characters.": "passwordMin",
  "The password field confirmation does not match.": "passwordConfirmation",
  "The preferred locale field is required.": "preferredLocaleRequired",
  "The selected preferred locale is invalid.": "preferredLocaleInvalid",
  "At least one product image is required.": "atLeastOneProductImageRequired",

  "Invalid coupon code.": "couponCodeInvalid",
  "Coupon is inactive.": "couponInactive",
  "Coupon not active yet.": "couponNotActiveYet",
  "Coupon has expired.": "couponExpired",
  "Coupon usage limit reached.": "couponUsageLimit",
  "Max uses per user exceeded.": "couponUserLimit",
  "Cart subtotal too low.": "couponSubtotalTooLow",

  "If that email is valid, it is subscribed to the newsletter.": "newsletterSubscribed",
  "You have been unsubscribed from the newsletter.": "newsletterUnsubscribed",
} as const;

export type ApiMessageKey = (typeof API_MESSAGE_KEYS)[keyof typeof API_MESSAGE_KEYS];

type TranslateFn = (key: ApiMessageKey) => string;

export function translateApiMessage(
  message: string | undefined | null,
  t: TranslateFn,
): string {
  if (!message) {
    return t("requestFailed");
  }

  const key = API_MESSAGE_KEYS[message as keyof typeof API_MESSAGE_KEYS];
  return key ? t(key) : message;
}

export function translateApiFieldErrors(
  errors: Record<string, string[]>,
  t: TranslateFn,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      messages.map((message) => translateApiMessage(message, t)),
    ]),
  );
}

export function isVerifyEmailRequiredError(message: string | undefined): boolean {
  if (!message) {
    return false;
  }

  return (
    message === "Please verify your email address before signing in." ||
    message.toLowerCase().includes("verify your email")
  );
}
