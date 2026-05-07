import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { getMe, getMyProfile, updateMyProfile } from "@/src/services/user-data";

export default function ProfileScreen() {
	const [profile, setProfile] = useState({
		fullName: "Jane Student",
		currentCollege: "",
		targetUniversity: "",
		major: "",
	});
	const [draftProfile, setDraftProfile] = useState(profile);
	const [isEditing, setIsEditing] = useState(false);
	const [loadingProfile, setLoadingProfile] = useState(true);
	const [profileError, setProfileError] = useState("");
	const [savingProfile, setSavingProfile] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				setLoadingProfile(true);
				setProfileError("");

				const [me, savedProfile] = await Promise.all([getMe(), getMyProfile()]);

				const nextProfile = {
					fullName: me?.name || "",
					currentCollege: savedProfile?.currentCollege || "",
					targetUniversity: savedProfile?.targetUniversity || "",
					major: savedProfile?.major || "",
				};

				setProfile(nextProfile);
				setDraftProfile(nextProfile);
			} catch (error) {
				setProfileError(error instanceof Error ? error.message : "Could not load profile");
			} finally {
				setLoadingProfile(false);
			}
		};

		load();
	}, []);

	const startEditing = () => {
		setDraftProfile(profile);
		setIsEditing(true);
	};

	const saveProfile = async () => {
		try {
			setSavingProfile(true);
			setProfileError("");
			await updateMyProfile({
				currentCollege: draftProfile.currentCollege,
				targetUniversity: draftProfile.targetUniversity,
				major: draftProfile.major,
			});
			setProfile(draftProfile);
			setIsEditing(false);
		} catch (error) {
			setProfileError(error instanceof Error ? error.message : "Could not save profile");
		} finally {
			setSavingProfile(false);
		}
	};

	const cancelEditing = () => {
		setDraftProfile(profile);
		setIsEditing(false);
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
			<StatusBar barStyle="light-content" />
			<LinearGradient
				colors={["#0a0a0a", "#1a0533", "#0d0d0d"]}
				style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
			/>

			<VStack style={{ flex: 1, padding: 24, gap: 14 }}>
				<Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "800" }}>
					Your Profile
				</Text>
				{loadingProfile ? <Text style={{ color: "rgba(255,255,255,0.6)" }}>Loading profile...</Text> : null}
				{profileError ? <Text style={{ color: "#fca5a5" }}>{profileError}</Text> : null}

				<Box
					style={{
						borderRadius: 16,
						padding: 16,
						backgroundColor: "rgba(255,255,255,0.05)",
						borderWidth: 1,
						borderColor: "rgba(147, 51, 234, 0.2)",
					}}
				>
					{isEditing ? (
						<VStack space="sm">
							<Input
								style={{
									borderRadius: 12,
									backgroundColor: "rgba(255,255,255,0.05)",
									borderColor: "rgba(147, 51, 234, 0.3)",
								}}
							>
								<InputField
									placeholder="Full name"
									placeholderTextColor="rgba(255,255,255,0.3)"
									value={draftProfile.fullName}
									onChangeText={(value) =>
										setDraftProfile((prev) => ({ ...prev, fullName: value }))
									}
									style={{ color: "#ffffff" }}
								/>
							</Input>

							<Input
								style={{
									borderRadius: 12,
									backgroundColor: "rgba(255,255,255,0.05)",
									borderColor: "rgba(147, 51, 234, 0.3)",
								}}
							>
								<InputField
									placeholder="Current college"
									placeholderTextColor="rgba(255,255,255,0.3)"
									value={draftProfile.currentCollege}
									onChangeText={(value) =>
										setDraftProfile((prev) => ({ ...prev, currentCollege: value }))
									}
									style={{ color: "#ffffff" }}
								/>
							</Input>

							<Input
								style={{
									borderRadius: 12,
									backgroundColor: "rgba(255,255,255,0.05)",
									borderColor: "rgba(147, 51, 234, 0.3)",
								}}
							>
								<InputField
									placeholder="Target university"
									placeholderTextColor="rgba(255,255,255,0.3)"
									value={draftProfile.targetUniversity}
									onChangeText={(value) =>
										setDraftProfile((prev) => ({ ...prev, targetUniversity: value }))
									}
									style={{ color: "#ffffff" }}
								/>
							</Input>

							<Input
								style={{
									borderRadius: 12,
									backgroundColor: "rgba(255,255,255,0.05)",
									borderColor: "rgba(147, 51, 234, 0.3)",
								}}
							>
								<InputField
									placeholder="Major"
									placeholderTextColor="rgba(255,255,255,0.3)"
									value={draftProfile.major}
									onChangeText={(value) =>
										setDraftProfile((prev) => ({ ...prev, major: value }))
									}
									style={{ color: "#ffffff" }}
								/>
							</Input>
						</VStack>
					) : (
						<>
							<Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
								Name: {profile.fullName}
							</Text>
							<Text style={{ color: "rgba(255,255,255,0.72)", marginTop: 8 }}>
								Current College: {profile.currentCollege}
							</Text>
							<Text style={{ color: "rgba(255,255,255,0.72)", marginTop: 8 }}>
								Target University: {profile.targetUniversity}
							</Text>
							<Text style={{ color: "rgba(255,255,255,0.72)", marginTop: 8 }}>
								Major: {profile.major}
							</Text>
						</>
					)}
				</Box>

				{isEditing ? (
					<HStack space="md">
						<Button
							onPress={cancelEditing}
							style={{ flex: 1, borderRadius: 14, backgroundColor: "#6b7280", height: 50 }}
						>
							<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
								Cancel
							</ButtonText>
						</Button>
						<Button
							onPress={saveProfile}
							isDisabled={savingProfile}
							style={{ flex: 1, borderRadius: 14, backgroundColor: "#7c3aed", height: 50 }}
						>
							<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
								{savingProfile ? "Saving..." : "Save"}
							</ButtonText>
						</Button>
					</HStack>
				) : (
					<Button
						onPress={startEditing}
						style={{ borderRadius: 14, backgroundColor: "#7c3aed", height: 50 }}
					>
						<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
							Edit Profile
						</ButtonText>
					</Button>
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
