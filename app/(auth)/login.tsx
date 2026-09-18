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
import { useLanguageStore } from "../../src/store/languageStore";
import { useAuthStore } from "../../src/store/authStore";
import { UserRole } from "../../src/types/auth.types";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { AppTheme } from "../../constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const { language, toggleLanguage } = useLanguageStore();
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
      Alert.alert("Invalid Input", "Please enter your 10-digit mobile number and password.");
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(mobile, resolvedPassword);
      routeByRole(user.role);
    } catch (e: any) {
      Alert.alert("Sign In Failed", e.response?.data?.message || "Invalid mobile number or password.");
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
        
        {/* ================= LEFT SHOWCASE COLUMN (DESKTOP) ================= */}
        {isDesktop && (
          <View style={styles.heroColumn}>
            {/* Rich Estate Photography */}
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=85" }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Cinematic Gradient: Subtle at top, rich at bottom for perfect readability */}
            <View style={styles.heroOverlay} />

            <View style={styles.heroContent}>
              {/* Brand Pill Header */}
              <View style={styles.brandRow}>
                <View style={styles.brandLogoBox}>
                  <FontAwesome5 name="shield-alt" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.brandTitle}>
                  Malik<Text style={{ color: "#34D399" }}>Se</Text>
                </Text>
                <View style={styles.verifiedTag}>
                  <MaterialIcons name="check-circle" size={13} color="#10B981" />
                  <Text style={styles.verifiedTagText}>Govt Title Checked</Text>
                </View>
              </View>

              {/* Center Catchphrase */}
              <View style={styles.heroCenter}>
                <Text style={styles.heroTagline}>
                  Direct Owner-to-Buyer{"\n"}Property Marketplace
                </Text>
                <Text style={styles.heroDescription}>
                  Zero brokers. Zero fake listings. Every plot is physically verified with on-site GPS boundaries and revenue registry scrutiny.
                </Text>
              </View>

              {/* Bottom Glassmorphic Social Proof Testimonial Card */}
              <View style={styles.glassCard}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <MaterialIcons key={s} name="star" size={16} color="#FBBF24" />
                  ))}
                  <Text style={styles.starsLabel}>Verified Deal</Text>
                </View>
                <Text style={styles.quoteText}>
                  "Found a 2,400 sq.ft commercial plot in Danapur directly through the owner. Saved ₹2.5 Lakhs in middleman brokerage."
                </Text>
                <View style={styles.authorRow}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorLetter}>R</Text>
                  </View>
                  <View>
                    <Text style={styles.authorName}>Rajesh Verma</Text>
                    <Text style={styles.authorLoc}>Property Buyer &bull; Patna</Text>
                  </View>
                  <View style={styles.activeParcelsChip}>
                    <Text style={styles.activeParcelsText}>1,400+ Verified Plots</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ================= RIGHT SIGN-IN COLUMN ================= */}
        <View style={styles.formColumn}>
          {/* Top Bar with Navigation & Language */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.replace("/search")}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={18} color="#0F172A" />
              <Text style={styles.backBtnText}>Marketplace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.langPill}
              onPress={toggleLanguage}
              activeOpacity={0.7}
            >
              <MaterialIcons name="translate" size={15} color="#059669" />
              <Text style={styles.langPillText}>{language === "en" ? "हिन्दी" : "English"}</Text>
            </TouchableOpacity>
          </View>

          {/* Form Scroll Container */}
          <ScrollView
            contentContainerStyle={styles.formScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formWrapper}>
              {/* Mobile Brand Identity */}
              {!isDesktop && (
                <View style={styles.mobileHero}>
                  <View style={styles.mobileLogoCircle}>
                    <FontAwesome5 name="shield-alt" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.mobileTitle}>
                    Malik<Text style={{ color: "#059669" }}>Se</Text>
                  </Text>
                  <Text style={styles.mobileSub}>100% Verified Owner Marketplace</Text>
                </View>
              )}

              {/* Clean Title */}
              <View style={styles.titleBox}>
                <Text style={styles.formHeading}>Sign In</Text>
                <Text style={styles.formSubheading}>
                  Enter your mobile number to access your verified listings and buyer conversations.
                </Text>
              </View>

              {/* Inputs Container */}
              <View style={styles.inputsBlock}>
                {/* Mobile Number Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <View style={styles.phoneInputRow}>
                    <View style={styles.flagBox}>
                      <Text style={styles.flag}>🇮🇳</Text>
                      <Text style={styles.prefix}>+91</Text>
                    </View>
                    <TextInput
                      style={styles.phoneInput}
                      value={mobile}
                      onChangeText={setMobile}
                      keyboardType="phone-pad"
                      placeholder="98765 43210"
                      placeholderTextColor="#94A3B8"
                      maxLength={10}
                      autoFocus={isDesktop}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.passwordLabelRow}>
                    <Text style={styles.label}>Password</Text>
                    <TouchableOpacity activeOpacity={0.7}>
                      <Text style={styles.forgotPass}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={styles.passwordInput}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={18}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Primary Sign In Button */}
                <TouchableOpacity
                  style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnTxt}>
                    {loading ? "Signing in..." : "Sign In to Account"}
                  </Text>
                  {!loading && <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />}
                </TouchableOpacity>

                {/* Alternative Actions: Register & Guest in clean single card */}
                <View style={styles.linksBox}>
                  <View style={styles.createAccountRow}>
                    <Text style={styles.newToText}>New to MalikSe?</Text>
                    <TouchableOpacity onPress={() => router.push("/register")} activeOpacity={0.7}>
                      <Text style={styles.createAccountLink}>Create an Account &rarr;</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.orDivider}>
                    <View style={styles.orLine} />
                    <Text style={styles.orText}>or</Text>
                    <View style={styles.orLine} />
                  </View>

                  <TouchableOpacity
                    style={styles.guestLinkBtn}
                    onPress={() => router.replace("/search")}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="explore" size={18} color="#059669" />
                    <Text style={styles.guestLinkTxt}>Browse Properties as Guest</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Developer Fast Demo Switcher: Sleek, compact bottom strip */}
              <View style={styles.demoBar}>
                <View style={styles.demoBarHeader}>
                  <MaterialIcons name="bolt" size={14} color="#D97706" />
                  <Text style={styles.demoBarLabel}>Demo Roles:</Text>
                </View>
                <View style={styles.demoPillsRow}>
                  <TouchableOpacity style={styles.demoPill} onPress={() => quickLogin("owner")}>
                    <Text style={styles.demoPillTxt}>Owner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.demoPill} onPress={() => quickLogin("buyer")}>
                    <Text style={styles.demoPillTxt}>Buyer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.demoPill} onPress={() => quickLogin("advisor")}>
                    <Text style={styles.demoPillTxt}>Advisor</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.demoPill} onPress={() => quickLogin("admin")}>
                    <Text style={styles.demoPillTxt}>Admin</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "rgba(6, 78, 59, 0.45)",
    backgroundImage: "linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(6, 78, 59, 0.45) 40%, rgba(15, 23, 42, 0.88) 100%)" as any,
  },
  heroContent: {
    flex: 1,
    padding: 44,
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16, 185, 129, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    marginLeft: 8,
  },
  verifiedTagText: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "700",
  },
  heroCenter: {
    maxWidth: 500,
  },
  heroTagline: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 14,
    color: "#E2E8F0",
    lineHeight: 22,
    fontWeight: "400",
  },
  glassCard: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(12px)" as any,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 20,
    maxWidth: 520,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  starsLabel: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quoteText: {
    fontSize: 13,
    color: "#F1F5F9",
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 14,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  authorLetter: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  authorName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  authorLoc: {
    color: "#94A3B8",
    fontSize: 11,
  },
  activeParcelsChip: {
    marginLeft: "auto",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  activeParcelsText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "600",
  },

  /* ---------- FORM RIGHT COLUMN ---------- */
  formColumn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 8,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
  langPill: {
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
  langPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#065F46",
  },
  formScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Platform.OS === "web" ? 40 : 20,
    paddingVertical: 20,
  },
  formWrapper: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  mobileHero: {
    alignItems: "center",
    marginBottom: 20,
  },
  mobileLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  mobileTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  mobileSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  titleBox: {
    marginBottom: 24,
  },
  formHeading: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  formSubheading: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 20,
  },
  inputsBlock: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  forgotPass: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  flagBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderRightWidth: 1.5,
    borderRightColor: "#E2E8F0",
  },
  flag: {
    fontSize: 15,
  },
  prefix: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
    outlineStyle: "none" as any,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    outlineStyle: "none" as any,
  },
  eyeBtn: {
    padding: 6,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 6,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryBtnTxt: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  linksBox: {
    marginTop: 20,
    alignItems: "center",
  },
  createAccountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  newToText: {
    fontSize: 13,
    color: "#64748B",
  },
  createAccountLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    width: "100%",
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  guestLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  guestLinkTxt: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "700",
  },
  demoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 22,
  },
  demoBarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  demoBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  demoPillsRow: {
    flexDirection: "row",
    gap: 6,
  },
  demoPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  demoPillTxt: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
});
