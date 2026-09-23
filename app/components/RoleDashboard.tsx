import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import type { UserRole } from "../src/types/auth.types";
import { authService } from "../src/services/authService";

type Section = { title: string; description: string; route?: Href };

export default function RoleDashboard({ role, title, subtitle, sections }: {
  role: UserRole;
  title: string;
  subtitle: string;
  sections: Section[];
}) {
  const router = useRouter();
  const { user, authState } = useAuthStore();

  if (authState !== "AUTHENTICATED" || user?.role !== role) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Sign in as {role}</Text>
        <Text style={styles.subtitle}>This dashboard is available to the {role} role.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/login")}>
          <Text style={styles.buttonText}>Go to sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>MALIKSE · {role.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.welcome}>Welcome, {user.name}</Text>
      <TouchableOpacity accessibilityRole="button" style={styles.link} onPress={() => router.replace("/search")}>
        <Text style={styles.linkText}>← Verified properties</Text>
      </TouchableOpacity>
      <View style={styles.grid}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.title}
            style={styles.card}
            disabled={!section.route}
            onPress={() => section.route && router.push(section.route)}
          >
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardDescription}>{section.description}</Text>
            <Text style={styles.cardAction}>{section.route ? "Open →" : "Coming later"}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity accessibilityRole="button" style={styles.link} onPress={() => router.push("/profile")}>
        <Text style={styles.linkText}>My profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => { authService.logout().finally(() => router.replace("/login")); }}>
        <Text style={styles.linkText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8F6", padding: 20 },
  content: { width: "100%", maxWidth: 960, alignSelf: "center", paddingBottom: 40 },
  eyebrow: { color: "#047857", fontWeight: "800", marginTop: 20, letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: "800", color: "#10251B", marginTop: 14 },
  subtitle: { fontSize: 15, color: "#53645B", marginTop: 8, lineHeight: 22 },
  welcome: { fontSize: 17, fontWeight: "600", color: "#244536", marginTop: 24, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: "100%", maxWidth: 300, minHeight: 150, borderWidth: 1, borderColor: "#D7E6DC", borderRadius: 14, backgroundColor: "white", padding: 18 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#10251B" },
  cardDescription: { fontSize: 13, color: "#607269", lineHeight: 19, marginTop: 8, flex: 1 },
  cardAction: { color: "#047857", fontWeight: "700", marginTop: 12 },
  button: { backgroundColor: "#047857", borderRadius: 10, padding: 14, marginTop: 20 },
  buttonText: { color: "white", fontWeight: "700", textAlign: "center" },
  link: { paddingVertical: 20, alignSelf: "flex-start" },
  linkText: { color: "#52655A", fontWeight: "700" },
});
