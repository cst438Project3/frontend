import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { fetchInstitutions, Institution } from "@/src/services/institutions";
import { PRELOADED_MAJORS } from "@/src/constants/majors";
import { useTransferPlan } from "@/src/context/transfer-plan-context";
import { saveTransferPath } from "@/src/services/user-data";

export default function TransferPathScreen() {
	const { completedCourses, loadingClasses, classesError } = useTransferPlan();
	const [fromSchool, setFromSchool] = useState("");
	const [toSchool, setToSchool] = useState("");
	const [major, setMajor] = useState("");
	const [institutions, setInstitutions] = useState<Institution[]>([]);
	const [loadingSchools, setLoadingSchools] = useState(true);
	const [loadError, setLoadError] = useState("");
	const [activeField, setActiveField] = useState<"from" | "to">("from");
	const [showPath, setShowPath] = useState(false);
	const [savingPath, setSavingPath] = useState(false);
	const [saveError, setSaveError] = useState("");

	useEffect(() => {
		const loadInstitutions = async () => {
			try {
				setLoadingSchools(true);
				setLoadError("");
				const data = await fetchInstitutions();
				setInstitutions(data);
			} catch {
				setLoadError("Could not load schools from backend.");
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
			.filter((item) => {
				const matchName = item.name.toLowerCase().includes(query);
				const matchCode = item.code?.toLowerCase().includes(query) ?? false;
				return matchName || matchCode;
			})
			.slice(0, 8);
	}, [institutions, schoolSearchTerm]);

	const filteredMajors = useMemo(() => {
		const query = major.trim().toLowerCase();
		if (!query) return PRELOADED_MAJORS.slice(0, 8);

		return PRELOADED_MAJORS.filter((item) => item.toLowerCase().includes(query)).slice(0, 8);
	}, [major]);

	const generatePath = async () => {
		if (!fromSchool.trim() || !toSchool.trim()) return;

		try {
			setSavingPath(true);
			setSaveError("");
			await saveTransferPath({
				fromSchool: fromSchool.trim(),
				toSchool: toSchool.trim(),
				major: major.trim() || undefined,
				courses: mappedCourses.map((item) => ({
					courseName: item.course,
					mappingResult: item.result,
				})),
			});
			setShowPath(true);
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : "Could not save transfer path");
		} finally {
			setSavingPath(false);
		}
	};

	const mappedCourses = useMemo(() => {
		const majorText = major.trim().toLowerCase();
		const majorKeywords = ["cs", "computer", "software", "data", "engineering", "math", "business", "bio", "chem", "nursing"];
		const majorRelevant = majorKeywords.some((keyword) => majorText.includes(keyword));

		return completedCourses.map((course) => {
			const normalized = course.toLowerCase();

			if (majorText && majorRelevant && (normalized.includes("cs") || normalized.includes("cis") || normalized.includes("math") || normalized.includes("stat") || normalized.includes("eng"))) {
				return { course, result: "Major requirement match" };
			}

			if (normalized.includes("math") || normalized.includes("eng") || normalized.includes("history") || normalized.includes("psych") || normalized.includes("bio") || normalized.includes("chem")) {
				return { course, result: "General education transfer" };
			}

			return { course, result: "Elective credit (advisor review)" };
		});
	}, [completedCourses, major]);

	const applySchoolSelection = (schoolName: string) => {
		if (activeField === "from") {
			setFromSchool(schoolName);
		} else {
			setToSchool(schoolName);
		}
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
			<StatusBar barStyle="light-content" />
			<LinearGradient
				colors={["#0a0a0a", "#1a0533", "#0d0d0d"]}
				style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
			/>

			<ScrollView
				contentContainerStyle={{ padding: 24, gap: 14, paddingBottom: 28 }}
				showsVerticalScrollIndicator={false}
			>
				<Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "800" }}>
					Create Transfer Path
				</Text>
				<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>
					Search and choose schools from your backend data.
				</Text>

				<Input
					onFocus={() => setActiveField("from")}
					style={{
						borderRadius: 12,
						backgroundColor: "rgba(255,255,255,0.05)",
						borderColor: "rgba(147, 51, 234, 0.3)",
					}}
				>
					<InputField
						placeholder="From school"
						placeholderTextColor="rgba(255,255,255,0.3)"
						value={fromSchool}
						onChangeText={setFromSchool}
						style={{ color: "#ffffff" }}
					/>
				</Input>

				{activeField === "from" && isActivelyTypingSchool && (
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
						{loadingSchools ? (
							<ActivityIndicator color="#c4b5fd" />
						) : loadError ? (
							<Text style={{ color: "#fca5a5" }}>{loadError}</Text>
						) : filteredInstitutions.length === 0 ? (
							<Text style={{ color: "rgba(255,255,255,0.65)" }}>
								No matching schools found.
							</Text>
						) : (
							filteredInstitutions.map((school) => (
								<Pressable
									key={`from-${school.id}`}
									onPress={() => applySchoolSelection(school.name)}
									style={{
										borderRadius: 12,
										paddingVertical: 10,
										paddingHorizontal: 12,
										backgroundColor: "rgba(124, 58, 237, 0.25)",
									}}
								>
									<Text style={{ color: "#ffffff", fontWeight: "600" }}>
										{school.name}
									</Text>
								</Pressable>
							))
						)}
					</Box>
				)}

				<Input
					onFocus={() => setActiveField("to")}
					style={{
						borderRadius: 12,
						backgroundColor: "rgba(255,255,255,0.05)",
						borderColor: "rgba(147, 51, 234, 0.3)",
					}}
				>
					<InputField
						placeholder="To school"
						placeholderTextColor="rgba(255,255,255,0.3)"
						value={toSchool}
						onChangeText={setToSchool}
						style={{ color: "#ffffff" }}
					/>
				</Input>

				{activeField === "to" && isActivelyTypingSchool && (
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
						{loadingSchools ? (
							<ActivityIndicator color="#c4b5fd" />
						) : loadError ? (
							<Text style={{ color: "#fca5a5" }}>{loadError}</Text>
						) : filteredInstitutions.length === 0 ? (
							<Text style={{ color: "rgba(255,255,255,0.65)" }}>
								No matching schools found.
							</Text>
						) : (
							filteredInstitutions.map((school) => (
								<Pressable
									key={`to-${school.id}`}
									onPress={() => applySchoolSelection(school.name)}
									style={{
										borderRadius: 12,
										paddingVertical: 10,
										paddingHorizontal: 12,
										backgroundColor: "rgba(124, 58, 237, 0.25)",
									}}
								>
									<Text style={{ color: "#ffffff", fontWeight: "600" }}>
										{school.name}
									</Text>
								</Pressable>
							))
						)}
					</Box>
				)}

				<Input
					style={{
						borderRadius: 12,
						backgroundColor: "rgba(255,255,255,0.05)",
						borderColor: "rgba(147, 51, 234, 0.3)",
					}}
				>
					<InputField
						placeholder="Major (optional)"
						placeholderTextColor="rgba(255,255,255,0.3)"
						value={major}
						onChangeText={setMajor}
						style={{ color: "#ffffff" }}
					/>
				</Input>

				<Box
					style={{
						borderRadius: 16,
						padding: 14,
						backgroundColor: "rgba(255,255,255,0.04)",
						borderWidth: 1,
						borderColor: "rgba(147, 51, 234, 0.2)",
						gap: 10,
					}}
				>
					<Text style={{ color: "#ffffff", fontWeight: "700" }}>Pick a Major</Text>
					<Box style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
						{filteredMajors.map((item) => {
							const selected = major.trim().toLowerCase() === item.toLowerCase();
							return (
								<Pressable
									key={item}
									onPress={() => setMajor(item)}
									style={{
										borderRadius: 999,
										paddingVertical: 8,
										paddingHorizontal: 12,
										backgroundColor: selected
											? "rgba(196, 181, 253, 0.35)"
											: "rgba(124, 58, 237, 0.25)",
										borderWidth: selected ? 1 : 0,
										borderColor: "rgba(216, 180, 254, 0.75)",
									}}
								>
									<Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 13 }}>
										{item}
									</Text>
								</Pressable>
							);
						})}
					</Box>
				</Box>

				<Button
					onPress={generatePath}
					isDisabled={savingPath}
					style={{ borderRadius: 14, backgroundColor: "#5b21b6", height: 50 }}
				>
					<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
						{savingPath ? "Saving Transfer Path..." : "Generate Transfer Path"}
					</ButtonText>
				</Button>
				{saveError ? <Text style={{ color: "#fca5a5" }}>{saveError}</Text> : null}

				{showPath && (
					<Box
						style={{
							borderRadius: 16,
							padding: 16,
							backgroundColor: "rgba(255,255,255,0.05)",
							borderWidth: 1,
							borderColor: "rgba(147, 51, 234, 0.2)",
						}}
					>
						<Text style={{ color: "#ffffff", fontWeight: "700" }}>
							Path: {fromSchool} → {toSchool}
						</Text>
						{major.trim().length > 0 && (
							<Text style={{ color: "#c4b5fd", marginTop: 6, fontWeight: "600" }}>
								Major focus: {major}
							</Text>
						)}
						<Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 8 }}>
							1. Complete general education classes
						</Text>
						<Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
							2. {major.trim().length > 0 ? `Match ${major} prerequisites` : "Match major prerequisites"}
						</Text>
						<Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
							3. Submit transfer application by deadline
						</Text>

						<Text style={{ color: "#ffffff", fontWeight: "700", marginTop: 14 }}>
							Mapped Classes
						</Text>
						{loadingClasses ? (
							<Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 6 }}>Loading classes...</Text>
						) : null}
						{classesError ? (
							<Text style={{ color: "#fca5a5", marginTop: 6 }}>{classesError}</Text>
						) : null}
						{mappedCourses.length === 0 ? (
							<>
								<Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
									No classes found. Add classes first to map transfer credits.
								</Text>
								<Button
									onPress={() => router.push("/dashboard/classes")}
									style={{ borderRadius: 12, backgroundColor: "#6d28d9", height: 44, marginTop: 10 }}
								>
									<ButtonText style={{ color: "#ffffff", fontWeight: "700" }}>
										Add Classes
									</ButtonText>
								</Button>
							</>
						) : (
							<VStack space="xs" style={{ marginTop: 8 }}>
								{mappedCourses.map((item, index) => (
									<Box
										key={`${item.course}-${index}`}
										style={{
											borderRadius: 12,
											padding: 10,
											backgroundColor: "rgba(124, 58, 237, 0.2)",
										}}
									>
										<Text style={{ color: "#ffffff", fontWeight: "600" }}>{item.course}</Text>
										<Text style={{ color: "#ddd6fe", marginTop: 2, fontSize: 12 }}>
											{item.result}
										</Text>
									</Box>
								))}
							</VStack>
						)}
					</Box>
				)}

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
