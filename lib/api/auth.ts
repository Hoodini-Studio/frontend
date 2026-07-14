import { apiRequest } from "@/lib/api/client";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
} from "@/schemas/auth";
import type { AuthResponse } from "@/types/user";

export type RegisterResponse = AuthResponse & {
  message: string;
};

export function getCurrentUser() {
  return apiRequest<AuthResponse>("/api/user");
}

export function login(credentials: LoginInput) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function register(credentials: RegisterInput) {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: credentials,
  });
}

export function logout() {
  return apiRequest<{ message: string }>("/api/auth/logout", {
    method: "POST",
    body: {},
  });
}

export function forgotPassword(payload: ForgotPasswordInput) {
  return apiRequest<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

export function resetPassword(payload: ResetPasswordInput) {
  return apiRequest<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}

export function changePassword(payload: ChangePasswordInput) {
  return apiRequest<{ message: string }>("/api/auth/change-password", {
    method: "POST",
    body: payload,
  });
}

export function resendVerification(payload: ResendVerificationInput) {
  return apiRequest<{ message: string }>("/api/auth/email/resend", {
    method: "POST",
    body: payload,
  });
}
