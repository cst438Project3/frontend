import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const AUTH_STORAGE_KEY = "transferme.auth";

export async function saveAuthState(serialized: string) {
  if (Platform.OS === "web") {
    window.sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
    return;
  }

  await SecureStore.setItemAsync(AUTH_STORAGE_KEY, serialized);
}

export async function loadAuthState() {
  if (Platform.OS === "web") {
    return window.sessionStorage.getItem(AUTH_STORAGE_KEY);
  }

  return SecureStore.getItemAsync(AUTH_STORAGE_KEY);
}

export async function clearAuthState() {
  if (Platform.OS === "web") {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
}
