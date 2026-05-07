import { authConfig } from "./config";
import type { AuthMe, AuthSession } from "./types";

type JsonValue = Record<string, unknown>;

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!authConfig.apiBaseUrl) {
    throw new Error(
      "Missing EXPO_PUBLIC_API_BASE_URL. Point it at the backend before testing auth.",
    );
  }

  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${authConfig.apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as JsonValue;
      if (typeof payload.message === "string" && payload.message.length > 0) {
        message = payload.message;
      } else if (typeof payload.error === "string" && payload.error.length > 0) {
        message = payload.error;
      }
    } catch {
      // The backend can respond without a JSON body for some failures.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function exchangeGoogleTokens(payload: {
  idToken: string;
  accessToken?: string;
  nonce?: string;
}) {
  return requestJson<AuthSession>("/api/auth/google/exchange", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getGoogleAuthUrl() {
  return requestJson<{ url: string }>("/api/auth/google/url");
}

export function refreshSession(refreshToken: string) {
  return requestJson<AuthSession>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function getCurrentUser(accessToken: string) {
  return requestJson<AuthMe>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function logout(accessToken: string) {
  return requestJson<void>("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
