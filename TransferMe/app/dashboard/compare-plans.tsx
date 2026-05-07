import { useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";

export default function ComparePlansScreen() {
	const [showComparison, setShowComparison] = useState(false);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
			<StatusBar barStyle="light-content" />
			<LinearGradient
				colors={["#0a0a0a", "#1a0533", "#0d0d0d"]}
				style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
			/>

			<VStack style={{ flex: 1, padding: 24, gap: 14 }}>
				<Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "800" }}>
					Compare Transfer Plans
				</Text>
				<Text style={{ color: "rgba(255,255,255,0.65)" }}>
					Compare your top two options side-by-side.
				</Text>

				<Button
					onPress={() => setShowComparison(true)}
					style={{ borderRadius: 14, backgroundColor: "#4c1d95", height: 50 }}
				>
					<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
						Run Comparison
					</ButtonText>
				</Button>

				{showComparison && (
					<HStack space="md" style={{ alignItems: "stretch" }}>
						<Box
							style={{
								flex: 1,
								borderRadius: 14,
								padding: 12,
								backgroundColor: "rgba(255,255,255,0.05)",
								borderWidth: 1,
								borderColor: "rgba(147, 51, 234, 0.2)",
							}}
						>
							<Text style={{ color: "#ffffff", fontWeight: "700" }}>Plan A</Text>
							<Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 8 }}>
								Estimated transferable credits: 54
							</Text>
							<Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
								Time to transfer: 3 terms
							</Text>
						</Box>

						<Box
							style={{
								flex: 1,
								borderRadius: 14,
								padding: 12,
								backgroundColor: "rgba(255,255,255,0.05)",
								borderWidth: 1,
								borderColor: "rgba(147, 51, 234, 0.2)",
							}}
						>
							<Text style={{ color: "#ffffff", fontWeight: "700" }}>Plan B</Text>
							<Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 8 }}>
								Estimated transferable credits: 48
							</Text>
							<Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
								Time to transfer: 2 terms
							</Text>
						</Box>
					</HStack>
				)}

				<Button
					onPress={() => router.replace("/")}
					style={{ borderRadius: 14, backgroundColor: "#7c3aed", height: 50 }}
				>
					<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
						Back to Home
					</ButtonText>
				</Button>
			</VStack>
		</SafeAreaView>
	);
}
