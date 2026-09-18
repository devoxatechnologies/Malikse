import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { authService } from "../../src/services/authService";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";
import { useAuthStore } from "../../src/store/authStore";
import { UserRole } from "../../src/types/auth.types";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { AppTheme } from "../../constants/theme";
import AppHeader from "../../components/AppHeader";

export default function LoginScreen() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const authStore = useAuthStore();
  
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    let resolvedPassword = password;
    if (!resolvedPassword && typeof document !== "undefined") {
      const pwInput = document.querySelector('input[type="password"]') as HTMLInputElement | null;
      if (pwInput?.value) resolvedPassword = pwInput.value;
    }

    if (mobile.length < 10 || resolvedPassword.length < 6) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile and password (min 6 chars)");
      return;
    }
    
    setLoading(true);
    try {
      const user = await authService.login(mobile, resolvedPassword);
      routeByRole(user.role);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || "Invalid mobile number or password");
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
    authStore.setUser({ 
      id: "dummy_id", 
      role, 
      name: `Dev ${role.charAt(0).toUpperCase() + role.slice(1)}`, 
      mobile: "9999999999", 
      isVerifiedIdentity: true, 
      createdAt: new Date().toISOString() 
    });
    authStore.setAuthState("AUTHENTICATED");
    routeByRole(role);
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Sign In"
        showBack={true}
        fallbackRoute="/search"
        showLanguageToggle={true}
        showHomeButton={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
          {/* Brand Logo & Welcome */}
          <View style={styles.brandHero}>
            <View style={styles.logoBadge}>
              <FontAwesome5 name="shield-alt" size={24} color={AppTheme.colors.white} />
            </View>
            <Text style={styles.brandTitle}>
              Malik<Text style={{ color: AppTheme.colors.primary }}>Se</Text>
            </Text>
            <Text style={styles.brandSubtitle}>
              {t(language, "auth_welcome")}
            </Text>
            <Text style={styles.tagline}>
              {t(language, "auth_tagline")}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Mobile Input */}
            <Text style={styles.label}>{t(language, "auth_mobile")}</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="phone" size={20} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                placeholder="10-digit mobile number"
                placeholderTextColor={AppTheme.colors.textMuted}
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
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

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.btn, loading && { opacity: 0.7 }]} 
              onPress={handleLogin} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnTxt}>
                {loading ? "Signing in..." : t(language, "auth_login")}
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity onPress={() => router.push("/register")} style={styles.linkRow}>
              <Text style={styles.linkText}>
                New to MalikSe? <Text style={styles.linkBold}>Create an Account</Text>
              </Text>
            </TouchableOpacity>

            {/* Guest Browsing CTA */}
            <TouchableOpacity
              onPress={() => router.replace("/search")}
              style={styles.guestBtn}
              activeOpacity={0.7}
            >
              <MaterialIcons name="explore" size={18} color={AppTheme.colors.primaryDark} />
              <Text style={styles.guestBtnTxt}>Browse Properties as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Developer Quick Switcher */}
          <View style={styles.devSection}>
            <View style={styles.devHeader}>
              <MaterialIcons name="bolt" size={18} color={AppTheme.colors.warning} />
              <Text style={styles.devTitle}>Quick Demo Logins</Text>
            </View>
            <View style={styles.devGrid}>
              <TouchableOpacity style={styles.devBtn} onPress={() => quickLogin("owner")}>
                <MaterialIcons name="person" size={16} color={AppTheme.colors.primary} />
                <Text style={styles.devBtnTxt}>Owner</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.devBtn} onPress={() => quickLogin("buyer")}>
                <MaterialIcons name="shopping-bag" size={16} color={AppTheme.colors.accent} />
                <Text style={styles.devBtnTxt}>Buyer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.devBtn} onPress={() => quickLogin("advisor")}>
                <MaterialIcons name="verified-user" size={16} color="#7C3AED" />
                <Text style={styles.devBtnTxt}>Advisor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.devBtn} onPress={() => quickLogin("admin")}>
                <MaterialIcons name="admin-panel-settings" size={16} color="#DC2626" />
                <Text style={styles.devBtnTxt}>Admin</Text>
              </TouchableOpacity>
            </View>
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
    maxWidth: 460,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    ...AppTheme.shadows.float,
  },
  brandHero: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: AppTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    ...AppTheme.shadows.soft,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: AppTheme.colors.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppTheme.colors.textSecondary,
    marginTop: 4,
  },
  tagline: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
    textAlign: "center",
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
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: AppTheme.colors.primaryLight,
    borderRadius: AppTheme.radius.md,
  },
  guestBtnTxt: {
    color: AppTheme.colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
  },
  devSection: {
    marginTop: 28,
    padding: 16,
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  devHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 12,
  },
  devTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: AppTheme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  devGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  devBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: AppTheme.colors.white,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    width: "48%",
    paddingVertical: 10,
    borderRadius: AppTheme.radius.md,
  },
  devBtnTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: AppTheme.colors.text,
  },
});
