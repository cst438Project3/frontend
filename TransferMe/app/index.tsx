import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "../components/ui/box";
import { Button, ButtonText } from "../components/ui/button";
import { Center } from "../components/ui/center";
import { Divider } from "../components/ui/divider";
import { HStack } from "../components/ui/hstack";
import { Input, InputField } from "../components/ui/input";
import { VStack } from "../components/ui/vstack";
import { useAuth } from "@/src/auth/AuthContext";
import { authConfig, hasGoogleClientId } from "@/src/auth/config";

export default function LoginScreen() {
  const { isAuthenticated, isLoading, signInWithGoogleTokens } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const redirectUri = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        scheme: "transferme",
        path: "oauthredirect",
      }),
    [],
  );

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      clientId: authConfig.googleClientId ?? "transferme-google-client-id",
      androidClientId:
        authConfig.googleAndroidClientId ?? authConfig.googleClientId,
      iosClientId: authConfig.googleIosClientId ?? authConfig.googleClientId,
      webClientId: authConfig.googleWebClientId ?? authConfig.googleClientId,
      redirectUri,
      selectAccount: true,
    },
    {
      path: "oauthredirect",
    },
  );

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/landingPage");
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    const completeGoogleSignIn = async () => {
      if (response?.type !== "success") {
        if (response?.type === "error") {
          setIsGoogleSigningIn(false);
          Alert.alert("Google sign-in failed", "Google did not complete sign-in.");
        }
        return;
      }

      const idToken =
        typeof response.params.id_token === "string"
          ? response.params.id_token
          : response.authentication?.idToken;
      const accessToken =
        typeof response.params.access_token === "string"
          ? response.params.access_token
          : response.authentication?.accessToken;

      if (!idToken) {
        setIsGoogleSigningIn(false);
        Alert.alert(
          "Google sign-in failed",
          "Google did not return the ID token the backend expects.",
        );
        return;
      }

      try {
        await signInWithGoogleTokens({ idToken, accessToken });
        router.replace("/landingPage");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to finish sign-in.";
        Alert.alert("Sign-in failed", message);
      } finally {
        setIsGoogleSigningIn(false);
      }
    };

    void completeGoogleSignIn();
  }, [response, signInWithGoogleTokens]);

  const handleEmailLogin = () => {
    Alert.alert("Not yet available", "Email/password auth is not wired up yet.");
  };

  const handleGoogleSignIn = async () => {
    if (!hasGoogleClientId) {
      Alert.alert(
        "Missing Google OAuth config",
        "Set the EXPO_PUBLIC_GOOGLE_* client ID env vars before testing sign-in.",
      );
      return;
    }

    if (!request) {
      Alert.alert(
        "Google sign-in unavailable",
        "The Google sign-in request is still loading. Try again in a moment.",
      );
      return;
    }

    setIsGoogleSigningIn(true);

    const result = await promptAsync();
    if (result.type !== "success") {
      setIsGoogleSigningIn(false);
    }
  };

  const handleGithubSignIn = () => {
    Alert.alert("Not yet available", "GitHub auth is not wired up on this branch.");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#0a0a0a", "#1a0533", "#0d0d0d"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "rgba(139, 92, 246, 0.2)",
          top: -80,
          right: -80,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 250,
          height: 250,
          borderRadius: 125,
          backgroundColor: "rgba(168, 85, 247, 0.15)",
          bottom: 40,
          left: -100,
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 28,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <VStack space="2xl">
            <Center>
              <VStack space="sm" style={{ alignItems: "center" }}>
                <Center
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    backgroundColor: "rgba(147, 51, 234, 0.25)",
                    borderWidth: 1,
                    borderColor: "rgba(147, 51, 234, 0.6)",
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 28, color: "#c084fc" }}>â‡„</Text>
                </Center>

                <Text
                  style={{
                    fontSize: 34,
                    fontWeight: "800",
                    color: "#ffffff",
                    letterSpacing: -1,
                  }}
                >
                  TransferMe
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.4)",
                    textAlign: "center",
                  }}
                >
                  College Credit Transfer Assistant
                </Text>
              </VStack>
            </Center>

            <Box
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 24,
                padding: 20,
                borderWidth: 1,
                borderColor: "rgba(147, 51, 234, 0.18)",
              }}
            >
              <VStack space="lg">
                <VStack space="xs">
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.55)",
                      textTransform: "uppercase",
                    }}
                  >
                    Email
                  </Text>

                  <Input
                    style={{
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(147, 51, 234, 0.3)",
                    }}
                  >
                    <InputField
                      placeholder="you@university.edu"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{ color: "#ffffff" }}
                    />
                  </Input>
                </VStack>

                <VStack space="xs">
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.55)",
                      textTransform: "uppercase",
                    }}
                  >
                    Password
                  </Text>

                  <Box style={{ position: "relative" }}>
                    <Input
                      style={{
                        borderRadius: 12,
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderColor: "rgba(147, 51, 234, 0.3)",
                      }}
                    >
                      <InputField
                        placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                        placeholderTextColor="rgba(255,255,255,0.25)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!passwordVisible}
                        autoCapitalize="none"
                        style={{ color: "#ffffff", paddingRight: 48 }}
                      />
                    </Input>

                    <TouchableOpacity
                      onPress={() => setPasswordVisible(!passwordVisible)}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: 0,
                        bottom: 0,
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>
                        {passwordVisible ? "ðŸ™ˆ" : "ðŸ‘ï¸"}
                      </Text>
                    </TouchableOpacity>
                  </Box>
                </VStack>

                <Button
                  onPress={handleEmailLogin}
                  style={{
                    borderRadius: 14,
                    backgroundColor: "#9333ea",
                    height: 54,
                  }}
                >
                  <ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
                    Sign In
                  </ButtonText>
                </Button>
              </VStack>
            </Box>

            <HStack space="md" style={{ alignItems: "center" }}>
              <Divider
                style={{
                  flex: 1,
                  backgroundColor: "rgba(147, 51, 234, 0.2)",
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                or continue with
              </Text>
              <Divider
                style={{
                  flex: 1,
                  backgroundColor: "rgba(147, 51, 234, 0.2)",
                }}
              />
            </HStack>

            <HStack space="md">
              <Button
                variant="outline"
                onPress={() => void handleGoogleSignIn()}
                isDisabled={isLoading || isGoogleSigningIn || !request}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  backgroundColor: "#ffffff",
                  borderColor: "#ffffff",
                  height: 52,
                  opacity: isLoading || isGoogleSigningIn || !request ? 0.7 : 1,
                }}
              >
                <HStack space="sm" style={{ alignItems: "center" }}>
                  {isGoogleSigningIn ? (
                    <ActivityIndicator color="#111111" size="small" />
                  ) : null}
                  <ButtonText style={{ color: "#111111", fontWeight: "600" }}>
                    {isGoogleSigningIn ? "Signing In..." : "Google"}
                  </ButtonText>
                </HStack>
              </Button>

              <Button
                variant="outline"
                onPress={handleGithubSignIn}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  backgroundColor: "#0d0d0d",
                  borderColor: "rgba(147, 51, 234, 0.35)",
                  height: 52,
                }}
              >
                <ButtonText style={{ color: "#ffffff", fontWeight: "600" }}>
                  GitHub
                </ButtonText>
              </Button>
            </HStack>

            <HStack style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
                Do not have an account?{" "}
              </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#c084fc",
                  }}
                >
                  Sign up
                </Text>
              </TouchableOpacity>
            </HStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
