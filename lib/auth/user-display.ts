import type { User } from "@/types/user";

export function getUserInitials(name: string): string {
  const first = name.trim().charAt(0);

  return first ? first.toUpperCase() : "?";
}

export function getUserAvatarUrl(user: User): string | null {
  return user.avatar_url ?? null;
}
