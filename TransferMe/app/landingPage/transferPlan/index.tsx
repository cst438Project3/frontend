import { ScrollView } from "react-native";
import { router } from "expo-router";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";

const PLANS = [
  {
    id: "1",
    title: "University of State",
    program: "Computer Science",
    school: "Community College A",
    credits: 6,
    status: "In Progress",
  },
  {
    id: "2",
    title: "State Tech University",
    program: "Software Engineering",
    school: "Community College A",
    credits: 12,
    status: "Planned",
  },
];

const statusColors: Record<string, string> = {
  "In Progress": "#c084fc",
  Planned: "#93c5fd",
  Complete: "#86efac",
};

export default function TransferPlanScreen() {
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        paddingBottom: 48,
        gap: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <VStack space="xs">
        <Text
          style={{
            color: "#ffffff",
            fontSize: 28,
            fontWeight: "800",
            letterSpacing: -0.5,
          }}
        >
          Transfer Plans
        </Text>

        <Text style={{ color: "rgba(192,132,252,0.65)", fontSize: 13 }}>
          Manage your transfer plans and create a new path.
        </Text>
      </VStack>

      <Pressable onPress={() => router.push("/landingPage/createPlan" as any)}>
        <Box
          style={{
            backgroundColor: "#9333ea",
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 15 }}>
            + Create Plan
          </Text>
        </Box>
      </Pressable>

      <VStack space="md">
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
          Your Plans
        </Text>

        {PLANS.map((plan) => (
          <Pressable
            key={plan.id}
            onPress={() => router.push(`/transferPlan/${plan.id}` as any)}
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
                <HStack style={{ justifyContent: "space-between", gap: 12 }}>
                  <VStack space="xs" style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      {plan.title}
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
                      backgroundColor: "rgba(147,51,234,0.16)",
                      borderColor: "rgba(147,51,234,0.4)",
                      borderWidth: 1,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: statusColors[plan.status],
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {plan.status}
                    </Text>
                  </Box>
                </HStack>

                <Box
                  style={{
                    height: 1,
                    backgroundColor: "rgba(147,51,234,0.16)",
                  }}
                />

                <HStack style={{ justifyContent: "space-between", gap: 12 }}>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: 12,
                      flex: 1,
                    }}
                  >
                    From {plan.school}
                  </Text>

                  <Text style={{ color: "#c084fc", fontSize: 12 }}>
                    {plan.credits} credits
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </Pressable>
        ))}
      </VStack>
    </ScrollView>
  );
}