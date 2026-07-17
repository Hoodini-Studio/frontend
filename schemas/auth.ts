import { z } from "zod";

type TranslateFn = (key: string) => string;

export function createLoginSchema(t: TranslateFn) {
  return z.object({
    email: z.string().email(t("email")),
    password: z.string().min(1, t("passwordRequired")),
  });
}

export function createRegisterSchema(t: TranslateFn) {
  return createLoginSchema(t)
    .extend({
      name: z.string().min(1, t("nameRequired")),
      password: z.string().min(8, t("passwordMin")),
      password_confirmation: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("passwordsDoNotMatch"),
      path: ["password_confirmation"],
    });
}

export function createForgotPasswordSchema(t: TranslateFn) {
  return z.object({
    email: z.string().email(t("email")),
  });
}

export function createResetPasswordSchema(t: TranslateFn) {
  return z
    .object({
      email: z.string().email(t("email")),
      token: z.string().min(1, t("resetTokenRequired")),
      password: z.string().min(8, t("passwordMin")),
      password_confirmation: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("passwordsDoNotMatch"),
      path: ["password_confirmation"],
    });
}

export function createChangePasswordSchema(t: TranslateFn) {
  return z
    .object({
      current_password: z.string().min(1, t("currentPasswordRequired")),
      password: z.string().min(8, t("passwordMin")),
      password_confirmation: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("passwordsDoNotMatch"),
      path: ["password_confirmation"],
    });
}

export const createResendVerificationSchema = createForgotPasswordSchema;

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>;
export type ForgotPasswordInput = z.infer<ReturnType<typeof createForgotPasswordSchema>>;
export type ResetPasswordInput = z.infer<ReturnType<typeof createResetPasswordSchema>>;
export type ChangePasswordInput = z.infer<ReturnType<typeof createChangePasswordSchema>>;
export type ResendVerificationInput = ForgotPasswordInput;
