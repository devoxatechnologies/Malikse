import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { authService } from "../../src/services/authService";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { language } = useLanguageStore();
  
  const [role, setRole] = useState<"owner" | "buyer">("owner");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // On web, browsers may autofill without firing onChangeText — read DOM value as fallback
    let resolvedPassword = password;
    if (!resolvedPassword && typeof document !== "undefined") {
      const pwInput = document.querySelector('input[type="password"]') as HTMLInputElement | null;
      if (pwInput?.value) resolvedPassword = pwInput.value;
    }

    if (name.length < 2 || mobile.length < 10 || resolvedPassword.length < 6) {
      Alert.alert("Error", "Please fill all required fields correctly (password min 6 chars)");
      return;
    }
    
    setLoading(true);
    try {
      await authService.register(role, name, mobile, resolvedPassword, email);
      if (Platform.OS === "web") {
        alert("Registered successfully. Please login.");
        router.replace("/login");
      } else {
        Alert.alert("Success", "Registered successfully. Please login.", [
          { text: "OK", onPress: () => router.replace("/login") }
        ]);
      }
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t(language, "auth_register")}</Text>

      <View style={styles.roleContainer}>
        <TouchableOpacity 
          style={[styles.roleBtn, role === "owner" && styles.roleActive]} 
          onPress={() => setRole("owner")}
        >
          <Text style={[styles.roleTxt, role === "owner" && styles.roleTxtActive]}>
            {t(language, "auth_role_owner")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.roleBtn, role === "buyer" && styles.roleActive]} 
          onPress={() => setRole("buyer")}
        >
          <Text style={[styles.roleTxt, role === "buyer" && styles.roleTxtActive]}>
            {t(language, "auth_role_buyer")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t(language, "auth_name")}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="As per documents" />
        
        <Text style={styles.label}>{t(language, "auth_mobile")}</Text>
        <TextInput style={styles.input} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
        
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
          placeholder="Create a password (min 6 chars)" 
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>{t(language, "auth_email")} (Optional)</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          <Text style={styles.btnTxt}>{loading ? "..." : t(language, "auth_register")}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#111", marginBottom: 24, marginTop: 40 },
  roleContainer: { flexDirection: "row", marginBottom: 24 },
  roleBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: "#DDD", alignItems: "center", borderRadius: 8, marginHorizontal: 4 },
  roleActive: { backgroundColor: "#E6F4FE", borderColor: "#2A85FF" },
  roleTxt: { color: "#666", fontWeight: "600" },
  roleTxtActive: { color: "#2A85FF" },
  form: { width: "100%" },
  label: { fontSize: 14, color: "#444", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 20 },
  btn: { backgroundColor: "#2A85FF", padding: 16, borderRadius: 8, alignItems: "center" },
  btnTxt: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  link: { color: "#2A85FF", textAlign: "center", fontSize: 14 }
});
