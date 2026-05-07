import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/lib/auth";

export default function AuthCallbackScreen() {
  const { handleOAuthCallback, isAuthenticated, isBootstrapping } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const called = useRef(false);

  // Step 1: on mount, exchange the tokens from the callback URL
  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const callbackUrl =
      typeof window !== "undefined" ? window.location.href : "";

    console.log("[auth/callback] callbackUrl:", callbackUrl);

    handleOAuthCallback(callbackUrl).catch((err: unknown) => {
      console.error("[auth/callback] error:", err);
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 2: once bootstrapping is done and user is authenticated, navigate
  useEffect(() => {
    if (!isBootstrapping && isAuthenticated && !error) {
      router.replace("/landingPage");
    }
  }, [isBootstrapping, isAuthenticated, error]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0a0a0a",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      {error ? (
        <Text style={{ color: "#f87171", textAlign: "center", paddingHorizontal: 24 }}>
          {error}
        </Text>
      ) : (
        <>
          <ActivityIndicator color="#9333ea" size="large" />
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            Completing sign-in…
          </Text>
        </>
      )}
    </View>
  );
}
