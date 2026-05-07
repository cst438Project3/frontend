import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { userService } from "@/src/services";

export default function SettingsScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await userService.getCurrentUserProfile();
      setName(user.name || "");
      setEmail(user.email || "");
      setUsername(user.studentId || "");
    } catch (error: any) {
      console.error("Failed to load user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Note: The backend user update endpoint uses name and currentInstitutionId
      // We'll need to get the current institution ID from the profile
      const profile = await userService.getProfile();
      
      await userService.updateUser(1, {
        name: name,
        currentInstitutionId: profile?.currentCollege ? parseInt(profile.currentCollege) : undefined,
      });

      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      Alert.alert("Error", error.message || "Failed to save profile");
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

      {loading ? (
        <View style={{ justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <ActivityIndicator size="large" color="#9333ea" />
        </View>
      ) : (
        <>
          {/* Edit Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Student ID</Text>
              <TextInput
                value={username}
                editable={false}
                placeholder="Student ID"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={[styles.input, { opacity: 0.6 }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                editable={false}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={[styles.input, { opacity: 0.6 }]}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveText}>Save Changes</Text>
              )}
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
        </>
      )}
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