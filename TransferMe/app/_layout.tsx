import { Stack } from "expo-router";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider } from "@/src/lib/auth";
import '@/global.css';

export default function RootLayout() {
  return (
    <GluestackUIProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </GluestackUIProvider>
  );
}
