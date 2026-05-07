import { useState } from "react";
import { ScrollView, TextInput } from "react-native";
import { router } from "expo-router";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";

export default function CreatePlanScreen() {
  const [currentSchool, setCurrentSchool] = useState("");
  const [targetSchool, setTargetSchool] = useState("");
  const [program, setProgram] = useState("");

  const handleCreatePlan = () => {
    // TODO: backend connection 
    router.push("/transferPlan/1" as any);
  };

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
          Create Plan
        </Text>

        <Text style={{ color: "rgba(192,132,252,0.65)", fontSize: 13 }}>
          Add your school and target program to start planning.
        </Text>
      </VStack>

      <Box
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderWidth: 1,
          borderColor: "rgba(147,51,234,0.22)",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <VStack space="lg">
          <InputBlock
            label="Current School"
            value={currentSchool}
            onChangeText={setCurrentSchool}
            placeholder="Community College A"
          />

          <InputBlock
            label="Target University"
            value={targetSchool}
            onChangeText={setTargetSchool}
            placeholder="CSUMB"
          />

          <InputBlock
            label="Target Program"
            value={program}
            onChangeText={setProgram}
            placeholder="Computer Science"
          />

          <Pressable onPress={handleCreatePlan}>
            <Box
              style={{
                backgroundColor: "#9333ea",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                Create Transfer Plan
              </Text>
            </Box>
          </Pressable>
        </VStack>
      </Box>
    </ScrollView>
  );
}

function InputBlock({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <VStack space="xs">
      <Text
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 12,
          fontWeight: "700",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.25)"
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          borderWidth: 1,
          borderColor: "rgba(147,51,234,0.3)",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
          color: "#ffffff",
          fontSize: 14,
        }}
      />
    </VStack>
  );
}