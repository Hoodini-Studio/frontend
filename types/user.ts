export type User = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  preferred_locale: "sq" | "en";
  phone?: string | null;
  shipping_country_code?: "XK" | "AL" | "MK" | null;
  shipping_city?: string | null;
  shipping_address_line?: string | null;
  shipping_postal_code?: string | null;
  marketing_new_drops: boolean;
  marketing_studio_updates: boolean;
  marketing_prefs_updated_at: string | null;
  avatar_url?: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
};

export type EmailPreferencesInput = {
  marketing_new_drops?: boolean;
  marketing_studio_updates?: boolean;
};

export type AuthResponse = {
  data: User;
};
