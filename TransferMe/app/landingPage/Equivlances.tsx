import { useCallback, useMemo, useState } from "react";
import { ScrollView, useWindowDimensions, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  getSavedClasses,
  getTransferPlans,
  SavedClass,
  TransferPlan,
} from "@/src/lib/transfer-storage";
import { findMappingsForCourse, getReceivingCourse } from "@/src/lib/course-mappings";

type EquivalencyClass = {
  code: string;
  title: string;
  credits: number;
  sourceCollege: string;
  targetUniversities: string[];
  transferableAs: string[];
};

type EquivalencyGroup = {
  key: string;
  sourceCollege: string;
  classes: EquivalencyClass[];
  transferableAs: string[];
  targetUniversities: string[];
};

function parseCourseCode(code: string): { prefix: string; number: string } | null {
  const normalized = code.replace(/\s+/g, " ").trim();
  if (!normalized) return null;

  const parts = normalized.split(" ");
  if (parts.length < 2) return null;

  const prefix = parts[0].toUpperCase();
  const number = parts.slice(1).join("").toUpperCase();

  if (!prefix || !number) return null;
  return { prefix, number };
}

function normalizeTitle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function normalizeCode(value: string): string {
  return value.toUpperCase().replace(/\s+/g, " ").trim();
}

export default function EquivlancesScreen() {
  const [savedClasses, setSavedClasses] = useState<SavedClass[]>([]);
  const [plans, setPlans] = useState<TransferPlan[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      Promise.all([getSavedClasses(), getTransferPlans()]).then(
        ([classes, transferPlans]) => {
          setSavedClasses(classes);
          setPlans(transferPlans);
        }
      );
    }, [])
  );

  const classesBySchool = useMemo(() => {
    const map = new Map<string, Map<string, EquivalencyClass>>();

    savedClasses.forEach((item) => {
      const school = item.sourceCollege || "Unknown School";
      const classKey = `${item.code}|${item.title}`;

      if (!map.has(school)) {
        map.set(school, new Map<string, EquivalencyClass>());
      }

      const schoolMap = map.get(school)!;
      if (!schoolMap.has(classKey)) {
        schoolMap.set(classKey, {
          code: item.code,
          title: item.title,
          credits: item.credits,
          sourceCollege: school,
          targetUniversities: [],
          transferableAs: [],
        });
      }
    });

    plans.forEach((plan) => {
      plan.classes.forEach((item) => {
        const school = item.sourceCollege || "Unknown School";
        const classKey = `${item.code}|${item.title}`;

        if (!map.has(school)) {
          map.set(school, new Map<string, EquivalencyClass>());
        }

        const schoolMap = map.get(school)!;
        const existing = schoolMap.get(classKey);

        if (!existing) {
          schoolMap.set(classKey, {
            code: item.code,
            title: item.title,
            credits: item.credits,
            sourceCollege: school,
            targetUniversities: [plan.university],
            transferableAs: [],
          });
          return;
        }

        if (!existing.targetUniversities.includes(plan.university)) {
          existing.targetUniversities.push(plan.university);
        }
      });
    });

    map.forEach((schoolMap) => {
      schoolMap.forEach((course) => {
        const parsed = parseCourseCode(course.code);
        if (!parsed) {
          course.transferableAs = [];
          return;
        }

        // Find mappings for each target university
        const allMappings: { university: string; mapping: string }[] = [];
        course.targetUniversities.forEach((university) => {
          const mappings = findMappingsForCourse(parsed.prefix, parsed.number, university);
          mappings.forEach((m) => {
            const mapping = `${getReceivingCourse(m)} · ${m.receivingTitle}`;
            if (!allMappings.some((am) => am.mapping === mapping)) {
              allMappings.push({ university, mapping });
            }
          });
        });

        course.transferableAs = allMappings.map((am) => am.mapping);
      });
    });

    return [...map.entries()]
      .map(([school, classMap]) => {
        const groupMap = new Map<string, EquivalencyGroup>();
        const targetByCode = new Map<string, string>();

        [...classMap.values()].forEach((course) => {
          course.transferableAs.forEach((mapped) => {
            const [mappedCode] = mapped.split(" · ");
            if (!mappedCode) return;
            const key = normalizeCode(mappedCode);
            if (!targetByCode.has(key)) {
              targetByCode.set(key, mapped);
            }
          });
        });

        [...classMap.values()].forEach((course) => {
          const transferables = [...course.transferableAs];
          if (transferables.length === 0) {
            const linkedTarget = targetByCode.get(normalizeCode(course.code));
            if (linkedTarget) {
              transferables.push(linkedTarget);
            }
          }

          const transferKey = transferables.sort().join("||");
          const fallbackKey = `${normalizeTitle(course.title)}|${course.credits}`;
          const key = transferKey ? `transfer:${transferKey}` : `fallback:${fallbackKey}`;

          if (!groupMap.has(key)) {
            groupMap.set(key, {
              key,
              sourceCollege: course.sourceCollege,
              classes: [],
              transferableAs: [],
              targetUniversities: [],
            });
          }

          const existing = groupMap.get(key)!;
          existing.classes.push(course);

          course.transferableAs.forEach((mapped) => {
            if (!existing.transferableAs.includes(mapped)) {
              existing.transferableAs.push(mapped);
            }
          });

          course.targetUniversities.forEach((university) => {
            if (!existing.targetUniversities.includes(university)) {
              existing.targetUniversities.push(university);
            }
          });
        });

        return {
          school,
          groups: [...groupMap.values()].sort((a, b) =>
            a.classes[0]?.code.localeCompare(b.classes[0]?.code || "")
          ),
        };
      })
      .sort((a, b) => a.school.localeCompare(b.school));
  }, [plans, savedClasses]);

  const columns = width >= 1200 ? 3 : width >= 760 ? 2 : 1;
  const cardWidth = columns === 3 ? "31.5%" : columns === 2 ? "48.5%" : "100%";
  const plannedUniversities = useMemo(
    () => [...new Set(plans.map((p) => p.university))],
    [plans]
  );

  // Filter and compute university-specific mappings when a university is selected
  const filteredData = useMemo(() => {
    if (!selectedUniversity) {
      return classesBySchool;
    }

    const filtered = classesBySchool
      .map((schoolGroup) => {
        const groups = schoolGroup.groups
          .map((group) => {
            const selectedMappings = new Set<string>();

            group.classes.forEach((course) => {
              const parsed = parseCourseCode(course.code);
              if (!parsed) return;

              const mappings = findMappingsForCourse(
                parsed.prefix,
                parsed.number,
                selectedUniversity
              );

              mappings.forEach((m) => {
                selectedMappings.add(
                  `${getReceivingCourse(m)} · ${m.receivingTitle}`
                );
              });
            });

            return {
              ...group,
              transferableAs: [...selectedMappings],
              targetUniversities: group.targetUniversities.includes(selectedUniversity)
                ? [selectedUniversity]
                : [],
            };
          })
          .filter((group) => group.transferableAs.length > 0);

        return {
          ...schoolGroup,
          groups,
        };
      })
      .filter((schoolGroup) => schoolGroup.groups.length > 0);

    return filtered;
  }, [classesBySchool, selectedUniversity]);

  const schoolTransferStats = useMemo(() => {
    const stats = new Map<string, { transferred: number; total: number }>();

    classesBySchool.forEach((schoolGroup) => {
      const classMap = new Map<string, boolean>();

      schoolGroup.groups.forEach((group) => {
        group.classes.forEach((course) => {
          const classKey = `${course.code}|${course.title}`;
          if (classMap.has(classKey)) return;

          const parsed = parseCourseCode(course.code);
          if (!parsed) {
            classMap.set(classKey, false);
            return;
          }

          const universitiesToCheck = selectedUniversity
            ? [selectedUniversity]
            : course.targetUniversities;

          const doesTransfer = universitiesToCheck.some((university) =>
            findMappingsForCourse(parsed.prefix, parsed.number, university).length > 0
          );

          classMap.set(classKey, doesTransfer);
        });
      });

      const total = classMap.size;
      const transferred = [...classMap.values()].filter(Boolean).length;

      stats.set(schoolGroup.school, { transferred, total });
    });

    return stats;
  }, [classesBySchool, selectedUniversity]);

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
          Equivalencies
        </Text>

        <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
          Preset classes grouped by school, with transfer mappings.
        </Text>
      </VStack>

      {plans.length > 1 && (
        <VStack space="sm">
          <Text style={{ fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.65)" }}>
            Filter by University
          </Text>
          <HStack style={{ flexWrap: "wrap", gap: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedUniversity(null)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 8,
                backgroundColor:
                  selectedUniversity === null
                    ? "rgba(147, 51, 234, 0.6)"
                    : "rgba(255,255,255,0.08)",
                borderWidth: 1,
                borderColor:
                  selectedUniversity === null
                    ? "rgba(147, 51, 234, 0.8)"
                    : "rgba(147, 51, 234, 0.2)",
              }}
            >
              <Text
                style={{
                  color: selectedUniversity === null ? "#ffffff" : "rgba(255,255,255,0.6)",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                All Universities
              </Text>
            </TouchableOpacity>

            {plannedUniversities.map((university) => (
                <TouchableOpacity
                  key={university}
                  onPress={() => setSelectedUniversity(university)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    backgroundColor:
                      selectedUniversity === university
                        ? "rgba(147, 51, 234, 0.6)"
                        : "rgba(255,255,255,0.08)",
                    borderWidth: 1,
                    borderColor:
                      selectedUniversity === university
                        ? "rgba(147, 51, 234, 0.8)"
                        : "rgba(147, 51, 234, 0.2)",
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedUniversity === university ? "#ffffff" : "rgba(255,255,255,0.6)",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {university.includes("Monterey Bay") ? "CSUMB" : "Cal Poly SLO"}
                  </Text>
                </TouchableOpacity>
              ))}
          </HStack>
        </VStack>
      )}

      {filteredData.length === 0 ? (
        <Box
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "rgba(147, 51, 234, 0.18)",
            padding: 16,
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
            {selectedUniversity
              ? "No transferable classes found for this university yet."
              : "No classes yet. Add classes in Search to build mappings."}
          </Text>
        </Box>
      ) : (
        <VStack space="lg">
          {filteredData.map((group) => (
            <VStack key={group.school} space="sm">
                            {selectedUniversity && (
                              <Box
                                style={{
                                  backgroundColor: "rgba(147, 51, 234, 0.15)",
                                  borderRadius: 8,
                                  borderWidth: 1,
                                  borderColor: "rgba(147, 51, 234, 0.3)",
                                  padding: 10,
                                }}
                              >
                                <HStack
                                  style={{
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <VStack space="xs">
                                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#ffffff" }}>
                                      {selectedUniversity.includes("Monterey Bay") ? "CSUMB" : "Cal Poly SLO"}
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        color: "rgba(255,255,255,0.65)",
                                      }}
                                    >
                                      {schoolTransferStats.get(group.school)?.transferred ?? 0} of {schoolTransferStats.get(group.school)?.total ?? 0} courses transfer
                                    </Text>
                                  </VStack>
                                  <Text
                                    style={{
                                      fontSize: 24,
                                      fontWeight: "700",
                                      color: "#c084fc",
                                    }}
                                  >
                                    {schoolTransferStats.get(group.school)?.transferred ?? 0}
                                  </Text>
                                </HStack>
                              </Box>
                            )}

              <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#ffffff", fontSize: 17, fontWeight: "700" }}>
                  {group.school}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                  {group.groups.length} equivalency groups
                </Text>
              </HStack>

              <HStack style={{ flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }}>
                {group.groups.map((item) => (
                  <Box
                    key={`${group.school}-${item.key}`}
                    style={{
                      width: cardWidth,
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "rgba(147, 51, 234, 0.2)",
                      padding: 12,
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "700" }}>
                      {item.classes.length > 1
                        ? `Equivalent Classes (${item.classes.length})`
                        : item.classes[0]?.code}
                    </Text>

                    {item.classes.map((sourceClass) => (
                      <Text
                        key={`${item.key}-${sourceClass.code}-${sourceClass.title}`}
                        style={{ color: "#c4b5fd", fontSize: 13, marginTop: 2 }}
                      >
                        {sourceClass.code} · {sourceClass.title} ({sourceClass.credits} credits)
                      </Text>
                    ))}

                    <Text style={{ color: "rgba(196,181,253,0.9)", fontSize: 11, marginTop: 6 }}>
                      {item.transferableAs.length === 0
                        ? "Directly transferable to: No direct equivalency found"
                        : `Directly transferable to: ${item.transferableAs[0]}${
                            item.transferableAs.length > 1
                              ? ` (+${item.transferableAs.length - 1} more)`
                              : ""
                          }`}
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 6 }}>
                      {item.targetUniversities.length === 0
                        ? "Transfers to: Not mapped yet"
                        : `Transfers to: ${item.targetUniversities.slice(0, 3).join(", ")}${
                            item.targetUniversities.length > 3
                              ? ` +${item.targetUniversities.length - 3} more`
                              : ""
                          }`}
                    </Text>
                  </Box>
                ))}
              </HStack>
            </VStack>
          ))}
        </VStack>
      )}
    </ScrollView>
  );
}
