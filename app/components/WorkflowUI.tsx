import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AppHeader from "./AppHeader";

export function WorkflowScreen({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: "#F5F8F6" }}><AppHeader showNavLinks={false} showPostPropertyBtn={false} showHomeButton />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}><Text style={ui.title}>{title}</Text>{children}</ScrollView>
  </View>;
}
export function Action({ title, onPress, disabled, secondary = false }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={[ui.button, secondary && ui.secondary, disabled && { opacity: 0.5 }]}><Text style={[ui.buttonText, secondary && { color: "#047857" }]}>{title}</Text></TouchableOpacity>;
}
export function Field({ label, value, onChangeText, numeric = false, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; numeric?: boolean; multiline?: boolean }) {
  return <View style={{ gap: 6 }}><Text style={ui.label}>{label}</Text><TextInput accessibilityLabel={label} style={[ui.input, multiline && { minHeight: 90, textAlignVertical: "top" }]} value={value} onChangeText={onChangeText} keyboardType={numeric ? "numbers-and-punctuation" : "default"} multiline={multiline} /></View>;
}
export function Check({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={ui.check}><Text style={ui.text}>{checked ? "☑" : "☐"} {label}</Text></TouchableOpacity>;
}
export const ui = StyleSheet.create({
  content: { width: "100%", maxWidth: 1000, alignSelf: "center", padding: 20, paddingBottom: 48, gap: 16 },
  title: { color: "#10251B", fontSize: 28, fontWeight: "800" },
  heading: { color: "#10251B", fontSize: 19, fontWeight: "700" },
  text: { color: "#244536", fontSize: 15, lineHeight: 23 },
  muted: { color: "#607269", lineHeight: 22 },
  error: { color: "#B91C1C", lineHeight: 22 },
  card: { backgroundColor: "white", borderRadius: 12, borderWidth: 1, borderColor: "#D7E6DC", padding: 18, gap: 12 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" },
  button: { backgroundColor: "#047857", padding: 14, borderRadius: 9, alignSelf: "flex-start" },
  secondary: { backgroundColor: "#E5F3EA" },
  buttonText: { color: "white", fontWeight: "700" },
  label: { color: "#244536", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#BBD1C3", backgroundColor: "white", borderRadius: 8, padding: 12, color: "#10251B", fontSize: 16, minHeight: 46 },
  check: { paddingVertical: 10 },
});
