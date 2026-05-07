import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { router } from "expo-router";

import { useAuth } from "@/src/auth/AuthContext";
import type { AuthSession } from "@/src/auth/types";

function parseSessionFromCallback(): AuthSession {
  if (Platform.OS !== "web") {
    throw new Error("The browser callback route is only used on web.");
  }

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const search = window.location.search.startsWith("?")
    ? window.location.search.slice(1)
    : window.location.search;
  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(search);
  const error =
    hashParams.get("error_description") ??
    hashParams.get("error") ??
    searchParams.get("error_description") ??
    searchParams.get("error");

  if (error) {
    throw new Error(error);
  }

  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const tokenType = hashParams.get("token_type");
  const expiresIn = hashParams.get("expires_in");

  if (!accessToken || !tokenType) {
    throw new Error("Supabase did not return the expected session tokens.");
  }

  return {
    accessToken,
    refreshToken,
    tokenType,
    expiresIn: expiresIn ? Number(expiresIn) : null,
    student: null,
  };
}

export default function AuthCallbackScreen() {
  const { signInWithSession } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finishSignIn = async () => {
      try {
        const session = parseSessionFromCallback();
        await signInWithSession(session);
        router.replace("/landingPage");
      } catch (callbackError) {
        setError(
          callbackError instanceof Error
            ? callbackError.message
            : "Unable to finish sign-in.",
        );
      }
    };

    void finishSignIn();
  }, [signInWithSession]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0a0a0a",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        gap: 16,
      }}
    >
      {error ? (
        <>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 22,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            Sign-in failed
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#c084fc" />
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700" }}>
            Finishing sign-in...
          </Text>
        </>
      )}
    </View>
  );
}
