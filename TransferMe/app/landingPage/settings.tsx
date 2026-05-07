import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { getMe, getMyProfile, updateMyProfile } from "@/src/services/user-data";

export default function SettingsScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrorText("");
        const [me, profile] = await Promise.all([getMe(), getMyProfile()]);

        setName(me?.name || "");
        setEmail(me?.email || "");
        setUsername(profile?.major || "");
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorText("");
      setSuccessText("");

      await updateMyProfile({
        major: username,
      });

      setSuccessText("Profile updated.");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.hero}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSub}>Edit your profile</Text>
      </View>

      {/* Edit  Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Edit Profile</Text>
        {loading ? <Text style={styles.label}>Loading profile...</Text> : null}
        {errorText ? <Text style={[styles.label, { color: "#f87171" }]}>{errorText}</Text> : null}
        {successText ? <Text style={[styles.label, { color: "#86efac" }]}>{successText}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.input}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Major"
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="none"
            style={styles.input}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            editable={false}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving || loading}>
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
      </View>

      {/* Logout button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace("/")}
        activeOpacity={0.85}
      >
        <Text style={styles.logoutText}>🚪  Log Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    gap: 20,
    backgroundColor: "#0a0a0a",
  },
  hero: {
    gap: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  pageSub: {
    fontSize: 13,
    color: "rgba(192,132,252,0.65)",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(147,51,234,0.22)",
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
  },

  inputGroup: {
    gap: 6,
  },

  label: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(147,51,234,0.3)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#ffffff",
    fontSize: 14,
  },

  saveButton: {
    marginTop: 10,
    backgroundColor: "#9333ea",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  saveText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },

  logoutButton: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f87171",
  },

  version: {
    fontSize: 12,
    color: "rgba(255,255,255,0.2)",
    textAlign: "center",
  },
});