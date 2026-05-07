import { Platform, StatusBar } from "react-native";
import { Slot, router, usePathname } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";
import { useAuth } from "@/src/lib/auth";

const NAV_ITEMS = [
  { icon: "⊞", label: "Home", route: "/landingPage" },
  { icon: "📋", label: "My Transfer Plans", route: "/landingPage/transferPlan" },
  { icon: "🔍", label: "Credit Transfer Search", route: "/landingPage/search" },
  { icon: "⇄", label: "Equivalencies", route: "/landingPage/Equivlances" },
  { icon: "⚙️", label: "Settings", route: "/landingPage/settings" },
];

const isWeb = Platform.OS === "web";

function TopNavBar({
  pathname,
  displayName,
}: {
  pathname: string;
  displayName: string;
}) {
  return (
    <HStack
      className="items-center justify-between px-6"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: "rgba(147,51,234,0.2)",
        backgroundColor: "rgba(10,10,10,0.95)",
        height: 60,
      }}
    >
      {/* ai generated ahh logo */}
      <HStack className="items-center gap-3">
        <Box
          className="w-8 h-8 rounded-xl items-center justify-center"
          style={{
            backgroundColor: "rgba(147,51,234,0.25)",
            borderWidth: 1,
            borderColor: "rgba(147,51,234,0.5)",
          }}
        >
          <Text className="text-base text-purple-400">⇄</Text>
        </Box>
        <Text className="text-base font-extrabold text-white tracking-tight">
          TransferMe
        </Text>
      </HStack>

      <HStack className="items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.route || 
            (item.route === "/landingPage" && pathname === "/landingPage/index");
          return (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route as any)}
              className="px-4 py-2 rounded-lg"
              style={isActive ? { backgroundColor: "rgba(124,58,237,0.25)" } : {}}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive ? "text-purple-300" : "text-white/50"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>

      <Pressable
        className="flex-row items-center gap-2 rounded-xl px-3 py-2"
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          borderWidth: 1,
          borderColor: "rgba(147,51,234,0.25)",
        }}
      >
        <Box className="w-7 h-7 rounded-full bg-purple-600 items-center justify-center">
          <Text className="text-xs font-bold text-white">{displayName.charAt(0)}</Text>
        </Box>
        <Text className="text-sm font-semibold text-white">{displayName}</Text>
        <Text className="text-xs text-purple-400">▾</Text>
      </Pressable>
    </HStack>
  );
}

function BottomTabBar({ pathname }: { pathname: string }) {
  const tabs = [
    { icon: "⊞", label: "Home", route: "/landingPage" },
    { icon: "📋", label: "Plans", route: "/landingPage/transferPlan" },
    { icon: "🔍", label: "Search", route: "/landingPage/search" },
    { icon: "⇄", label: "Equiv.", route: "/landingPage/Equivlances" },
    { icon: "⚙️", label: "Settings", route: "/landingPage/settings" },
  ];

  return (
    <Box
      style={{
        borderTopWidth: 1,
        borderTopColor: "rgba(147,51,234,0.2)",
        backgroundColor: "rgba(10,10,10,0.98)",
        paddingBottom: 8,
        paddingTop: 8,
      }}
    >
      <HStack className="justify-around items-center px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.route ||
            (tab.route === "/(dashboard)" && pathname === "/(dashboard)/index");
          return (
            <Pressable
              key={tab.label}
              onPress={() => router.push(tab.route as any)}
              className="flex-1 items-center gap-1 py-1"
            >
              <Box
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={isActive ? { backgroundColor: "rgba(124,58,237,0.3)" } : {}}
              >
                <Text className="text-xl">{tab.icon}</Text>
              </Box>
              <Text
                className={`text-[10px] font-semibold ${
                  isActive ? "text-purple-400" : "text-white/35"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}

function MobileHeader({ displayName }: { displayName: string }) {
  return (
    <HStack
      className="items-center justify-between px-5 py-4"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: "rgba(147,51,234,0.2)",
        backgroundColor: "rgba(10,10,10,0.95)",
      }}
    >
      <HStack className="items-center gap-3">
        <Box
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{
            backgroundColor: "rgba(147,51,234,0.25)",
            borderWidth: 1,
            borderColor: "rgba(147,51,234,0.5)",
          }}
        >
          <Text className="text-lg text-purple-400">⇄</Text>
        </Box>
        <Text className="text-lg font-extrabold text-white tracking-tight">
          TransferMe
        </Text>
      </HStack>
      <Pressable
        className="flex-row items-center gap-2 rounded-xl px-3 py-2"
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          borderWidth: 1,
          borderColor: "rgba(147,51,234,0.25)",
        }}
      >
        <Box className="w-7 h-7 rounded-full bg-purple-600 items-center justify-center">
          <Text className="text-xs font-bold text-white">{displayName.charAt(0)}</Text>
        </Box>
        <Text className="text-sm font-semibold text-white">{displayName}</Text>
        <Text className="text-xs text-purple-400">▾</Text>
      </Pressable>
    </HStack>
  );
}

export default function DashboardLayout() {
  const pathname = usePathname();
  const { isAuthenticated, isBootstrapping, user } = useAuth();
  const displayName =
    typeof user?.name === "string" && user.name.trim().length > 0
      ? user.name
      : typeof user?.email === "string" && user.email.trim().length > 0
      ? user.email
      : "User";

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isBootstrapping]);

  if (isBootstrapping || !isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#0a0a0a", "#1a0533", "#0d0d0d"]}
        style={{ position: "absolute", inset: 0 }}
      />

      {isWeb ? (
        <VStack className="flex-1">
          <TopNavBar pathname={pathname} displayName={displayName} />
          <Box className="flex-1">
            <Slot />
          </Box>
        </VStack>
      ) : (
        <VStack className="flex-1">
          <MobileHeader displayName={displayName} />
          <Box className="flex-1">
            <Slot />
          </Box>
          <BottomTabBar pathname={pathname} />
        </VStack>
      )}
    </SafeAreaView>
  );
}