const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ApiValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  errors: ApiValidationErrors;

  constructor(message: string, status: number, errors: ApiValidationErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));

  return match ? decodeURIComponent(match[2]) : null;
}

export async function ensureCsrfCookie(): Promise<void> {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipCsrf?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipCsrf = false, headers, ...rest } = options;

  if (!skipCsrf && body !== undefined) {
    await ensureCsrfCookie();
  }

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const xsrfToken = getCookie("XSRF-TOKEN");

  if (xsrfToken) {
    requestHeaders.set("X-XSRF-TOKEN", xsrfToken);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? "Request failed",
      response.status,
      payload?.errors ?? {},
    );
  }

  return payload as T;
}
