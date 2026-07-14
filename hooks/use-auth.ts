"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
} from "@/schemas/auth";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        return response.data;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }

        throw error;
      }
    },
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginInput) => login(credentials),
    onSuccess: (response) => {
      queryClient.setQueryData(["auth", "user"], response.data);
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (credentials: RegisterInput) => register(credentials),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.removeQueries({ queryKey: ["auth", "user"] });
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordInput) => forgotPassword(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordInput) => resetPassword(payload),
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordInput) => changePassword(payload),
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: (payload: ResendVerificationInput) => resendVerification(payload),
  });
}
