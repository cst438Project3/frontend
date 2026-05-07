import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { PRELOADED_MAJORS } from "@/src/constants/majors";
import { fetchInstitutions, Institution } from "@/src/services/institutions";
import { saveTransferPath } from "@/src/services/user-data";
import { useTransferPlan } from "@/src/context/transfer-plan-context";

export default function TransferPlanScreen() {
  const { completedCourses, loadingClasses, classesError } = useTransferPlan();

  const [fromSchool, setFromSchool] = useState("");
  const [toSchool, setToSchool] = useState("");
  const [major, setMajor] = useState("");
  const [activeField, setActiveField] = useState<"from" | "to">("from");

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        setLoadingSchools(true);
        setLoadError("");
        const data = await fetchInstitutions();
        setInstitutions(data);
      } catch {
        setLoadError("Could not load schools.");
      } finally {
        setLoadingSchools(false);
      }
    };

    loadInstitutions();
  }, []);

  const schoolSearchTerm = activeField === "from" ? fromSchool : toSchool;
  const isActivelyTypingSchool = schoolSearchTerm.trim().length >= 2;

  const filteredInstitutions = useMemo(() => {
    const query = schoolSearchTerm.trim().toLowerCase();
    if (query.length < 2) return [];

    return institutions
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [institutions, schoolSearchTerm]);

  const filteredMajors = useMemo(() => {
    const query = major.trim().toLowerCase();
    if (!query) return PRELOADED_MAJORS.slice(0, 8);
    return PRELOADED_MAJORS.filter((item) => item.toLowerCase().includes(query)).slice(0, 8);
  }, [major]);

  const mappedCourses = useMemo(() => {
    const majorText = major.trim().toLowerCase();
    const majorKeywords = ["cs", "computer", "software", "data", "engineering", "math", "business", "bio", "chem", "nursing"];
    const majorRelevant = majorKeywords.some((keyword) => majorText.includes(keyword));

    return completedCourses.map((course) => {
      const normalized = course.toLowerCase();

      if (
        majorText &&
        majorRelevant &&
        (normalized.includes("cs") || normalized.includes("cis") || normalized.includes("math") || normalized.includes("stat") || normalized.includes("eng"))
      ) {
        return { course, result: "Major requirement match" };
      }

      if (
        normalized.includes("math") ||
        normalized.includes("eng") ||
        normalized.includes("history") ||
        normalized.includes("psych") ||
        normalized.includes("bio") ||
        normalized.includes("chem")
      ) {
        return { course, result: "General education transfer" };
      }

      return { course, result: "Elective credit (advisor review)" };
    });
  }, [completedCourses, major]);

  const applySchoolSelection = (schoolName: string) => {
    if (activeField === "from") setFromSchool(schoolName);
    else setToSchool(schoolName);
  };

  const generateAndSave = async () => {
    if (!fromSchool.trim() || !toSchool.trim()) return;

    try {
      setSaving(true);
      setSaveError("");
      setSavedMessage("");

      await saveTransferPath({
        fromSchool: fromSchool.trim(),
        toSchool: toSchool.trim(),
        major: major.trim() || undefined,
        courses: mappedCourses.map((item) => ({
          courseName: item.course,
          mappingResult: item.result,
        })),
      });

      setShowResults(true);
      setSavedMessage("Transfer plan saved.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save transfer plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0a0a0a", "#1a0533", "#0d0d0d"]} style={{ position: "absolute", inset: 0 }} />

      <ScrollView contentContainerStyle={{ padding: 24, gap: 14, paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "800" }}>Create Transfer Plan</Text>
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Select schools, pick a major, then generate mappings.</Text>

        <Input
          onFocus={() => setActiveField("from")}
          style={{ borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(147, 51, 234, 0.3)" }}
        >
          <InputField
            placeholder="From school"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={fromSchool}
            onChangeText={setFromSchool}
            style={{ color: "#ffffff" }}
          />
        </Input>

        {activeField === "from" && isActivelyTypingSchool ? (
          <SuggestionList
            loading={loadingSchools}
            error={loadError}
            schools={filteredInstitutions}
            onSelect={applySchoolSelection}
          />
        ) : null}

        <Input
          onFocus={() => setActiveField("to")}
          style={{ borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(147, 51, 234, 0.3)" }}
        >
          <InputField
            placeholder="To school"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={toSchool}
            onChangeText={setToSchool}
            style={{ color: "#ffffff" }}
          />
        </Input>

        {activeField === "to" && isActivelyTypingSchool ? (
          <SuggestionList
            loading={loadingSchools}
            error={loadError}
            schools={filteredInstitutions}
            onSelect={applySchoolSelection}
          />
        ) : null}

        <Input style={{ borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(147, 51, 234, 0.3)" }}>
          <InputField
            placeholder="Major (optional)"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={major}
            onChangeText={setMajor}
            style={{ color: "#ffffff" }}
          />
        </Input>

        <Box style={{ borderRadius: 14, padding: 10, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(147,51,234,0.2)", gap: 8 }}>
          <Text style={{ color: "#ffffff", fontWeight: "700" }}>Pick a Major</Text>
          <Box style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {filteredMajors.map((item) => (
              <Pressable
                key={item}
                onPress={() => setMajor(item)}
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: major.trim().toLowerCase() === item.toLowerCase() ? "rgba(196,181,253,0.35)" : "rgba(124,58,237,0.25)",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>{item}</Text>
              </Pressable>
            ))}
          </Box>
        </Box>

        <Button onPress={generateAndSave} isDisabled={saving} style={{ borderRadius: 12, backgroundColor: "#7c3aed", height: 50 }}>
          <ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
            {saving ? "Saving Plan..." : "Generate Transfer Path"}
          </ButtonText>
        </Button>

        {saveError ? <Text style={{ color: "#fca5a5" }}>{saveError}</Text> : null}
        {savedMessage ? <Text style={{ color: "#86efac" }}>{savedMessage}</Text> : null}

        {showResults ? (
          <Box style={{ borderRadius: 16, padding: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(147,51,234,0.2)" }}>
            <Text style={{ color: "#ffffff", fontWeight: "700" }}>Path: {fromSchool} → {toSchool}</Text>
            {major.trim() ? <Text style={{ color: "#c4b5fd", marginTop: 6 }}>Major focus: {major}</Text> : null}

            <Text style={{ color: "#ffffff", fontWeight: "700", marginTop: 14 }}>Mapped Classes</Text>
            {loadingClasses ? <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 8 }}>Loading classes...</Text> : null}
            {classesError ? <Text style={{ color: "#fca5a5", marginTop: 8 }}>{classesError}</Text> : null}
            {mappedCourses.length === 0 ? (
              <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 8 }}>No classes available. Add classes in Equivalencies first.</Text>
            ) : (
              <VStack space="xs" style={{ marginTop: 8 }}>
                {mappedCourses.map((item, index) => (
                  <Box key={`${item.course}-${index}`} style={{ borderRadius: 12, padding: 10, backgroundColor: "rgba(124,58,237,0.2)" }}>
                    <Text style={{ color: "#fff", fontWeight: "600" }}>{item.course}</Text>
                    <Text style={{ color: "#ddd6fe", marginTop: 2, fontSize: 12 }}>{item.result}</Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SuggestionList({
  loading,
  error,
  schools,
  onSelect,
}: {
  loading: boolean;
  error: string;
  schools: Institution[];
  onSelect: (schoolName: string) => void;
}) {
  return (
    <Box
      style={{
        borderRadius: 14,
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(147, 51, 234, 0.2)",
        gap: 8,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#c4b5fd" />
      ) : error ? (
        <Text style={{ color: "#fca5a5" }}>{error}</Text>
      ) : schools.length === 0 ? (
        <Text style={{ color: "rgba(255,255,255,0.65)" }}>No matching schools found.</Text>
      ) : (
        schools.map((school) => (
          <Pressable
            key={school.id}
            onPress={() => onSelect(school.name)}
            style={{ borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "rgba(124,58,237,0.25)" }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "600" }}>{school.name}</Text>
          </Pressable>
        ))
      )}
    </Box>
  );
}
