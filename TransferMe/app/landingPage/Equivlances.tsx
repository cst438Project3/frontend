import { useCallback, useMemo } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useState } from "react";
import { getTransferPlans, TransferPlan } from "@/src/lib/transfer-storage";

type EquivalencyClass = {
  code: string;
  title: string;
  credits: number;
  sourceCollege: string;
  targetUniversities: string[];
};

export default function EquivlancesScreen() {
  const [plans, setPlans] = useState<TransferPlan[]>([]);
  const { width } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      getTransferPlans().then(setPlans);
    }, [])
  );

  const classesBySchool = useMemo(() => {
    const map = new Map<string, Map<string, EquivalencyClass>>();

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
          });
          return;
        }

        if (!existing.targetUniversities.includes(plan.university)) {
          existing.targetUniversities.push(plan.university);
        }
      });
    });

    return [...map.entries()]
      .map(([school, classMap]) => ({
        school,
        classes: [...classMap.values()].sort((a, b) => a.code.localeCompare(b.code)),
      }))
      .sort((a, b) => a.school.localeCompare(b.school));
  }, [plans]);

  const columns = width >= 1200 ? 3 : width >= 760 ? 2 : 1;
  const cardWidth = columns === 3 ? "31.5%" : columns === 2 ? "48.5%" : "100%";

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
          Classes that transfer, grouped by school.
        </Text>
      </VStack>

      {classesBySchool.length === 0 ? (
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
            No equivalencies yet. Generate at least one transfer plan first.
          </Text>
        </Box>
      ) : (
        <VStack space="lg">
          {classesBySchool.map((group) => (
            <VStack key={group.school} space="sm">
              <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#ffffff", fontSize: 17, fontWeight: "700" }}>
                  {group.school}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                  {group.classes.length} classes
                </Text>
              </HStack>

              <HStack style={{ flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }}>
                {group.classes.map((item) => (
                  <Box
                    key={`${group.school}-${item.code}-${item.title}`}
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
                      {item.code}
                    </Text>
                    <Text style={{ color: "#c4b5fd", fontSize: 13, marginTop: 2 }}>
                      {item.title}
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 6 }}>
                      {item.credits} credits
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 6 }}>
                      Transfers to: {item.targetUniversities.slice(0, 3).join(", ")}
                      {item.targetUniversities.length > 3
                        ? ` +${item.targetUniversities.length - 3} more`
                        : ""}
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
