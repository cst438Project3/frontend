import { useEffect, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { Button, ButtonText } from "../components/ui/button";
import { Input, InputField } from "../components/ui/input";
import { Box } from "../components/ui/box";
import { VStack } from "../components/ui/vstack";
import { HStack } from "../components/ui/hstack";
import { Center } from "../components/ui/center";
import { Divider } from "../components/ui/divider";
import { useAuth } from "@/src/lib/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { signInWithGoogle, signInWithLocal, isAuthenticated, isBootstrapping } = useAuth();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      router.replace("/landingPage");
    }
  }, [isAuthenticated, isBootstrapping]);

  const handleEmailLogin = async () => {
    if (!email.trim()) {
      setLoginError("Please enter your email.");
      return;
    }
    setLoginError("");
    setLoginLoading(true);
    try {
      await signInWithLocal(email.trim());
      router.replace("/landingPage");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sign-in failed. Please try again.";
      setLoginError(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      router.replace("/landingPage");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Google sign-in failed. Please try again.";
      Alert.alert("Sign-in error", message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGithubSignIn = () => {
    // TODO: GitHub OAuth here
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
                  <Text style={{ fontSize: 28, color: "#c084fc" }}>⇄</Text>
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
                        placeholder="••••••••"
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
                        {passwordVisible ? "🙈" : "👁️"}
                      </Text>
                    </TouchableOpacity>
                  </Box>
                </VStack>

                {loginError ? (
                  <Text style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>
                    {loginError}
                  </Text>
                ) : null}

                <Button
                  onPress={handleEmailLogin}
                  isDisabled={loginLoading}
                  style={{
                    borderRadius: 14,
                    backgroundColor: "#9333ea",
                    height: 54,
                  }}
                >
                  <ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
                    {loginLoading ? "Signing In..." : "Sign In"}
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
                onPress={handleGoogleSignIn}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  backgroundColor: "#ffffff",
                  borderColor: "#ffffff",
                  height: 52,
                }}
              >
                <ButtonText style={{ color: "#111111", fontWeight: "600" }}>
                  {googleLoading ? "Signing in..." : "Google"}
                </ButtonText>
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
                Don&apos;t have an account?{" "}
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