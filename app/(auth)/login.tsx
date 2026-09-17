import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { authService } from "../../src/services/authService";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";
import { useAuthStore } from "../../src/store/authStore";
import { UserRole } from "../../src/types/auth.types";

export default function LoginScreen() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const authStore = useAuthStore();
  
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    let resolvedPassword = password;
    if (!resolvedPassword && typeof document !== "undefined") {
      const pwInput = document.querySelector('input[type="password"]') as HTMLInputElement | null;
      if (pwInput?.value) resolvedPassword = pwInput.value;
    }

    if (mobile.length < 10 || resolvedPassword.length < 6) {
      Alert.alert("Error", "Please enter valid credentials");
      return;
    }
    
    setLoading(true);
    try {
      const user = await authService.login(mobile, resolvedPassword);
      routeByRole(user.role);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const routeByRole = (role: UserRole | string) => {
    if (role === "owner") router.replace("/my-properties");
    else if (role === "buyer") router.replace("/search");
    else if (role === "advisor") router.replace("/advisor/tasks");
    else if (role === "admin") router.replace("/admin/dashboard");
    else router.replace("/profile");
  };

  // Quick Login for Dev
  const quickLogin = (role: UserRole) => {
    authStore.setTokens({ accessToken: "dummy_access", refreshToken: "dummy_refresh" });
    authStore.setUser({ id: "dummy_id", role, name: `Dev ${role}`, mobile: "9999999999", isVerifiedIdentity: true, createdAt: new Date().toISOString() });
    authStore.setAuthState("AUTHENTICATED");
    routeByRole(role);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t(language, "auth_welcome")}</Text>
      <Text style={styles.subtitle}>{t(language, "auth_tagline")}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>{t(language, "auth_mobile")}</Text>
        <TextInput
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          placeholder="10-digit mobile number"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter your password"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnTxt}>{loading ? "..." : t(language, "auth_login")}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push("/register")} style={{ marginTop: 16 }}>
          <Text style={styles.link}>New here? Register</Text>
        </TouchableOpacity>
      </View>

      {/* Developer Quick Login Tools */}
      <View style={styles.devSection}>
        <Text style={styles.devTitle}>Developer Quick Login</Text>
        <View style={styles.devGrid}>
          <TouchableOpacity style={styles.devBtn} onPress={() => quickLogin("owner")}><Text style={styles.devBtnTxt}>Owner</Text></TouchableOpacity>
          <TouchableOpacity style={styles.devBtn} onPress={() => quickLogin("buyer")}><Text style={styles.devBtnTxt}>Buyer</Text></TouchableOpacity>
          <TouchableOpacity style={styles.devBtn} onPress={() => quickLogin("advisor")}><Text style={styles.devBtnTxt}>Advisor</Text></TouchableOpacity>
          <TouchableOpacity style={styles.devBtn} onPress={() => quickLogin("admin")}><Text style={styles.devBtnTxt}>Admin</Text></TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#111", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 40 },
  form: { width: "100%" },
  label: { fontSize: 14, color: "#444", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 20 },
  btn: { backgroundColor: "#2A85FF", padding: 16, borderRadius: 8, alignItems: "center" },
  btnTxt: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  link: { color: "#2A85FF", textAlign: "center", fontSize: 14 },
  devSection: { marginTop: 60, padding: 16, backgroundColor: "#F8F9FA", borderRadius: 12, borderWidth: 1, borderColor: "#EAEAEA" },
  devTitle: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 12, textAlign: "center" },
  devGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  devBtn: { backgroundColor: "#E9ECEF", width: "48%", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 8 },
  devBtnTxt: { color: "#495057", fontWeight: "600", fontSize: 14 }
});
