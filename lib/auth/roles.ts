import type { User } from "@/types/user";

export const ADMIN_ROLE = "admin";

export function isAdmin(user: User | null | undefined): boolean {
  return user?.roles.includes(ADMIN_ROLE) ?? false;
}

export function getPostAuthPath(user: User): string {
  return isAdmin(user) ? "/admin/dashboard" : "/";
}

export function getHomePathForUser(user: User | null | undefined): string {
  return isAdmin(user) ? "/admin/dashboard" : "/";
}
