import {
  useCallback,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as WebBrowser from "expo-web-browser";

import {
  exchangeGoogleTokens,
  getGoogleAuthUrl as getGoogleAuthUrlRequest,
  getCurrentUser,
  logout as logoutRequest,
  refreshSession,
} from "./api";
import { Platform } from "react-native";
import { clearAuthState, loadAuthState, saveAuthState } from "./storage";
import type { AuthMe, AuthSession, StoredAuthState } from "./types";

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  session: AuthSession | null;
  user: AuthMe | null;
  signInWithGoogleTokens: (payload: {
    idToken: string;
    accessToken?: string;
    nonce?: string;
  }) => Promise<void>;
  signInWithSession: (session: AuthSession) => Promise<void>;
  getGoogleAuthUrl: () => Promise<string>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function serializeState(state: StoredAuthState) {
  if (Platform.OS === "web") {
    return JSON.stringify({
      ...state,
      session: {
        ...state.session,
        refreshToken: null,
      },
    } satisfies StoredAuthState);
  }

  return JSON.stringify(state);
}

async function persistState(state: StoredAuthState) {
  await saveAuthState(serializeState(state));
}

function parseStoredState(value: string | null): StoredAuthState | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredAuthState;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthMe | null>(null);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const stored = parseStoredState(await loadAuthState());

        if (!stored) {
          return;
        }

        try {
          const currentUser = await getCurrentUser(stored.session.accessToken);
          if (!cancelled) {
            setSession(stored.session);
            setUser(currentUser);
            await persistState({ session: stored.session, user: currentUser });
          }
          return;
        } catch {
          if (!stored.session.refreshToken) {
            throw new Error("Stored session cannot be refreshed.");
          }

          const refreshedSession = await refreshSession(stored.session.refreshToken);
          const currentUser = await getCurrentUser(refreshedSession.accessToken);

          if (!cancelled) {
            setSession(refreshedSession);
            setUser(currentUser);
            await persistState({ session: refreshedSession, user: currentUser });
          }
        }
      } catch {
        await clearAuthState();
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void restore();

    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithGoogleTokens = useCallback(
    async (payload: { idToken: string; accessToken?: string; nonce?: string }) => {
      const nextSession = await exchangeGoogleTokens(payload);
      const nextUser = await getCurrentUser(nextSession.accessToken);

      setSession(nextSession);
      setUser(nextUser);
      await persistState({ session: nextSession, user: nextUser });
    },
    [],
  );

  const signInWithSession = useCallback(async (nextSession: AuthSession) => {
    const nextUser = await getCurrentUser(nextSession.accessToken);

    setSession(nextSession);
    setUser(nextUser);
    await persistState({ session: nextSession, user: nextUser });
  }, []);

  const getGoogleAuthUrl = useCallback(async () => {
    const response = await getGoogleAuthUrlRequest();
    return response.url;
  }, []);

  const logout = useCallback(async () => {
    const accessToken = session?.accessToken;

    setSession(null);
    setUser(null);
    await clearAuthState();

    if (!accessToken) {
      return;
    }

    try {
      await logoutRequest(accessToken);
    } catch {
      // Local logout should still succeed even if the backend session call fails.
    }
  }, [session?.accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated: Boolean(session && user),
      session,
      user,
      signInWithGoogleTokens,
      signInWithSession,
      getGoogleAuthUrl,
      logout,
    }),
    [
      getGoogleAuthUrl,
      isLoading,
      logout,
      session,
      signInWithGoogleTokens,
      signInWithSession,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
