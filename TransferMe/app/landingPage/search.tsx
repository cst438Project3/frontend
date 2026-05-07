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
  getAllInstitutions,
  getSavedClasses,
  getSelectedClassIds,
  removeSavedClass,
  SavedClass,
  setSelectedClassIds as persistSelectedClassIds,
  toggleSelectedClass,
} from "@/src/lib/transfer-storage";
import { COURSE_MAPPINGS_BY_UNIVERSITY, ALL_UNIVERSITIES } from "@/src/lib/course-mappings";

const recentSearches = [
  "CST 300",
  "CST 336",
  "CST 370",
  "CST 205",
];

type ClassSuggestion = {
  code: string;
  title: string;
  credits: number;
  sourceCollege: string;
};

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [classCode, setClassCode] = useState("");
  const [classTitle, setClassTitle] = useState("");
  const [credits, setCredits] = useState("");
  const [bulkClassText, setBulkClassText] = useState("");
  const [isClassInputFocused, setIsClassInputFocused] = useState(false);
  const [sourceCollege, setSourceCollege] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState<string[]>([]);
  const [isSourceFocused, setIsSourceFocused] = useState(false);
  const [savedClasses, setSavedClasses] = useState<SavedClass[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [checkedForDeleteIds, setCheckedForDeleteIds] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    const [classes, selected, institutions] = await Promise.all([
      getSavedClasses(),
      getSelectedClassIds(),
      getAllInstitutions(),
    ]);

    setSavedClasses(classes);
    setSelectedClassIds(selected);
    setCheckedForDeleteIds((prev) => prev.filter((id) => classes.some((c) => c.id === id)));
    setSourceSuggestions(institutions);
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

  const classSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const suggestions: ClassSuggestion[] = [];

    for (const item of savedClasses) {
      const key = `${item.code}|${item.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      suggestions.push({
        code: item.code,
        title: item.title,
        credits: item.credits,
        sourceCollege: item.sourceCollege || "My Institution",
      });
    }

    for (const university of ALL_UNIVERSITIES) {
      const mappings = COURSE_MAPPINGS_BY_UNIVERSITY[university] || [];
      for (const mapping of mappings) {
        const code = `${mapping.sendingPrefix} ${mapping.sendingNumber}`;
        const key = `${code}|${mapping.sendingTitle}`;
        if (seen.has(key)) continue;
        seen.add(key);
        suggestions.push({
          code,
          title: mapping.sendingTitle,
          credits: mapping.sendingUnits,
          sourceCollege: "Monterey Peninsula College",
        });
      }
    }

    return suggestions;
  }, [savedClasses]);

  const filteredClassSuggestions = useMemo(() => {
    const codeQuery = classCode.trim().toLowerCase();
    const titleQuery = classTitle.trim().toLowerCase();

    if (!codeQuery && !titleQuery) {
      return classSuggestions.slice(0, 6);
    }

    return classSuggestions
      .filter((item) => {
        const codeMatches = codeQuery ? item.code.toLowerCase().includes(codeQuery) : true;
        const titleMatches = titleQuery ? item.title.toLowerCase().includes(titleQuery) : true;
        return codeMatches && titleMatches;
      })
      .slice(0, 6);
  }, [classCode, classSuggestions, classTitle]);

  const shouldShowClassSuggestions = isClassInputFocused && filteredClassSuggestions.length > 0;

  // Show suggestions dropdown if focused, regardless of whether there are matches yet
  const shouldShowSourceSuggestions = isSourceFocused && sourceSuggestions.length > 0;

  const selectedCount = selectedClassIds.length;
  const selectedAllVisibleForPlan =
    filteredClasses.length > 0 && filteredClasses.every((item) => selectedClassIds.includes(item.id));
  const selectedAllVisibleForDelete =
    filteredClasses.length > 0 && filteredClasses.every((item) => checkedForDeleteIds.includes(item.id));

  const normalizeCode = (value: string) =>
    value
      .toUpperCase()
      .replace(/\s+/g, " ")
      .trim();

  const normalizeTitle = (value: string) => value.replace(/\s+/g, " ").trim();

  const schoolAliases: Record<string, string> = {
    "csu monterey bay": "California State University, Monterey Bay",
    "cal state monterey bay": "California State University, Monterey Bay",
    "monterey peninsula college": "Monterey Peninsula College",
  };

  const normalizeSchoolName = (value: string) => {
    const raw = value.replace(/\s+/g, " ").trim();
    if (!raw) return "My Institution";

    const alias = schoolAliases[raw.toLowerCase()];
    const candidate = alias || raw;

    const exactMatch = sourceSuggestions.find(
      (s) => s.toLowerCase() === candidate.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    const compact = candidate.toLowerCase().replace(/[^a-z0-9]/g, "");
    const fuzzyMatch = sourceSuggestions.find(
      (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "") === compact
    );

    return fuzzyMatch || candidate;
  };

  const parseBulkClasses = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const parsed: Array<{
      code: string;
      title: string;
      credits: number;
      sourceCollege: string;
    }> = [];

    let invalidCount = 0;

    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length < 4) {
        invalidCount += 1;
        continue;
      }

      const code = normalizeCode(parts[0]);
      const title = normalizeTitle(parts[1]);
      const credits = Number.parseFloat(parts[2]);
      const sourceCollege = normalizeSchoolName(parts.slice(3).join(", "));

      if (!code || !title || !Number.isFinite(credits) || credits <= 0) {
        invalidCount += 1;
        continue;
      }

      parsed.push({
        code,
        title,
        credits,
        sourceCollege,
      });
    }

    return { parsed, invalidCount };
  };

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

  const handleBulkImport = async () => {
    if (!bulkClassText.trim()) {
      Alert.alert("Nothing to import", "Paste classes first.");
      return;
    }

    const { parsed, invalidCount } = parseBulkClasses(bulkClassText);
    if (parsed.length === 0) {
      Alert.alert(
        "No valid rows",
        invalidCount > 0
          ? `Could not parse ${invalidCount} row(s). Check the format: CODE, TITLE, CREDITS, SCHOOL`
          : "No rows found."
      );
      return;
    }

    const existingKeys = new Set(
      savedClasses.map(
        (c) =>
          `${normalizeCode(c.code)}|${normalizeTitle(c.title).toLowerCase()}|${Number(c.credits)}|${normalizeSchoolName(c.sourceCollege).toLowerCase()}`
      )
    );

    const uniqueToImport: typeof parsed = [];
    const seenInBatch = new Set<string>();

    for (const item of parsed) {
      const key = `${item.code}|${item.title.toLowerCase()}|${Number(item.credits)}|${item.sourceCollege.toLowerCase()}`;
      if (existingKeys.has(key) || seenInBatch.has(key)) {
        continue;
      }
      seenInBatch.add(key);
      uniqueToImport.push(item);
    }

    if (uniqueToImport.length === 0) {
      Alert.alert("Nothing new", "All parsed classes already exist.");
      return;
    }

    for (const item of uniqueToImport) {
      await addSavedClass(item);
    }

    setBulkClassText("");
    await loadData();

    Alert.alert(
      "Import complete",
      `Added ${uniqueToImport.length} classes${invalidCount ? `, skipped ${invalidCount} invalid row(s)` : ""}.`
    );
  };

  const handleRemoveClass = async (id: string) => {
    const updated = await removeSavedClass(id);
    setSavedClasses(updated.classes);
    setSelectedClassIds(updated.selectedIds);
    setCheckedForDeleteIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleToggleDeleteCheck = (id: string) => {
    setCheckedForDeleteIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleCheckAllForPlan = async () => {
    const visibleIds = filteredClasses.map((item) => item.id);
    if (visibleIds.length === 0) return;

    const nextSelected = selectedAllVisibleForPlan
      ? selectedClassIds.filter((id) => !visibleIds.includes(id))
      : [...new Set([...selectedClassIds, ...visibleIds])];

    const persisted = await persistSelectedClassIds(nextSelected);
    setSelectedClassIds(persisted);
  };

  const handleCheckAllForDelete = () => {
    const visibleIds = filteredClasses.map((item) => item.id);
    if (visibleIds.length === 0) return;

    setCheckedForDeleteIds((prev) =>
      selectedAllVisibleForDelete
        ? prev.filter((id) => !visibleIds.includes(id))
        : [...new Set([...prev, ...visibleIds])]
    );
  };

  const handleDeleteChecked = async () => {
    if (checkedForDeleteIds.length === 0) {
      Alert.alert("No classes checked", "Check classes in the Delete column first.");
      return;
    }

    for (const id of checkedForDeleteIds) {
      await removeSavedClass(id);
    }

    setCheckedForDeleteIds([]);
    await loadData();
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
              onFocus={() => setIsClassInputFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsClassInputFocused(false), 120);
              }}
              onChangeText={(value) => {
                setClassCode(value);
                setIsClassInputFocused(true);
              }}
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

            {shouldShowClassSuggestions && (
              <Box
                style={{
                  backgroundColor: "rgba(17, 24, 39, 0.95)",
                  borderWidth: 1,
                  borderColor: "rgba(147, 51, 234, 0.35)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {filteredClassSuggestions.map((item) => (
                  <Pressable
                    key={`${item.code}-${item.title}`}
                    onPress={() => {
                      setClassCode(item.code);
                      setClassTitle(item.title);
                      setCredits(String(item.credits));
                      if (!sourceCollege.trim()) {
                        setSourceCollege(item.sourceCollege);
                      }
                      setIsClassInputFocused(false);
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: "rgba(147, 51, 234, 0.15)",
                    }}
                  >
                    <Text style={{ color: "#e9d5ff", fontSize: 13, fontWeight: "700" }}>
                      {item.code}
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                      {item.title}
                    </Text>
                  </Pressable>
                ))}
              </Box>
            )}

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

            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                marginTop: 10,
              }}
            >
              Bulk Import Classes
            </Text>

            <TextInput
              placeholder="Paste rows: CODE, TITLE, CREDITS, SCHOOL"
              placeholderTextColor="rgba(255,255,255,0.28)"
              value={bulkClassText}
              onChangeText={setBulkClassText}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(147, 51, 234, 0.28)",
                borderRadius: 12,
                color: "#ffffff",
                paddingHorizontal: 12,
                paddingVertical: 10,
                minHeight: 140,
              }}
            />

            <TouchableOpacity
              onPress={handleBulkImport}
              style={{
                backgroundColor: "rgba(124, 58, 237, 0.85)",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                Import Pasted Classes
              </Text>
            </TouchableOpacity>
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

            <HStack space="sm" style={{ flexWrap: "wrap" }}>
              <TouchableOpacity
                onPress={handleCheckAllForPlan}
                style={{
                  backgroundColor: "rgba(124, 58, 237, 0.2)",
                  borderWidth: 1,
                  borderColor: "rgba(124, 58, 237, 0.45)",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: "#ddd6fe", fontSize: 12, fontWeight: "700" }}>
                  {selectedAllVisibleForPlan ? "Uncheck All (Plan)" : "Check All (Plan)"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCheckAllForDelete}
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.14)",
                  borderWidth: 1,
                  borderColor: "rgba(239, 68, 68, 0.35)",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: "#fecaca", fontSize: 12, fontWeight: "700" }}>
                  {selectedAllVisibleForDelete ? "Uncheck All (Delete)" : "Check All (Delete)"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteChecked}
                style={{
                  backgroundColor: "rgba(220, 38, 38, 0.2)",
                  borderWidth: 1,
                  borderColor: "rgba(220, 38, 38, 0.45)",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: "#fca5a5", fontSize: 12, fontWeight: "700" }}>
                  Delete Checked ({checkedForDeleteIds.length})
                </Text>
              </TouchableOpacity>
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
                  const isCheckedForDelete = checkedForDeleteIds.includes(item.id);

                  return (
                    <Box
                      key={item.id}
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

                        <HStack space="md" style={{ alignItems: "center" }}>
                          <TouchableOpacity
                            onPress={() => handleToggleSelected(item.id)}
                            style={{ alignItems: "center" }}
                          >
                            <Box
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 6,
                                borderWidth: 1,
                                borderColor: "rgba(196, 181, 253, 0.8)",
                                backgroundColor: isSelected
                                  ? "rgba(196, 181, 253, 0.85)"
                                  : "transparent",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 3,
                              }}
                            >
                              {isSelected ? (
                                <Text style={{ color: "#1f1238", fontSize: 12 }}>✓</Text>
                              ) : null}
                            </Box>
                            <Text style={{ color: "#ddd6fe", fontSize: 10, fontWeight: "700" }}>
                              PLAN
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleToggleDeleteCheck(item.id)}
                            style={{ alignItems: "center" }}
                          >
                            <Box
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 6,
                                borderWidth: 1,
                                borderColor: "rgba(252, 165, 165, 0.8)",
                                backgroundColor: isCheckedForDelete
                                  ? "rgba(252, 165, 165, 0.85)"
                                  : "transparent",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 3,
                              }}
                            >
                              {isCheckedForDelete ? (
                                <Text style={{ color: "#3f0f0f", fontSize: 12 }}>✓</Text>
                              ) : null}
                            </Box>
                            <Text style={{ color: "#fecaca", fontSize: 10, fontWeight: "700" }}>
                              DELETE
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => handleRemoveClass(item.id)}>
                            <Text style={{ color: "#fca5a5", fontSize: 11, fontWeight: "700" }}>
                              REMOVE
                            </Text>
                          </TouchableOpacity>
                        </HStack>
                      </HStack>
                    </Box>
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