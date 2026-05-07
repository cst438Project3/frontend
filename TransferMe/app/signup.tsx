import { useState } from "react";
import {
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { useAuth } from "@/src/lib/auth";

const BACKEND_BASE_URL = "http://localhost:8080";

export default function SignUpScreen() {
  const { signInWithLocal, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentInstitutionId, setCurrentInstitutionId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleSignUp = async () => {
    setError(null);
    const parsedInstitutionId = Number(currentInstitutionId);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (currentInstitutionId.trim() && !Number.isFinite(parsedInstitutionId)) {
      setError("Institution ID must be a valid number.");
      return;
    }
    if (passwordMismatch || password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: create the account
      const res = await fetch(`${BACKEND_BASE_URL}/api/users/register/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: fullName.trim() || undefined,
          currentInstitutionId:
            currentInstitutionId.trim() && Number.isFinite(parsedInstitutionId)
              ? parsedInstitutionId
              : undefined,
        }),
      });

      if (res.status === 409) {
        setError("An account with this email already exists.");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        setError(text || "Registration failed. Please try again.");
        return;
      }

      // Step 2: open a session and navigate into the app
      await signInWithLocal(
        email.trim(),
        fullName.trim() || undefined,
        currentInstitutionId.trim() && Number.isFinite(parsedInstitutionId)
          ? parsedInstitutionId
          : undefined
      );
      router.replace("/landingPage");
    } catch (e) {
      const message =
        e instanceof Error && e.message
          ? e.message
          : "Could not connect to the server. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      router.replace("/landingPage");
    } catch (e) {
      const message =
        e instanceof Error && e.message
          ? e.message
          : "Google sign-in failed. Please try again.";
      Alert.alert("Sign-in error", message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGithubSignIn = () => {
    Alert.alert("Coming soon", "GitHub sign-in is not wired up yet.");
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#0a0a0a", "#1a0533", "#0d0d0d"]}
        style={{ position: "absolute", inset: 0 }}
      />
      <Box className="absolute w-72 h-72 rounded-full bg-purple-500/15 -top-16 -left-20" />
      <Box className="absolute w-64 h-64 rounded-full bg-violet-600/20 -bottom-8 -right-20" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 28,
            gap: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <VStack className="items-center gap-2">
            <Box className="w-16 h-16 rounded-2xl bg-purple-600/25 border border-purple-600/60 items-center justify-center mb-2">
              <Text className="text-3xl text-purple-400">⇄</Text>
            </Box>
            <Text className="text-4xl font-extrabold text-white tracking-tight">
              Create Account
            </Text>
            <Text className="text-sm text-white/40">Join TransferMe today</Text>
          </VStack>

          {/* Form */}
          <VStack className="gap-4">
            <VStack className="gap-2">
              <Text className="text-xs font-semibold text-white/55 uppercase tracking-widest">
                Full Name
              </Text>
              <Input className="bg-white/5 border border-purple-700/30 rounded-xl h-12">
                <InputField
                  placeholder="Jane Smith"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  className="text-white text-base px-4"
                />
              </Input>
            </VStack>

            <VStack className="gap-2">
              <Text className="text-xs font-semibold text-white/55 uppercase tracking-widest">
                Email
              </Text>
              <Input className="bg-white/5 border border-purple-700/30 rounded-xl h-12">
                <InputField
                  placeholder="you@university.edu"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="text-white text-base px-4"
                />
              </Input>
            </VStack>

            <VStack className="gap-2">
              <Text className="text-xs font-semibold text-white/55 uppercase tracking-widest">
                Current Institution ID (optional)
              </Text>
              <Input className="bg-white/5 border border-purple-700/30 rounded-xl h-12">
                <InputField
                  placeholder="e.g., 12"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={currentInstitutionId}
                  onChangeText={setCurrentInstitutionId}
                  keyboardType="numeric"
                  className="text-white text-base px-4"
                />
              </Input>
            </VStack>

            <VStack className="gap-2">
              <Text className="text-xs font-semibold text-white/55 uppercase tracking-widest">
                Password
              </Text>
              <Input className="bg-white/5 border border-purple-700/30 rounded-xl h-12">
                <InputField
                  placeholder="Min. 8 characters"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  className="text-white text-base px-4"
                />
                <InputSlot
                  className="pr-4"
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Text>{passwordVisible ? "🙈" : "👁️"}</Text>
                </InputSlot>
              </Input>
            </VStack>

            <VStack className="gap-2">
              <Text className="text-xs font-semibold text-white/55 uppercase tracking-widest">
                Confirm Password
              </Text>
              <Input
                className={`bg-white/5 border rounded-xl h-12 ${
                  passwordMismatch
                    ? "border-red-500/70"
                    : "border-purple-700/30"
                }`}
              >
                <InputField
                  placeholder="Re-enter your password"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!confirmVisible}
                  autoCapitalize="none"
                  className="text-white text-base px-4"
                />
                <InputSlot
                  className="pr-4"
                  onPress={() => setConfirmVisible(!confirmVisible)}
                >
                  <Text>{confirmVisible ? "🙈" : "👁️"}</Text>
                </InputSlot>
              </Input>
              {passwordMismatch && (
                <Text className="text-xs text-red-400">
                  Passwords do not match
                </Text>
              )}
            </VStack>

            {error && (
              <Text className="text-xs text-red-400 text-center">{error}</Text>
            )}

            <Button
              onPress={handleSignUp}
              disabled={loading}
              className={`rounded-xl h-14 mt-1 ${loading ? "bg-purple-700/50" : "bg-purple-700"}`}
            >
              <ButtonText className="text-base font-bold text-white tracking-wide">
                {loading ? "Creating Account…" : "Create Account"}
              </ButtonText>
            </Button>

            <Text className="text-xs text-white/35 text-center mt-2">or continue with</Text>

            <HStack className="gap-3">
              <Button
                onPress={handleGoogleSignIn}
                disabled={googleLoading}
                className="flex-1 rounded-xl h-12 bg-white"
              >
                <ButtonText className="text-sm font-semibold text-black">
                  {googleLoading ? "Signing in..." : "Google"}
                </ButtonText>
              </Button>

              <Button
                onPress={handleGithubSignIn}
                className="flex-1 rounded-xl h-12 bg-black border border-purple-700/40"
              >
                <ButtonText className="text-sm font-semibold text-white">
                  GitHub
                </ButtonText>
              </Button>
            </HStack>
          </VStack>
          <HStack className="justify-center items-center">
            <Text className="text-sm text-white/40">
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.replace("/")}>
              <Text className="text-sm font-semibold text-purple-400">
                Sign in
              </Text>
            </Pressable>
          </HStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
