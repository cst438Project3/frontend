import { StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";

export default function DashboardScreen() {
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
			<StatusBar barStyle="light-content" />

			<LinearGradient
				colors={["#0a0a0a", "#1a0533", "#0d0d0d"]}
				style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
			/>

			<Box
				style={{
					position: "absolute",
					width: 220,
					height: 220,
					borderRadius: 110,
					backgroundColor: "rgba(147, 51, 234, 0.15)",
					top: -40,
					right: -60,
				}}
			/>
			<Box
				style={{
					position: "absolute",
					width: 180,
					height: 180,
					borderRadius: 90,
					backgroundColor: "rgba(168, 85, 247, 0.12)",
					bottom: -20,
					left: -40,
				}}
			/>

			<ScrollView
				contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 30 }}
				showsVerticalScrollIndicator={false}
			>
				<VStack space="md">
					<Text style={{ color: "#ffffff", fontSize: 30, fontWeight: "800" }}>
						Dashboard
					</Text>
					<Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>
						Start with schools, then build your transfer plan.
					</Text>
				</VStack>

				<LinearGradient
					colors={["rgba(147, 51, 234, 0.45)", "rgba(76, 29, 149, 0.45)"]}
					style={{
						borderRadius: 28,
						borderWidth: 1,
						borderColor: "rgba(216, 180, 254, 0.35)",
						padding: 18,
						gap: 12,
					}}
				>
					<HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
						<Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "800" }}>
							Start here
						</Text>
						<Text style={{ color: "#e9d5ff", fontSize: 13, fontWeight: "700" }}>
							Recommended
						</Text>
					</HStack>
					<Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
						Choose your schools first so transfer paths and comparisons are personalized.
					</Text>
					<Button
						onPress={() => router.push("/dashboard/transfer-path")}
						style={{ borderRadius: 999, backgroundColor: "#ffffff", height: 46 }}
					>
						<ButtonText style={{ color: "#4c1d95", fontWeight: "800" }}>
							Choose Schools
						</ButtonText>
					</Button>
				</LinearGradient>

				<VStack space="md">
					<Button
						onPress={() => router.push("/dashboard/profile")}
						style={{ borderRadius: 999, backgroundColor: "#7c3aed", height: 52 }}
					>
						<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
							View Profile
						</ButtonText>
					</Button>

					<Button
						onPress={() => router.push("/dashboard/classes")}
						style={{ borderRadius: 999, backgroundColor: "#6d28d9", height: 52 }}
					>
						<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
							Add Classes Taken
						</ButtonText>
					</Button>

					<Button
						onPress={() => router.push("/dashboard/transfer-path")}
						style={{ borderRadius: 999, backgroundColor: "#5b21b6", height: 52 }}
					>
						<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
							Create Transfer Path
						</ButtonText>
					</Button>

					<Button
						onPress={() => router.push("/dashboard/compare-plans")}
						style={{ borderRadius: 999, backgroundColor: "#4c1d95", height: 52 }}
					>
						<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
							Compare Transfer Plans
						</ButtonText>
					</Button>
				</VStack>

				<Button
					onPress={() => router.replace("/")}
					style={{ borderRadius: 999, backgroundColor: "#9333ea", height: 52 }}
				>
					<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
						Log out
					</ButtonText>
				</Button>
			</ScrollView>
		</SafeAreaView>
	);
}
