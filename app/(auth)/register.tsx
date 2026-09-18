import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { authService } from "../../src/services/authService";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { AppTheme } from "../../constants/theme";
import AppHeader from "../../components/AppHeader";

export default function RegisterScreen() {
  const router = useRouter();
  const { language } = useLanguageStore();
  
  const [role, setRole] = useState<"owner" | "buyer">("owner");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    let resolvedPassword = password;
    if (!resolvedPassword && typeof document !== "undefined") {
      const pwInput = document.querySelector('input[type="password"]') as HTMLInputElement | null;
      if (pwInput?.value) resolvedPassword = pwInput.value;
    }

    if (name.length < 2 || mobile.length < 10 || resolvedPassword.length < 6) {
      Alert.alert("Error", "Please fill all required fields correctly (mobile 10 digits, password min 6 chars)");
      return;
    }
    
    setLoading(true);
    try {
      await authService.register(role, name, mobile, resolvedPassword, email);
      if (Platform.OS === "web") {
        alert("Registration successful! Please sign in with your mobile number.");
        router.replace("/login");
      } else {
        Alert.alert("Success", "Registered successfully. Please login.", [
          { text: "OK", onPress: () => router.replace("/login") }
        ]);
      }
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Create Account"
        subtitle="Join MalikSe Verified Marketplace"
        showBack={true}
        fallbackRoute="/login"
        showLanguageToggle={true}
        showHomeButton={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
          {/* Header Title */}
          <View style={styles.headerBox}>
            <Text style={styles.title}>{t(language, "auth_register")}</Text>
            <Text style={styles.subtext}>Select your account type to continue</Text>
          </View>

          {/* Role Selection Tabs */}
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleBtn, role === "owner" && styles.roleActive]} 
              onPress={() => setRole("owner")}
              activeOpacity={0.8}
            >
              <MaterialIcons 
                name="home-work" 
                size={22} 
                color={role === "owner" ? AppTheme.colors.primary : AppTheme.colors.textMuted} 
              />
              <Text style={[styles.roleTxt, role === "owner" && styles.roleTxtActive]}>
                {t(language, "auth_role_owner")}
              </Text>
              <Text style={styles.roleDesc}>Sell / List Land</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleBtn, role === "buyer" && styles.roleActive]} 
              onPress={() => setRole("buyer")}
              activeOpacity={0.8}
            >
              <MaterialIcons 
                name="search" 
                size={22} 
                color={role === "buyer" ? AppTheme.colors.accent : AppTheme.colors.textMuted} 
              />
              <Text style={[styles.roleTxt, role === "buyer" && styles.roleTxtActive]}>
                {t(language, "auth_role_buyer")}
              </Text>
              <Text style={styles.roleDesc}>Buy / Invest</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Full Name */}
            <Text style={styles.label}>{t(language, "auth_name")} *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                placeholder="Full Name (as per land documents / ID)" 
                placeholderTextColor={AppTheme.colors.textMuted}
              />
            </View>
            
            {/* Mobile */}
            <Text style={styles.label}>{t(language, "auth_mobile")} *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="phone" size={20} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={mobile} 
                onChangeText={setMobile} 
                keyboardType="phone-pad" 
                placeholder="10-digit Mobile Number"
                placeholderTextColor={AppTheme.colors.textMuted}
              />
            </View>
            
            {/* Password */}
            <Text style={styles.label}>Password *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={!showPassword} 
                placeholder="Create Password (min 6 characters)" 
                placeholderTextColor={AppTheme.colors.textMuted}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color={AppTheme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            
            {/* Email */}
            <Text style={styles.label}>{t(language, "auth_email")} (Optional)</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                placeholder="name@example.com"
                placeholderTextColor={AppTheme.colors.textMuted}
                autoCapitalize="none" 
              />
            </View>

            {/* Register Submit Button */}
            <TouchableOpacity 
              style={[styles.btn, loading && { opacity: 0.7 }]} 
              onPress={handleRegister} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnTxt}>
                {loading ? "Creating account..." : t(language, "auth_register")}
              </Text>
            </TouchableOpacity>
            
            {/* Login Link */}
            <TouchableOpacity onPress={() => router.push("/login")} style={styles.linkRow}>
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    paddingVertical: 24,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    ...AppTheme.shadows.float,
  },
  headerBox: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: AppTheme.colors.text,
  },
  subtext: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    marginTop: 4,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1,
    padding: 14,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.border,
    alignItems: "center",
    borderRadius: AppTheme.radius.lg,
    backgroundColor: AppTheme.colors.background,
  },
  roleActive: {
    backgroundColor: AppTheme.colors.primaryLight,
    borderColor: AppTheme.colors.primary,
  },
  roleTxt: {
    color: AppTheme.colors.textSecondary,
    fontWeight: "700",
    fontSize: 14,
    marginTop: 6,
  },
  roleTxtActive: {
    color: AppTheme.colors.primaryDark,
  },
  roleDesc: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: AppTheme.colors.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === "web" ? 14 : 12,
    fontSize: 15,
    color: AppTheme.colors.text,
    outlineStyle: "none" as any,
  },
  eyeBtn: {
    padding: 6,
  },
  btn: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: AppTheme.radius.md,
    alignItems: "center",
    marginTop: 8,
    ...AppTheme.shadows.soft,
  },
  btnTxt: {
    color: AppTheme.colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  linkRow: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
  },
  linkBold: {
    color: AppTheme.colors.primary,
    fontWeight: "700",
  },
});
