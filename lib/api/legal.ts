import { apiRequest } from "@/lib/api/client";

export type LegalSlug = "terms" | "privacy";

export type LegalPage = {
  id: string;
  slug: LegalSlug;
  locale: "en" | "sq";
  title: string;
  body: string;
  updated_at: string;
  created_at: string;
};

export type LegalPageResponse = {
  data: LegalPage;
};

export type LegalPagesResponse = {
  data: LegalPage[];
};

export type LegalLocalePayload = {
  title: string;
  body: string;
};

export type UpdateLegalPageInput = {
  en: LegalLocalePayload;
  sq: LegalLocalePayload;
};

export function getLegalPage(slug: LegalSlug, locale: string, options?: { signal?: AbortSignal }) {
  const query = new URLSearchParams({ locale });
  return apiRequest<LegalPageResponse>(`/api/legal/${slug}?${query.toString()}`, {
    method: "GET",
    skipCsrf: true,
    signal: options?.signal,
  });
}

export function listAdminLegalPages(options?: { signal?: AbortSignal }) {
  return apiRequest<LegalPagesResponse>("/api/admin/legal", {
    method: "GET",
    signal: options?.signal,
  });
}

export function updateAdminLegalPage(slug: LegalSlug, payload: UpdateLegalPageInput) {
  return apiRequest<LegalPagesResponse>(`/api/admin/legal/${slug}`, {
    method: "PUT",
    body: payload,
  });
}

export type LegalSection = {
  title: string;
  body: string;
};

/** Parse `## Heading` + following paragraphs into sections. */
export function parseLegalBody(body: string): LegalSection[] {
  const trimmed = body.trim();
  if (!trimmed) {
    return [];
  }

  const parts = trimmed.split(/^##\s+/m).filter(Boolean);

  return parts.map((part) => {
    const newline = part.indexOf("\n");
    if (newline === -1) {
      return { title: part.trim(), body: "" };
    }

    return {
      title: part.slice(0, newline).trim(),
      body: part.slice(newline + 1).trim(),
    };
  });
}
