import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

WebBrowser.maybeCompleteAuthSession();

const BACKEND_BASE_URL = "http://localhost:8080";
const TOKENS_KEY = "transferme:auth-tokens";

type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
};

type AuthContextValue = {
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  signInWithGoogle: () => Promise<void>;
  signInWithLocal: (email: string, name?: string) => Promise<void>;
  handleOAuthCallback: (callbackUrl: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
  protectedFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

type ApiError = Error & {
  status?: number;
};

const AuthContext = createContext<AuthContextValue | null>(null);

let inMemoryTokens: AuthTokens | null = null;
let refreshPromise: Promise<AuthTokens | null> | null = null;

function asApiError(message: string, status?: number): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
}

function pickToken(
  payload: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

function extractTokens(payload: Record<string, unknown>): AuthTokens {
  const nested =
    typeof payload.tokens === "object" && payload.tokens
      ? (payload.tokens as Record<string, unknown>)
      : {};

  const accessToken =
    pickToken(payload, ["accessToken", "access_token"]) ??
    pickToken(nested, ["accessToken", "access_token"]);

  const refreshToken =
    pickToken(payload, ["refreshToken", "refresh_token"]) ??
    pickToken(nested, ["refreshToken", "refresh_token"]);

  if (!accessToken) {
    throw asApiError("Backend response did not include an access token.");
  }

  return refreshToken ? { accessToken, refreshToken } : { accessToken };
}

function parseOAuthCallback(url: string): {
  idToken?: string;
  accessToken?: string;
} {
  const result: {
    idToken?: string;
    accessToken?: string;
  } = {};

  const [base, fragment = ""] = url.split("#");
  const queryStart = base.indexOf("?");
  const query = queryStart >= 0 ? base.slice(queryStart + 1) : "";

  const queryParams = new URLSearchParams(query);
  const fragmentParams = new URLSearchParams(fragment);

  // Explicit idToken takes priority (backend-issued)
  result.idToken =
    queryParams.get("idToken") ??
    queryParams.get("id_token") ??
    fragmentParams.get("idToken") ??
    fragmentParams.get("id_token") ??
    undefined;

  // Supabase puts the Google id_token in `provider_token` in the fragment
  const providerToken =
    fragmentParams.get("provider_token") ??
    queryParams.get("provider_token") ??
    undefined;

  result.accessToken =
    queryParams.get("accessToken") ??
    queryParams.get("access_token") ??
    fragmentParams.get("accessToken") ??
    fragmentParams.get("access_token") ??
    undefined;

  // provider_token is the real Google token the backend exchange endpoint needs
  if (!result.idToken && providerToken) {
    result.idToken = providerToken;
  }

  // Last resort: use Supabase access_token if nothing else is available
  if (!result.idToken && result.accessToken) {
    result.idToken = result.accessToken;
  }

  console.log("[auth] callback token keys found:", {
    idToken: !!result.idToken,
    accessToken: !!result.accessToken,
    providerToken: !!providerToken,
    allFragmentKeys: [...fragmentParams.keys()],
    allQueryKeys: [...queryParams.keys()],
  });

  return result;
}

async function saveTokens(tokens: AuthTokens) {
  inMemoryTokens = tokens;
  await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

async function clearTokens() {
  inMemoryTokens = null;
  await AsyncStorage.removeItem(TOKENS_KEY);
}

async function loadTokens(): Promise<AuthTokens | null> {
  if (inMemoryTokens) return inMemoryTokens;
  const raw = await AsyncStorage.getItem(TOKENS_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthTokens;
    if (!parsed.accessToken) return null;
    inMemoryTokens = parsed;
    return parsed;
  } catch {
    return null;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);

  if (!response.ok) {
    throw asApiError(`Request failed (${response.status})`, response.status);
  }

  return data;
}

async function refreshTokens(currentRefreshToken?: string): Promise<AuthTokens | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const tokens = currentRefreshToken
      ? { accessToken: "", refreshToken: currentRefreshToken }
      : await loadTokens();

    if (!tokens?.refreshToken) {
      return null;
    }

    const payload = await requestJson<Record<string, unknown>>("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    const nextTokens = extractTokens(payload);
    await saveTokens(nextTokens);
    return nextTokens;
  })()
    .catch(async () => {
      await clearTokens();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function authenticatedFetch(path: string, init?: RequestInit): Promise<Response> {
  const tokens = await loadTokens();
  if (!tokens?.accessToken) {
    throw asApiError("No access token available.", 401);
  }

  const makeRequest = (accessToken: string) =>
    fetch(`${BACKEND_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init?.headers ?? {}),
      },
    });

  let response = await makeRequest(tokens.accessToken);

  if (response.status === 401) {
    const nextTokens = await refreshTokens(tokens.refreshToken);
    if (!nextTokens?.accessToken) {
      throw asApiError("Session expired.", 401);
    }
    response = await makeRequest(nextTokens.accessToken);
  }

  return response;
}

async function getCurrentUser(): Promise<AuthUser> {
  const response = await authenticatedFetch("/api/auth/me", {
    method: "GET",
  });

  if (!response.ok) {
    throw asApiError("Failed to load current user.", response.status);
  }

  return (await response.json()) as AuthUser;
}

async function exchangeGoogleTokens(payload: {
  idToken: string;
  accessToken?: string;
}) {
  const data = await requestJson<Record<string, unknown>>(
    "/api/auth/google/exchange",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const tokens = extractTokens(data);
  await saveTokens(tokens);
}

async function getGoogleAuthUrl(redirectUri: string): Promise<string> {
  let data: { url?: string; authUrl?: string } | null = null;

  try {
    data = await requestJson<{ url?: string; authUrl?: string }>(
      `/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`,
      { method: "GET" }
    );
  } catch {
    data = await requestJson<{ url?: string; authUrl?: string }>(
      "/api/auth/google/url",
      { method: "GET" }
    );
  }

  const url = data.url ?? data.authUrl;
  if (!url) {
    throw asApiError("Google auth URL was not returned by backend.");
  }
  return url;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const restoreSession = useCallback(async () => {
    setIsBootstrapping(true);
    try {
      const tokens = await loadTokens();
      if (!tokens?.accessToken) {
        setUser(null);
        return;
      }

      const me = await getCurrentUser();
      setUser(me);
    } catch {
      await clearTokens();
      setUser(null);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const signInWithLocal = useCallback(async (email: string, name?: string) => {
    const data = await requestJson<Record<string, unknown>>("/api/auth/local/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...(name ? { name } : {}) }),
    });
    const tokens = extractTokens(data);
    await saveTokens(tokens);
    const me = await getCurrentUser();
    setUser(me);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "transferme",
      path: "auth/google",
    });
    const authUrl = await getGoogleAuthUrl(redirectUri);

    const authResult = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (authResult.type !== "success" || !authResult.url) {
      throw asApiError("Google sign-in was cancelled.");
    }

    const { idToken, accessToken } = parseOAuthCallback(authResult.url);

    if (!idToken) {
      throw asApiError("Google sign-in did not return an idToken.");
    }

    await exchangeGoogleTokens({ idToken, accessToken });
    const me = await getCurrentUser();
    setUser(me);
  }, []);

  const handleOAuthCallback = useCallback(async (callbackUrl: string) => {
    setIsBootstrapping(true);
    try {
      console.log("[auth] parsing callback:", callbackUrl);
      const parsed = parseOAuthCallback(callbackUrl);
      console.log("[auth] parsed tokens:", {
        hasIdToken: !!parsed.idToken,
        hasAccessToken: !!parsed.accessToken,
      });

      if (!parsed.idToken) {
        throw asApiError(
          `OAuth callback missing tokens. Fragment: ${callbackUrl.split("#")[1] ?? "none"}`
        );
      }

      await exchangeGoogleTokens({ idToken: parsed.idToken, accessToken: parsed.accessToken });
      const me = await getCurrentUser();
      setUser(me);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authenticatedFetch("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // local logout should still continue
    } finally {
      await clearTokens();
      setUser(null);
    }
  }, []);

  const protectedFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      return authenticatedFetch(path, init);
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isBootstrapping,
      isAuthenticated: !!user,
      user,
      signInWithGoogle,
      signInWithLocal,
      handleOAuthCallback,
      restoreSession,
      logout,
      protectedFetch,
    }),
    [isBootstrapping, handleOAuthCallback, logout, protectedFetch, restoreSession, signInWithGoogle, signInWithLocal, user]
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
