import { Stack } from "expo-router";
import { RiskProvider } from "../context/RiskContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <RiskProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Stack screenOptions={{ headerShown: false, animation: "none" }} />
      </SafeAreaView>
    </RiskProvider>
  );
}
