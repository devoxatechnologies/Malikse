/**
 * app/_layout.tsx
 * Root layout for the Landroid app.
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import "react-native-reanimated";

if (Platform.OS === "web" && typeof window !== "undefined") {
  const id = "leaflet-css";
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }
}

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="listing/create" options={{ headerShown: false }} />
        <Stack.Screen name="insights" options={{ headerShown: false }} />
        <Stack.Screen name="advisor" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
