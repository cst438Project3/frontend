import { ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";

export default function TransferPlanDetail() {
  const { id } = useLocalSearchParams();

  // TODO: fetch from db
  const mockPlan = {
    id,
    fromSchool: "Community College A",
    toSchool: "University of State",
    major: "Computer Science",
  };

  // TODO: fetch from db
  const mockCourses = [
    { id: "1", name: "ENG 101", result: "Approved" },
    { id: "2", name: "MAT 150", result: "Pending" },
  ];

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        gap: 24,
        paddingBottom: 48,
      }}
      showsVerticalScrollIndicator={false}
    >
      <VStack space="xs">
        <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800" }}>
          Transfer Plan
        </Text>

        <Text style={{ color: "rgba(255,255,255,0.4)" }}>Plan ID: {id}</Text>
      </VStack>

      <Box style={card}>
        <VStack space="sm">
          <Text style={label}>From</Text>
          <Text style={value}>{mockPlan.fromSchool}</Text>

          <Text style={label}>To</Text>
          <Text style={value}>{mockPlan.toSchool}</Text>

          <Text style={label}>Major</Text>
          <Text style={value}>{mockPlan.major}</Text>
        </VStack>
      </Box>

      <Box style={card}>
        <Text style={sectionTitle}>Courses</Text>

        <VStack space="sm">
          {mockCourses.map((course) => (
            <HStack
              key={course.id}
              style={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff" }}>{course.name}</Text>
              <Text style={{ color: "#c084fc", fontWeight: "600" }}>
                {course.result}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    </ScrollView>
  );
}

const card = {
  backgroundColor: "rgba(255,255,255,0.04)",
  borderWidth: 1,
  borderColor: "rgba(147,51,234,0.22)",
  borderRadius: 16,
  padding: 16,
} as const;

const label = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 12,
  fontWeight: "600",
} as const;

const value = {
  color: "#fff",
  fontSize: 14,
  fontWeight: "600",
} as const;

const sectionTitle = {
  color: "#fff",
  fontSize: 16,
  fontWeight: "700",
  marginBottom: 10,
} as const;