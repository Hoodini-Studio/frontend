export type User = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  preferred_locale: "sq" | "en";
  avatar_url?: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  data: User;
};
