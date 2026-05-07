import { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";
import { userService } from "@/src/services";

// Type for transfer plans/paths
interface TransferPlan {
  id: string;
  university: string;
  program: string;
  credits: number;
  status: "In Progress" | "Planned" | "Complete";
  sourceCollege: string;
}

// Mock data - replace with real API data
const MOCK_PLANS: TransferPlan[] = [
  {
    id: "1",
    university: "University of State",
    program: "Computer Science",
    credits: 6,
    status: "In Progress",
    sourceCollege: "Community College A",
  },
  {
    id: "2",
    university: "State Tech University",
    program: "Software Engineering",
    credits: 12,
    status: "Planned",
    sourceCollege: "Community College A",
  },
  {
    id: "3",
    university: "Northern University",
    program: "Data Science",
    credits: 9,
    status: "Complete",
    sourceCollege: "Community College A",
  },
];

const statusColors: Record<string, string> = {
  "In Progress": "#c084fc",
  Planned: "#93c5fd",
  Complete: "#86efac",
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("All");
  const [userName, setUserName] = useState("Student");
  const [plans, setPlans] = useState<TransferPlan[]>(MOCK_PLANS);
  const [loading, setLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const user = await userService.getCurrentUserProfile();
      setUserName(user.name || "Student");
      // TODO: Load actual transfer plans from API
      // For now, using mock data
    } catch (error: any) {
      console.error("Failed to load dashboard data:", error);
      // Still show mock data even if API fails
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans =
    activeTab === "All"
      ? plans
      : plans.filter((plan) => plan.status === activeTab);

  const totalCredits = plans.reduce((sum, plan) => sum + plan.credits, 0);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        paddingBottom: 48,
        gap: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <HStack style={{ justifyContent: "space-between", gap: 12 }}>
        <VStack space="xs" style={{ flex: 1 }}>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
            Welcome back,
          </Text>

          <Text
            style={{
              color: "#ffffff",
              fontSize: 26,
              fontWeight: "800",
              letterSpacing: -0.5,
            }}
          >
            {userName} 👋
          </Text>

          <Text style={{ color: "rgba(192,132,252,0.65)", fontSize: 13 }}>
            Track your college credit transfers all in one place.
          </Text>
        </VStack>

        <TouchableOpacity
          onPress={() => router.push("/landingPage/transferPlan" as any)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#9333ea", "#7c3aed"]}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 13 }}>
              + New Plan
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </HStack>

      <HStack space="sm">
        <StatCard label="Transfer Plans" value={PLANS.length} color="#c084fc" />
        <StatCard label="Credits Planned" value={totalCredits} color="#93c5fd" />
        <StatCard label="Requirements Met" value="2/4" color="#86efac" />
      </HStack>

      <VStack space="md">
        <HStack style={{ justifyContent: "space-between" }}>
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
            My Transfer Plans
          </Text>

          <Pressable onPress={() => router.push("/landingPage/transferPlan" as any)}>
            <Text style={{ color: "#c084fc", fontSize: 13, fontWeight: "600" }}>
              See all
            </Text>
          </Pressable>
        </HStack>

        <HStack
          space="xs"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderWidth: 1,
            borderColor: "rgba(147,51,234,0.18)",
            borderRadius: 12,
            padding: 4,
          }}
        >
          {["All", "In Progress", "Complete"].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: "center",
                backgroundColor: activeTab === tab ? "#7c3aed" : "transparent",
              }}
            >
              <Text
                style={{
                  color:
                    activeTab === tab ? "#ffffff" : "rgba(255,255,255,0.4)",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </HStack>

        <VStack space="md">
          {filteredPlans.map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => router.push("/transferPlan" as any)}
            >
              <Box
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderWidth: 1,
                  borderColor: "rgba(147,51,234,0.22)",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <VStack space="md">
                  <HStack style={{ justifyContent: "space-between", gap: 8 }}>
                    <VStack space="xs" style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 15,
                          fontWeight: "700",
                        }}
                      >
                        {plan.university}
                      </Text>

                      <Text
                        style={{
                          color: "rgba(192,132,252,0.65)",
                          fontSize: 13,
                        }}
                      >
                        {plan.program}
                      </Text>
                    </VStack>

                    <Box
                      style={{
                        borderWidth: 1,
                        borderColor: "rgba(147,51,234,0.4)",
                        backgroundColor: "rgba(147,51,234,0.16)",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: statusColors[plan.status],
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        {plan.status}
                      </Text>
                    </Box>
                  </HStack>

                  <Box
                    style={{
                      height: 1,
                      backgroundColor: "rgba(147,51,234,0.18)",
                    }}
                  />

                  <HStack style={{ justifyContent: "space-between" }}>
                    <Text style={{ color: "#c084fc", fontSize: 12 }}>
                      {plan.credits} credits
                    </Text>

                    <Text
                      style={{
                        color: "rgba(255,255,255,0.35)",
                        fontSize: 12,
                      }}
                    >
                      {plan.sourceCollege}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </Pressable>
          ))}
        </VStack>
      </VStack>
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Box
      style={{
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(147,51,234,0.22)",
        borderRadius: 14,
        padding: 14,
        alignItems: "center",
      }}
    >
      <Text style={{ color, fontSize: 24, fontWeight: "800" }}>{value}</Text>
      <Text
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 11,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Box>
  );
}