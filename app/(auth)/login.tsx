import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Image,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { authService } from "../../src/services/authService";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";
import { useAuthStore } from "../../src/store/authStore";
import { UserRole } from "../../src/types/auth.types";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { AppTheme } from "../../constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

  const { language, toggleLanguage } = useLanguageStore();
  const authStore = useAuthStore();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDevTools, setShowDevTools] = useState(true);

  const handleLogin = async () => {
    let resolvedPassword = password;
    if (!resolvedPassword && typeof document !== "undefined") {
      const pwInput = document.querySelector('input[type="password"]') as HTMLInputElement | null;
      if (pwInput?.value) resolvedPassword = pwInput.value;
    }

    if (mobile.length < 10 || resolvedPassword.length < 6) {
      Alert.alert("Invalid Input", "Please enter a valid 10-digit mobile number and a password of at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(mobile, resolvedPassword);
      routeByRole(user.role);
    } catch (e: any) {
      Alert.alert("Login Failed", e.response?.data?.message || "Invalid mobile number or password. Please try again.");
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

  const quickLogin = (role: UserRole) => {
    authStore.setTokens({ accessToken: "dummy_access", refreshToken: "dummy_refresh" });
    authStore.setUser({
      id: "dummy_id",
      role,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      mobile: "9999999999",
      isVerifiedIdentity: true,
      createdAt: new Date().toISOString(),
    });
    authStore.setAuthState("AUTHENTICATED");
    routeByRole(role);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.mainLayout, isDesktop && styles.desktopLayout]}>
        
        {/* ================= LEFT HERO COLUMN (DESKTOP) ================= */}
        {isDesktop && (
          <View style={styles.heroColumn}>
            <Image
              source={require("../../assets/auth_hero_land.jpg")}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Dark Emerald Gradient Overlay */}
            <View style={styles.heroOverlay} />

            {/* Content on top of image */}
            <View style={styles.heroContent}>
              {/* Brand Logo Header */}
              <View style={styles.heroBrandRow}>
                <View style={styles.heroLogoCircle}>
                  <FontAwesome5 name="shield-alt" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.heroBrandText}>
                  Malik<Text style={styles.heroBrandAccent}>Se</Text>
                </Text>
                <View style={styles.heroBadge}>
                  <MaterialIcons name="verified" size={14} color="#10B981" />
                  <Text style={styles.heroBadgeText}>100% Owner Verified</Text>
                </View>
              </View>

              {/* Center Marketing Copy */}
              <View style={styles.heroCenterCopy}>
                <Text style={styles.heroHeading}>
                  India's First Direct{"\n"}Owner-to-Buyer Land Marketplace
                </Text>
                <Text style={styles.heroSubheading}>
                  Say goodbye to fake listings, untraceable ownership, and unauthorized brokers. Every property is backed by government registry cross-checks, physical site GPS visits, and lawyer certification.
                </Text>

                {/* 3 Pillars of Trust */}
                <View style={styles.pillarsContainer}>
                  <View style={styles.pillarItem}>
                    <View style={styles.pillarIconWrap}>
                      <MaterialIcons name="fingerprint" size={20} color="#34D399" />
                    </View>
                    <View style={styles.pillarTextWrap}>
                      <Text style={styles.pillarTitle}>Biometric Owner KYC</Text>
                      <Text style={styles.pillarDesc}>Only registered landowners can publish properties</Text>
                    </View>
                  </View>

                  <View style={styles.pillarItem}>
                    <View style={styles.pillarIconWrap}>
                      <MaterialIcons name="location-pin" size={20} color="#38BDF8" />
                    </View>
                    <View style={styles.pillarTextWrap}>
                      <Text style={styles.pillarTitle}>Physical GPS Verification</Text>
                      <Text style={styles.pillarDesc}>Field advisors survey actual parcel boundaries</Text>
                    </View>
                  </View>

                  <View style={styles.pillarItem}>
                    <View style={styles.pillarIconWrap}>
                      <MaterialIcons name="gavel" size={20} color="#FBBF24" />
                    </View>
                    <View style={styles.pillarTextWrap}>
                      <Text style={styles.pillarTitle}>Legal Due Diligence</Text>
                      <Text style={styles.pillarDesc}>Revenue office Jamabandi & title scrutiny</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bottom Social Proof */}
              <View style={styles.heroFooter}>
                <View style={styles.statPill}>
                  <MaterialIcons name="trending-up" size={18} color="#10B981" />
                  <Text style={styles.statText}>₹140+ Cr Verified Land Listed</Text>
                </View>
                <Text style={styles.heroCopyright}>&copy; 2026 MalikSe Technologies Inc.</Text>
              </View>
            </View>
          </View>
        )}

        {/* ================= RIGHT FORM COLUMN ================= */}
        <View style={styles.formColumn}>
          <ScrollView
            contentContainerStyle={styles.formScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Navigation & Brand (for both Desktop & Mobile) */}
            <View style={styles.formTopBar}>
              <TouchableOpacity
                style={styles.backLink}
                onPress={() => router.replace("/search")}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={20} color={AppTheme.colors.text} />
                <Text style={styles.backLinkText}>Back to Marketplace</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.langToggle}
                onPress={toggleLanguage}
                activeOpacity={0.7}
              >
                <MaterialIcons name="translate" size={16} color={AppTheme.colors.primaryDark} />
                <Text style={styles.langToggleText}>{language === "en" ? "हिन्दी" : "English"}</Text>
              </TouchableOpacity>
            </View>

            {/* Mobile Header Branding (visible when hero image is hidden) */}
            {!isDesktop && (
              <View style={styles.mobileBrandHeader}>
                <View style={styles.mobileLogoBox}>
                  <FontAwesome5 name="shield-alt" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.mobileBrandName}>
                  Malik<Text style={{ color: AppTheme.colors.primary }}>Se</Text>
                </Text>
                <Text style={styles.mobileBrandTag}>Verified Owner-to-Buyer Marketplace</Text>
              </View>
            )}

            {/* Form Title & Context */}
            <View style={styles.headerBlock}>
              <Text style={styles.welcomeHeading}>Welcome back</Text>
              <Text style={styles.welcomeSub}>
                Sign in with your registered mobile number to manage your verified properties and buyer offers.
              </Text>
            </View>

            {/* Actual Input Form */}
            <View style={styles.formContent}>
              {/* Mobile Input Group */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <View style={styles.mobileInputRow}>
                  <View style={styles.countryCodePill}>
                    <Text style={styles.countryFlag}>🇮🇳</Text>
                    <Text style={styles.countryCode}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.mobileInput}
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    placeholder="10-digit mobile number"
                    placeholderTextColor={AppTheme.colors.textMuted}
                    maxLength={10}
                    autoFocus={isDesktop}
                  />
                </View>
              </View>

              {/* Password Input Group */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelWithAction}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.forgotLink}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.passwordWrapper}>
                  <MaterialIcons name="lock-outline" size={20} color={AppTheme.colors.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={AppTheme.colors.textMuted}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.visibilityBtn}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility" : "visibility-off"}
                      size={20}
                      color={AppTheme.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Primary Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Signing in..." : "Sign In to MalikSe"}
                </Text>
                {!loading && <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />}
              </TouchableOpacity>

              {/* Register Prompt */}
              <View style={styles.registerPrompt}>
                <Text style={styles.registerText}>Don't have an account yet?</Text>
                <TouchableOpacity onPress={() => router.push("/register")} activeOpacity={0.7}>
                  <Text style={styles.registerLink}>Create Account &rarr;</Text>
                </TouchableOpacity>
              </View>

              {/* Or Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue without account</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Guest Exploration Option */}
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => router.replace("/search")}
                activeOpacity={0.7}
              >
                <MaterialIcons name="explore" size={20} color={AppTheme.colors.primaryDark} />
                <Text style={styles.guestButtonText}>Browse Verified Properties as Guest</Text>
              </TouchableOpacity>
            </View>

            {/* Developer Fast Demo Login Drawer */}
            <View style={styles.devDrawer}>
              <TouchableOpacity
                style={styles.devDrawerHeader}
                onPress={() => setShowDevTools(!showDevTools)}
                activeOpacity={0.7}
              >
                <View style={styles.devHeaderLeft}>
                  <MaterialIcons name="bolt" size={16} color="#F59E0B" />
                  <Text style={styles.devDrawerTitle}>Developer Quick Logins</Text>
                </View>
                <MaterialIcons
                  name={showDevTools ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={20}
                  color={AppTheme.colors.textMuted}
                />
              </TouchableOpacity>

              {showDevTools && (
                <View style={styles.devGrid}>
                  <TouchableOpacity
                    style={styles.devPill}
                    onPress={() => quickLogin("owner")}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.devIconDot, { backgroundColor: "#D1FAE5" }]}>
                      <MaterialIcons name="home" size={14} color="#059669" />
                    </View>
                    <View>
                      <Text style={styles.devPillTitle}>Owner Portal</Text>
                      <Text style={styles.devPillSub}>Post & manage land</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.devPill}
                    onPress={() => quickLogin("buyer")}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.devIconDot, { backgroundColor: "#DBEAFE" }]}>
                      <MaterialIcons name="search" size={14} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.devPillTitle}>Buyer Portal</Text>
                      <Text style={styles.devPillSub}>Search & offers</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.devPill}
                    onPress={() => quickLogin("advisor")}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.devIconDot, { backgroundColor: "#EDE9FE" }]}>
                      <MaterialIcons name="verified-user" size={14} color="#7C3AED" />
                    </View>
                    <View>
                      <Text style={styles.devPillTitle}>Advisor Portal</Text>
                      <Text style={styles.devPillSub}>GPS inspections</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.devPill}
                    onPress={() => quickLogin("admin")}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.devIconDot, { backgroundColor: "#FEE2E2" }]}>
                      <MaterialIcons name="admin-panel-settings" size={14} color="#DC2626" />
                    </View>
                    <View>
                      <Text style={styles.devPillTitle}>Admin Portal</Text>
                      <Text style={styles.devPillSub}>Approvals & audit</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Footer Trust Guarantee */}
            <View style={styles.trustFooter}>
              <MaterialIcons name="lock" size={14} color={AppTheme.colors.textMuted} />
              <Text style={styles.trustFooterText}>
                256-Bit SSL Encrypted &bull; Direct Owner Authentication
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  mainLayout: {
    flex: 1,
    flexDirection: "column",
  },
  desktopLayout: {
    flexDirection: "row",
    height: "100%",
  },

  /* ---------- HERO LEFT COLUMN ---------- */
  heroColumn: {
    flex: 1.15,
    position: "relative",
    backgroundColor: "#064E3B",
    overflow: "hidden",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 78, 59, 0.78)",
    // Note: React Native Web supports CSS gradient via background fallback
    backgroundImage: "linear-gradient(145deg, rgba(6, 78, 59, 0.88) 0%, rgba(15, 23, 42, 0.94) 100%)" as any,
  },
  heroContent: {
    flex: 1,
    padding: 48,
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
  },
  heroBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heroLogoCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  heroBrandText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  heroBrandAccent: {
    color: "#34D399",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    marginLeft: 12,
  },
  heroBadgeText: {
    color: "#A7F3D0",
    fontSize: 12,
    fontWeight: "700",
  },
  heroCenterCopy: {
    marginVertical: "auto",
    maxWidth: 540,
  },
  heroHeading: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 46,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  heroSubheading: {
    fontSize: 15,
    color: "#CBD5E1",
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: "400",
  },
  pillarsContainer: {
    gap: 18,
  },
  pillarItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  pillarIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  pillarTextWrap: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  pillarDesc: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 18,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  statText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  heroCopyright: {
    fontSize: 12,
    color: "#64748B",
  },

  /* ---------- FORM RIGHT COLUMN ---------- */
  formColumn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  formScroll: {
    paddingHorizontal: Platform.OS === "web" ? 48 : 24,
    paddingVertical: 36,
    maxWidth: 540,
    width: "100%",
    alignSelf: "center",
  },
  formTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  langToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#065F46",
  },
  mobileBrandHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  mobileLogoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: AppTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  mobileBrandName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  mobileBrandTag: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  headerBlock: {
    marginBottom: 28,
  },
  welcomeHeading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 22,
  },
  formContent: {
    width: "100%",
  },
  fieldGroup: {
    marginBottom: 20,
  },
  labelWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  forgotLink: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  mobileInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  countryCodePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
  },
  countryFlag: {
    fontSize: 16,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  mobileInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
    outlineStyle: "none" as any,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
    outlineStyle: "none" as any,
  },
  visibilityBtn: {
    padding: 6,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#059669",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  registerPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: "#64748B",
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    paddingVertical: 13,
    borderRadius: 12,
  },
  guestButtonText: {
    color: "#065F46",
    fontSize: 14,
    fontWeight: "700",
  },

  /* ---------- DEV TOOLS DRAWER ---------- */
  devDrawer: {
    marginTop: 32,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },
  devDrawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  devHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  devDrawerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  devGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  devPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  devIconDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  devPillTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  devPillSub: {
    fontSize: 10,
    color: "#64748B",
  },
  trustFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  trustFooterText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
});
