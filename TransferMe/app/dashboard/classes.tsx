import { useState } from "react";
import { StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";

export default function ClassesScreen() {
	const [courseName, setCourseName] = useState("");
	const [completedCourses, setCompletedCourses] = useState<string[]>([]);

	const addCourse = () => {
		const trimmed = courseName.trim();
		if (!trimmed) return;
		setCompletedCourses((prev) => [...prev, trimmed]);
		setCourseName("");
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
			<StatusBar barStyle="light-content" />
			<LinearGradient
				colors={["#0a0a0a", "#1a0533", "#0d0d0d"]}
				style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
			/>

			<ScrollView
				contentContainerStyle={{ padding: 24, gap: 14, paddingBottom: 30 }}
				showsVerticalScrollIndicator={false}
			>
				<Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "800" }}>
					Classes Taken
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
					onPress={addCourse}
					style={{ borderRadius: 14, backgroundColor: "#6d28d9", height: 50 }}
				>
					<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
						Add Class
					</ButtonText>
				</Button>

				<VStack space="sm">
					{completedCourses.length === 0 ? (
						<Text style={{ color: "rgba(255,255,255,0.6)" }}>
							No classes added yet.
						</Text>
					) : (
						completedCourses.map((course, index) => (
							<Box
								key={`${course}-${index}`}
								style={{
									borderRadius: 12,
									padding: 12,
									backgroundColor: "rgba(255,255,255,0.05)",
									borderWidth: 1,
									borderColor: "rgba(147, 51, 234, 0.2)",
								}}
							>
								<Text style={{ color: "#ffffff" }}>{course}</Text>
							</Box>
						))
					)}
				</VStack>

				<Button
					onPress={() => router.replace("/")}
					style={{ borderRadius: 14, backgroundColor: "#7c3aed", height: 50 }}
				>
					<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
						Back to Home
					</ButtonText>
				</Button>
			</ScrollView>
		</SafeAreaView>
	);
}
