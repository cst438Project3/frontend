import { useState } from "react";
import { ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { useTransferPlan } from "@/src/context/transfer-plan-context";

export default function EquivlancesScreen() {
  const { classes, loadingClasses, classesError, addCourse, deleteCourse, clearCourses } = useTransferPlan();
  const [courseName, setCourseName] = useState("");

  const onAdd = async () => {
    if (!courseName.trim()) return;
    await addCourse(courseName);
    setCourseName("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0a0a0a", "#1a0533", "#0d0d0d"]}
        style={{ position: "absolute", inset: 0 }}
      />

      <ScrollView
        contentContainerStyle={{ padding: 24, gap: 14, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "800" }}>
          Equivalencies
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          Add completed classes and track likely transfer outcomes.
        </Text>

        <Input
          style={{
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.05)",
            borderColor: "rgba(147, 51, 234, 0.3)",
          }}
        >
          <InputField
            placeholder="Example: MATH 101 - College Algebra"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={courseName}
            onChangeText={setCourseName}
            style={{ color: "#ffffff" }}
          />
        </Input>

        <Button
          onPress={onAdd}
          style={{ borderRadius: 12, backgroundColor: "#7c3aed", height: 48 }}
        >
          <ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
            Add Class
          </ButtonText>
        </Button>

        {loadingClasses ? (
          <Text style={{ color: "rgba(255,255,255,0.6)" }}>Loading classes...</Text>
        ) : classes.length === 0 ? (
          <Text style={{ color: "rgba(255,255,255,0.6)" }}>No classes added yet.</Text>
        ) : (
          <VStack space="sm">
            {classes.map((item) => (
              <Box
                key={item.id}
                style={{
                  borderRadius: 14,
                  padding: 12,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderWidth: 1,
                  borderColor: "rgba(147,51,234,0.2)",
                }}
              >
                <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: "#ffffff", fontWeight: "600", flex: 1 }}>
                    {item.courseName}
                  </Text>
                  <Pressable onPress={() => deleteCourse(item.id)}>
                    <Text style={{ color: "#c084fc", fontWeight: "600" }}>Remove</Text>
                  </Pressable>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}

        {classesError ? <Text style={{ color: "#fca5a5" }}>{classesError}</Text> : null}

        {classes.length > 0 ? (
          <Button
            onPress={clearCourses}
            style={{ borderRadius: 12, backgroundColor: "#4b5563", height: 44 }}
          >
            <ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
              Clear All
            </ButtonText>
          </Button>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
