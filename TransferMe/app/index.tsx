import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleEmailLogin = () => {
    // TODO: wire up email/password auth
  };

  const handleGoogleSignIn = () => {
    // TODO: wire up Google OAuth here
  };

  const handleGithubSignIn = () => {
    // TODO: wire up GitHub OAuth here
  };

  const handleForgotPassword = () => {
    // TODO: navigate to forgot password screen
  };

  const handleSignUp = () => {
    // TODO: navigate to sign up screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#0a0a0a", "#1a0533", "#0d0d0d"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* This for Title name */}
          <View style={styles.brandSection}>
            <View style={styles.logoMark}>
              <Text style={styles.logoIcon}>⇄</Text>
            </View>
            <Text style={styles.appName}>TransferMe</Text>
            <Text style={styles.tagline}>College Credit Transfer Assistant</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@university.edu"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Text style={styles.eyeIcon}>
                    {passwordVisible ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleEmailLogin}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#9333ea", "#7c3aed"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* OAuth button */}
          <View style={styles.oauthSection}>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.85}
            >
              <Text style={styles.oauthIcon}>G</Text>
              <Text style={styles.oauthText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.oauthButton, styles.oauthButtonDark]}
              onPress={handleGithubSignIn}
              activeOpacity={0.85}
            >
              <Text style={[styles.oauthIcon, styles.oauthIconDark]}>⌥</Text>
              <Text style={[styles.oauthText, styles.oauthTextDark]}>GitHub</Text>
            </TouchableOpacity>
          </View>

          {/* Sign up button */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            By continuing, you agree to our{" "}
            <Text style={styles.footerLink}>Terms</Text> &{" "}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  circleTopRight: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    top: -80,
    right: -80,
  },
  circleBottomLeft: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    bottom: 40,
    left: -100,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 32,
  },
  brandSection: {
    alignItems: "center",
    gap: 8,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(147, 51, 234, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(147, 51, 234, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 28,
    color: "#c084fc",
  },
  appName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.3,
  },
  formSection: {
    gap: 16,
  },
  inputWrapper: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  forgotText: {
    fontSize: 13,
    color: "#c084fc",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(147, 51, 234, 0.3)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#ffffff",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  eyeIcon: {
    fontSize: 16,
  },
  signInButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
    shadowColor: "#9333ea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  signInGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  signInText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(147, 51, 234, 0.2)",
  },
  dividerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.5,
  },
  oauthSection: {
    flexDirection: "row",
    gap: 12,
  },
  oauthButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#9333ea",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  oauthButtonDark: {
    backgroundColor: "#0d0d0d",
    borderWidth: 1,
    borderColor: "rgba(147, 51, 234, 0.35)",
    shadowColor: "#000",
  },
  oauthIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4285F4",
  },
  oauthIconDark: {
    color: "#c084fc",
  },
  oauthText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  oauthTextDark: {
    color: "#ffffff",
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpPrompt: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#c084fc",
  },
  footerText: {
    textAlign: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.2)",
    lineHeight: 18,
  },
  footerLink: {
    color: "rgba(192, 132, 252, 0.6)",
    textDecorationLine: "underline",
  },
});