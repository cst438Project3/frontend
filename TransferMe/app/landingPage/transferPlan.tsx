import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  clearSelectedClasses,
  createTransferPlan,
  deleteTransferPlan,
  getAllInstitutions,
  getKnownInstitutions,
  getSavedClasses,
  getSelectedClassIds,
  getTransferPlans,
  SavedClass,
  TransferPlan,
} from "@/src/lib/transfer-storage";

export default function TransferPlanScreen() {
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState("");
  const [universitySuggestions, setUniversitySuggestions] = useState<string[]>([]);
  const [isUniversityFocused, setIsUniversityFocused] = useState(false);
  const [savedClasses, setSavedClasses] = useState<SavedClass[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [plans, setPlans] = useState<TransferPlan[]>([]);

  const loadData = useCallback(async () => {
    const [classes, selectedIds, transferPlans, allInstitutions] = await Promise.all([
      getSavedClasses(),
      getSelectedClassIds(),
      getTransferPlans(),
      getAllInstitutions(),
    ]);

    setSavedClasses(classes);
    setSelectedClassIds(selectedIds);
    setPlans(transferPlans);
    setUniversitySuggestions(allInstitutions);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const selectedClasses = useMemo(
    () => savedClasses.filter((item) => selectedClassIds.includes(item.id)),
    [savedClasses, selectedClassIds]
  );

  const selectedCredits = selectedClasses.reduce(
    (sum, item) => sum + item.credits,
    0
  );

  const filteredUniversitySuggestions = useMemo(() => {
    const normalized = university.trim().toLowerCase();

    if (!normalized) {
      return universitySuggestions.slice(0, 6);
    }

    return universitySuggestions
      .filter((item) => item.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [university, universitySuggestions]);

  const handleGeneratePlan = async () => {
    if (!university.trim() || !program.trim()) {
      Alert.alert("Missing details", "Please enter a university and program.");
      return;
    }

    const newPlan = await createTransferPlan({
      university,
      program,
      status: "Planned",
    });

    if (!newPlan) {
      Alert.alert(
        "No selected classes",
        "Select classes from the Search tab before generating a plan."
      );
      return;
    }

    await clearSelectedClasses();
    setUniversity("");
    setProgram("");
    await loadData();

    Alert.alert("Transfer plan generated", "Your transfer plan was saved.");
  };

  const handleDeletePlan = async (id: string) => {
    const updated = await deleteTransferPlan(id);
    setPlans(updated);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 22,
        paddingBottom: 40,
        gap: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <VStack space="xs">
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#ffffff",
            letterSpacing: -1,
          }}
        >
          My Transfer Plans
        </Text>

        <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
          Generate plans from selected classes and save them.
        </Text>
      </VStack>

      <Box
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "rgba(147, 51, 234, 0.25)",
          padding: 14,
        }}
      >
        <VStack space="sm">
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "rgba(255,255,255,0.55)",
              textTransform: "uppercase",
            }}
          >
            Generate Transfer Plan
          </Text>

          <TextInput
            value={university}
            onChangeText={setUniversity}
            onFocus={() => setIsUniversityFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsUniversityFocused(false), 120);
            }}
            placeholder="Target university"
            placeholderTextColor="rgba(255,255,255,0.28)"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderColor: "rgba(147, 51, 234, 0.28)",
              borderRadius: 12,
              color: "#ffffff",
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />

          {isUniversityFocused && filteredUniversitySuggestions.length > 0 && (
            <Box
              style={{
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                borderWidth: 1,
                borderColor: "rgba(147, 51, 234, 0.35)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {filteredUniversitySuggestions.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    setUniversity(item);
                    setIsUniversityFocused(false);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(147, 51, 234, 0.15)",
                  }}
                >
                  <Text style={{ color: "#e9d5ff", fontSize: 13 }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </Box>
          )}

          <TextInput
            value={program}
            onChangeText={setProgram}
            placeholder="Program"
            placeholderTextColor="rgba(255,255,255,0.28)"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderColor: "rgba(147, 51, 234, 0.28)",
              borderRadius: 12,
              color: "#ffffff",
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />

          <HStack style={{ justifyContent: "space-between" }}>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              {selectedClasses.length} selected classes · {selectedCredits} credits
            </Text>
          </HStack>

          <TouchableOpacity
            onPress={handleGeneratePlan}
            style={{
              backgroundColor: "#7c3aed",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "700" }}>
              Generate Transfer Plan
            </Text>
          </TouchableOpacity>
        </VStack>
      </Box>

      <VStack space="sm">
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "rgba(255,255,255,0.55)",
            textTransform: "uppercase",
          }}
        >
          Selected Classes
        </Text>

        {selectedClasses.length === 0 ? (
          <Box
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(147, 51, 234, 0.18)",
              padding: 14,
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              No classes selected. Go to Search and tap classes to select them.
            </Text>
          </Box>
        ) : (
          <VStack space="sm">
            {selectedClasses.map((item) => (
              <Box
                key={item.id}
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(147, 51, 234, 0.18)",
                  padding: 14,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                  {item.code} · {item.title}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                  {item.credits} credits · {item.sourceCollege}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>

      <VStack space="sm">
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "rgba(255,255,255,0.55)",
            textTransform: "uppercase",
          }}
        >
          Saved Plans
        </Text>

        {plans.length === 0 ? (
          <Box
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(147, 51, 234, 0.18)",
              padding: 14,
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              No transfer plans saved yet.
            </Text>
          </Box>
        ) : (
          <VStack space="sm">
            {plans.map((plan) => (
              <Box
                key={plan.id}
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(147, 51, 234, 0.18)",
                  padding: 14,
                  gap: 8,
                }}
              >
                <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <VStack space="xs" style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                      {plan.university}
                    </Text>
                    <Text style={{ color: "#c4b5fd", fontSize: 13 }}>
                      {plan.program}
                    </Text>
                  </VStack>

                  <TouchableOpacity onPress={() => handleDeletePlan(plan.id)}>
                    <Text style={{ color: "#fca5a5", fontSize: 12, fontWeight: "700" }}>
                      DELETE
                    </Text>
                  </TouchableOpacity>
                </HStack>

                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                  {plan.credits} credits · {plan.classes.length} classes · {plan.sourceCollege}
                </Text>

                <VStack space="xs">
                  {plan.classes.map((item) => (
                    <Text key={`${plan.id}-${item.id}`} style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                      • {item.code} ({item.credits} cr)
                    </Text>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
}
