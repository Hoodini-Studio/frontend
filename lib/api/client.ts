const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const DEFAULT_TIMEOUT_MS = 15_000;

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

function combineSignals(...signals: AbortSignal[]): AbortSignal {
  if (signals.length === 1) {
    return signals[0];
  }

  return AbortSignal.any(signals);
}

let csrfReady = false;
let csrfInFlight: Promise<void> | null = null;

export async function ensureCsrfCookie(): Promise<void> {
  if (csrfReady) {
    return;
  }

  if (!csrfInFlight) {
    csrfInFlight = fetch(`${API_URL}/sanctum/csrf-cookie`, {
      credentials: "include",
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    })
      .then((response) => {
        if (!response.ok) {
          throw new ApiError("Failed to initialize CSRF cookie", response.status);
        }

        csrfReady = true;
      })
      .finally(() => {
        csrfInFlight = null;
      });
  }

  await csrfInFlight;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipCsrf?: boolean;
  timeoutMs?: number;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipCsrf = false, headers, signal, timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } =
    options;

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

  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const fetchSignal = signal ? combineSignals(signal, timeoutSignal) : timeoutSignal;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    signal: fetchSignal,
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
