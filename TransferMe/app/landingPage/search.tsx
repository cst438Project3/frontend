import { useCallback, useMemo, useState } from "react";
import {
  View,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";
import {
  addSavedClass,
  getKnownInstitutions,
  getSavedClasses,
  getSelectedClassIds,
  removeSavedClass,
  SavedClass,
  toggleSelectedClass,
} from "@/src/lib/transfer-storage";

const recentSearches = [
  "CST 300",
  "CST 336",
  "CST 370",
  "CST 205",
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [classCode, setClassCode] = useState("");
  const [classTitle, setClassTitle] = useState("");
  const [credits, setCredits] = useState("");
  const [sourceCollege, setSourceCollege] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState<string[]>([]);
  const [isSourceFocused, setIsSourceFocused] = useState(false);
  const [savedClasses, setSavedClasses] = useState<SavedClass[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    const [classes, selected, institutions] = await Promise.all([
      getSavedClasses(),
      getSelectedClassIds(),
      getKnownInstitutions(),
    ]);

    setSavedClasses(classes);
    setSelectedClassIds(selected);
    setSourceSuggestions(institutions.sourceColleges);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredClasses = useMemo(() => {
    if (!query.trim()) return savedClasses;
    const lower = query.toLowerCase();
    return savedClasses.filter(
      (item) =>
        item.code.toLowerCase().includes(lower) ||
        item.title.toLowerCase().includes(lower) ||
        item.sourceCollege.toLowerCase().includes(lower)
    );
  }, [query, savedClasses]);

  const filteredSourceSuggestions = useMemo(() => {
    const normalized = sourceCollege.trim().toLowerCase();

    // When focused and no text, show all suggestions (up to 6)
    if (!normalized) {
      return sourceSuggestions.slice(0, 6);
    }

    // When typing, filter suggestions
    return sourceSuggestions
      .filter((item) => item.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [sourceCollege, sourceSuggestions]);

  // Show suggestions dropdown if focused, regardless of whether there are matches yet
  const shouldShowSourceSuggestions = isSourceFocused && sourceSuggestions.length > 0;

  const selectedCount = selectedClassIds.length;

  const handleAddClass = async () => {
    const parsedCredits = Number(credits);

    if (!classCode.trim() || !classTitle.trim()) {
      Alert.alert("Missing details", "Please fill in class code and title.");
      return;
    }

    if (!Number.isFinite(parsedCredits) || parsedCredits <= 0) {
      Alert.alert("Invalid credits", "Credits must be a number greater than 0.");
      return;
    }

    try {
      const updated = await addSavedClass({
        code: classCode,
        title: classTitle,
        credits: parsedCredits,
        sourceCollege: sourceCollege.trim() || undefined,
      });

      setSavedClasses(updated);
      setClassCode("");
      setClassTitle("");
      setCredits("");
      setSourceCollege("");
      Alert.alert("Success", "Class saved!");
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to save class. Please try again.";
      Alert.alert("Save error", message);
    }
  };

  const handleToggleSelected = async (id: string) => {
    const updated = await toggleSelectedClass(id);
    setSelectedClassIds(updated);
  };

  const handleRemoveClass = async (id: string) => {
    const updated = await removeSavedClass(id);
    setSavedClasses(updated.classes);
    setSelectedClassIds(updated.selectedIds);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#0a0a0a", "#1a0533", "#0d0d0d"]}
        style={{ position: "absolute", inset: 0 }}
      />

      <View
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "rgba(139, 92, 246, 0.18)",
          top: -90,
          right: -90,
        }}
      />

      <View
        style={{
          position: "absolute",
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: "rgba(168, 85, 247, 0.12)",
          bottom: 40,
          left: -100,
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="xl">
          <VStack space="xs">
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#ffffff",
                letterSpacing: -1,
              }}
            >
              Credit Transfer Search
            </Text>

            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
              Add your classes, select them, then generate a transfer plan.
            </Text>
          </VStack>

          <Box
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "rgba(147, 51, 234, 0.25)",
              padding: 14,
            }}
          >
            <HStack space="sm" style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, color: "#c084fc" }}>🔍</Text>

              <TextInput
                placeholder="Search by course, school, or keyword"
                placeholderTextColor="rgba(255,255,255,0.28)"
                value={query}
                onChangeText={setQuery}
                style={{
                  flex: 1,
                  color: "#ffffff",
                  fontSize: 15,
                  paddingVertical: 8,
                }}
              />

              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")}>
                  <Text style={{ color: "rgba(255,255,255,0.45)" }}>✕</Text>
                </TouchableOpacity>
              )}
            </HStack>
          </Box>

          <VStack
            space="sm"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "rgba(147, 51, 234, 0.25)",
              padding: 14,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
              }}
            >
              Add Class
            </Text>

            <TextInput
              placeholder="Class code (e.g., CST 336)"
              placeholderTextColor="rgba(255,255,255,0.28)"
              value={classCode}
              onChangeText={setClassCode}
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

            <TextInput
              placeholder="Class title"
              placeholderTextColor="rgba(255,255,255,0.28)"
              value={classTitle}
              onChangeText={setClassTitle}
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

            <HStack space="sm">
              <TextInput
                placeholder="Credits"
                placeholderTextColor="rgba(255,255,255,0.28)"
                value={credits}
                onChangeText={setCredits}
                keyboardType="numeric"
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(147, 51, 234, 0.28)",
                  borderRadius: 12,
                  color: "#ffffff",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              />

              <TextInput
                placeholder="Source college"
                placeholderTextColor="rgba(255,255,255,0.28)"
                value={sourceCollege}
                onChangeText={setSourceCollege}
                onFocus={() => setIsSourceFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsSourceFocused(false), 120);
                }}
                style={{
                  flex: 2,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(147, 51, 234, 0.28)",
                  borderRadius: 12,
                  color: "#ffffff",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              />
            </HStack>

            {shouldShowSourceSuggestions && (
              <Box
                style={{
                  backgroundColor: "rgba(17, 24, 39, 0.95)",
                  borderWidth: 1,
                  borderColor: "rgba(147, 51, 234, 0.35)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {filteredSourceSuggestions.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setSourceCollege(item);
                      setIsSourceFocused(false);
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: "rgba(147, 51, 234, 0.15)",
                    }}
                  >
                    <Text style={{ color: "#e9d5ff", fontSize: 13 }}>{item}</Text>
                  </Pressable>
                ))}
              </Box>
            )}

            <TouchableOpacity
              onPress={handleAddClass}
              style={{
                backgroundColor: "#7c3aed",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                Save Class
              </Text>
            </TouchableOpacity>

            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              {selectedCount} selected for plan generation
            </Text>
          </VStack>

          <VStack space="md">
            <HStack style={{ justifyContent: "space-between" }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "rgba(255,255,255,0.55)",
                  textTransform: "uppercase",
                }}
              >
                Saved Classes
              </Text>

              <Pressable onPress={() => router.push("/landingPage/transferPlan" as any)}>
                <Text style={{ color: "#c084fc", fontSize: 13, fontWeight: "700" }}>
                  Generate Plan
                </Text>
              </Pressable>
            </HStack>

            {filteredClasses.length === 0 ? (
              <Box
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderRadius: 20,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: "rgba(147, 51, 234, 0.18)",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 28, marginBottom: 8 }}>🔍</Text>

                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 6,
                  }}
                >
                  No classes yet
                </Text>

                <Text
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  Add classes above to build transfer plans.
                </Text>
              </Box>
            ) : (
              <VStack space="sm">
                {filteredClasses.map((item) => {
                  const isSelected = selectedClassIds.includes(item.id);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleToggleSelected(item.id)}
                    >
                      <Box
                        style={{
                          backgroundColor: "rgba(255,255,255,0.04)",
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: isSelected
                            ? "rgba(196, 181, 253, 0.85)"
                            : "rgba(147, 51, 234, 0.18)",
                          padding: 14,
                        }}
                      >
                        <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
                          <VStack space="xs" style={{ flex: 1 }}>
                            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                              {item.code} · {item.title}
                            </Text>
                            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                              {item.credits} credits · {item.sourceCollege}
                            </Text>
                          </VStack>

                          <HStack space="sm" style={{ alignItems: "center" }}>
                            <Text style={{ color: isSelected ? "#c4b5fd" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "700" }}>
                              {isSelected ? "SELECTED" : "SELECT"}
                            </Text>

                            <TouchableOpacity onPress={() => handleRemoveClass(item.id)}>
                              <Text style={{ color: "#fca5a5", fontSize: 12, fontWeight: "700" }}>
                                REMOVE
                              </Text>
                            </TouchableOpacity>
                          </HStack>
                        </HStack>
                      </Box>
                    </Pressable>
                  );
                })}
              </VStack>
            )}
          </VStack>

          <VStack space="md">
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
              }}
            >
              Quick Fill
            </Text>

            <HStack space="sm" style={{ flexWrap: "wrap" }}>
              {recentSearches.map((item) => (
                <Pressable key={item} onPress={() => setClassCode(item)}>
                  <Box
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 999,
                      backgroundColor: "rgba(147, 51, 234, 0.15)",
                      borderWidth: 1,
                      borderColor: "rgba(147, 51, 234, 0.28)",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: "#d8b4fe", fontSize: 13 }}>
                      {item}
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </HStack>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}