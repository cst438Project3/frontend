import { useState } from "react";
import {
  View,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";

const recentSearches = [
  "CST 300",
  "CST 336",
  "CST 370",
  "CST 205",
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");

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
              Search courses and find transfer equivalencies.
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

          <VStack space="md">
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
              }}
            >
              Recent Searches
            </Text>

            <HStack space="sm" style={{ flexWrap: "wrap" }}>
              {recentSearches.map((item) => (
                <Pressable key={item} onPress={() => setQuery(item)}>
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
                Results
              </Text>
            </HStack>

            {query.length === 0 ? (
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
                  Start searching
                </Text>

                <Text
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  Enter a course name, code, or school to find transfer matches.
                </Text>
              </Box>
            ) : (
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
                <Text style={{ fontSize: 22, marginBottom: 8 }}>⏳</Text>

                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Searching...
                </Text>
              </Box>
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}