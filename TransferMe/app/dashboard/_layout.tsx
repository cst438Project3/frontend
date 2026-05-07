import { Stack } from "expo-router";

export default function DashboardLayout() {
	return <Stack initialRouteName="transfer-path" screenOptions={{ headerShown: false }} />;
}
