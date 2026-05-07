import { Platform } from "react-native";

const PROD_API_BASE_URL = "https://backend-j5c4.onrender.com";

const resolveDevBaseUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredUrl) return configuredUrl;

  if (__DEV__ && Platform.OS === "android") return "http://10.0.2.2:8080";
  if (__DEV__) return "http://localhost:8080";

  return PROD_API_BASE_URL;
};

export const API_BASE_URL = resolveDevBaseUrl();
