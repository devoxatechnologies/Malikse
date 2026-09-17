import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { authService } from "../../src/services/authService";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const { user } = useAuthStore();

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role.toUpperCase()}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Mobile</Text>
          <Text style={styles.val}>{user.mobile}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Identity Verified</Text>
          <Text style={[styles.val, { color: user.isVerifiedIdentity ? "#0F5132" : "#B02A37" }]}>
            {user.isVerifiedIdentity ? "Yes" : "No"}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutTxt}>{t(language, "auth_logout")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 16, paddingTop: 60 },
  header: { alignItems: "center", marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#2A85FF", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  avatarTxt: { fontSize: 32, color: "#FFF", fontWeight: "bold" },
  name: { fontSize: 24, fontWeight: "bold", color: "#111", marginBottom: 4 },
  role: { fontSize: 12, color: "#666", backgroundColor: "#EAEAEA", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: "hidden" },
  section: { backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "#EAEAEA" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  label: { fontSize: 16, color: "#666" },
  val: { fontSize: 16, color: "#111", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#EAEAEA", marginVertical: 8 },
  logoutBtn: { backgroundColor: "#FFF", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#FF3B30", alignItems: "center" },
  logoutTxt: { color: "#FF3B30", fontSize: 16, fontWeight: "bold" }
});
