const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const authConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL
    ? trimTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL)
    : undefined,
  googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

export const hasGoogleClientId = Boolean(
  authConfig.googleClientId ||
    authConfig.googleAndroidClientId ||
    authConfig.googleIosClientId ||
    authConfig.googleWebClientId,
);
