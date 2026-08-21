import { apiDownloadFile, apiRequest } from "@/lib/api/client";

export type NewsletterSubscriber = {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NewsletterListResponse = {
  data: NewsletterSubscriber[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export function subscribeNewsletter(email: string) {
  return apiRequest<{ message: string }>("/api/newsletter/subscribe", {
    method: "POST",
    body: { email },
  });
}

function newsletterFilterQuery(params?: {
  search?: string;
  status?: "" | "active" | "unsubscribed";
  page?: number;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  return query.toString();
}

export function listAdminNewsletter(params?: {
  search?: string;
  status?: "" | "active" | "unsubscribed";
  page?: number;
  signal?: AbortSignal;
}) {
  const qs = newsletterFilterQuery(params);

  return apiRequest<NewsletterListResponse>(
    `/api/admin/newsletter${qs ? `?${qs}` : ""}`,
    { signal: params?.signal },
  );
}

export function downloadAdminNewsletterEmails(params?: {
  search?: string;
  status?: "" | "active" | "unsubscribed";
}) {
  const qs = newsletterFilterQuery(params);

  return apiDownloadFile(
    `/api/admin/newsletter/export${qs ? `?${qs}` : ""}`,
    "newsletter-emails.csv",
  );
}
