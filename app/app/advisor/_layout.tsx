import { Stack } from "expo-router";

export default function AdvisorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="tasks" />
    </Stack>
  );
}
