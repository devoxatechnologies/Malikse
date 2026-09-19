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

export default function LoginScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
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

    const showMsg = (title: string, msg: string) => {
      if (Platform.OS === "web") alert(`${title}: ${msg}`);
      else Alert.alert(title, msg);
    };

    if (mobile.length < 10 || resolvedPassword.length < 6) {
      showMsg("Invalid Input", "Please enter your 10-digit mobile number and password (min 6 characters).");
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(mobile, resolvedPassword);
      routeByRole(user.role);
    } catch (e: any) {
      showMsg("Sign In Failed", e.response?.data?.message || "Invalid mobile number or password.");
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

  const quickLogin = async (role: UserRole) => {
    try {
      await authService.demoLogin(role);
    } catch {
      // Handled internally in demoLogin
    }
    routeByRole(role);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.mainLayout, isDesktop && styles.desktopLayout]}>
        
        {/* ================= LEFT HERO COLUMN (DESKTOP) ================= */}
        {isDesktop && (
          <View style={styles.heroColumn}>
            {/* Rich Estate Photography */}
            <Image
              source={require("../../assets/auth_hero_land.jpg")}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Subtle photographic vignette overlay */}
            <View style={styles.heroOverlay} />

            <View style={styles.heroContent}>
              {/* Brand Header */}
              <View style={styles.brandRow}>
                <View style={styles.brandLogoBox}>
                  <FontAwesome5 name="shield-alt" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.brandTitle}>
                  Malik<Text style={{ color: "#34D399" }}>Se</Text>
                </Text>
                <View style={styles.verifiedTag}>
                  <MaterialIcons name="verified" size={13} color="#34D399" />
                  <Text style={styles.verifiedTagText}>Govt. Title Checked</Text>
                </View>
              </View>

              {/* Main Catchphrase */}
              <View style={styles.heroCenter}>
                <Text style={styles.heroTagline}>
                  Direct Land Deals.{"\n"}Zero Middlemen.
                </Text>
                <Text style={styles.heroDescription}>
                  Connect directly with verified landowners. Every listing is backed by on-ground GPS boundary surveys and Jamabandi registry scrutiny.
                </Text>

                {/* Micro trust pills */}
                <View style={styles.trustPillRow}>
                  <View style={styles.miniPill}>
                    <MaterialIcons name="check" size={13} color="#34D399" />
                    <Text style={styles.miniPillText}>100% Genuine Owners</Text>
                  </View>
                  <View style={styles.miniPill}>
                    <MaterialIcons name="check" size={13} color="#34D399" />
                    <Text style={styles.miniPillText}>Physical GPS Visits</Text>
                  </View>
                  <View style={styles.miniPill}>
                    <MaterialIcons name="check" size={13} color="#34D399" />
                    <Text style={styles.miniPillText}>Legal Title Cleared</Text>
                  </View>
                </View>
              </View>

              {/* Glassmorphic Testimonial Footer */}
              <View style={styles.glassCard}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <MaterialIcons key={s} name="star" size={14} color="#FBBF24" />
                  ))}
                  <Text style={styles.starsLabel}>Verified Deal</Text>
                  <View style={styles.savingTag}>
                    <Text style={styles.savingTagText}>Saved ₹2.4L Brokerage</Text>
                  </View>
                </View>
                <Text style={styles.quoteText}>
                  "Purchased a 3,200 sq.ft residential plot directly from the registered owner in Danapur. Complete boundary survey was on record before payment."
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
                    <Text style={styles.activeParcelsText}>₹140+ Cr Verified</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ================= RIGHT FORM COLUMN ================= */}
        <View style={styles.formColumn}>
          {/* Top Bar with Clean Back & Language */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.replace("/search")}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={16} color="#334155" />
              <Text style={styles.backBtnText}>Marketplace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.langPill}
              onPress={toggleLanguage}
              activeOpacity={0.7}
            >
              <MaterialIcons name="translate" size={14} color="#059669" />
              <Text style={styles.langPillText}>{language === "en" ? "हिन्दी" : "English"}</Text>
            </TouchableOpacity>
          </View>

          {/* Form Scroll View - Compact, centered, fits 100% in viewport */}
          <ScrollView
            contentContainerStyle={styles.formScroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.formWrapper}>
              {/* Mobile Only Header */}
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

              {/* Clean Welcome Header */}
              <View style={styles.titleBox}>
                <Text style={styles.formHeading}>Welcome back</Text>
                <Text style={styles.formSubheading}>
                  Sign in with your mobile number to manage listings & offers.
                </Text>
              </View>

              {/* Inputs */}
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
                      placeholder="Enter 10-digit mobile number"
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
                    <MaterialIcons name="lock-outline" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
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
                        size={17}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sign In Primary Button */}
                <TouchableOpacity
                  style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnTxt}>
                    {loading ? "Signing in..." : "Sign In to MalikSe"}
                  </Text>
                  {!loading && <MaterialIcons name="arrow-forward" size={17} color="#FFFFFF" />}
                </TouchableOpacity>

                {/* Secondary Actions */}
                <View style={styles.linksBox}>
                  <View style={styles.createAccountRow}>
                    <Text style={styles.newToText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push("/register")} activeOpacity={0.7}>
                      <Text style={styles.createAccountLink}>Create Account &rarr;</Text>
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
                    <MaterialIcons name="explore" size={16} color="#059669" />
                    <Text style={styles.guestLinkTxt}>Browse Verified Properties as Guest</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Developer Fast Demo Switcher - Compact single row, never overflows */}
              <View style={styles.demoBar}>
                <View style={styles.demoBarHeader}>
                  <MaterialIcons name="bolt" size={14} color="#D97706" />
                  <Text style={styles.demoBarLabel}>Fast Demo:</Text>
                </View>
                <View style={styles.demoPillsRow}>
                  <TouchableOpacity style={styles.demoPill} onPress={() => quickLogin("owner")} activeOpacity={0.7}>
                    <Text style={styles.demoPillTxt}>Owner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.demoPill} onPress={() => quickLogin("buyer")} activeOpacity={0.7}>
                    <Text style={styles.demoPillTxt}>Buyer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.demoPill} onPress={() => quickLogin("advisor")} activeOpacity={0.7}>
                    <Text style={styles.demoPillTxt}>Advisor</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.demoPill} onPress={() => quickLogin("admin")} activeOpacity={0.7}>
                    <Text style={styles.demoPillTxt}>Admin</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Trust Footer note */}
              <View style={styles.trustFooter}>
                <MaterialIcons name="lock" size={11} color="#94A3B8" />
                <Text style={styles.trustFooterText}>100% Encrypted &bull; RERA & Jamabandi Verified</Text>
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
    backgroundColor: "rgba(6, 78, 59, 0.42)",
    backgroundImage: "linear-gradient(180deg, rgba(6, 78, 59, 0.35) 0%, rgba(15, 23, 42, 0.65) 55%, rgba(15, 23, 42, 0.92) 100%)" as any,
  },
  heroContent: {
    flex: 1,
    padding: 36,
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandLogoBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.4)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    marginLeft: 6,
  },
  verifiedTagText: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "700",
  },
  heroCenter: {
    maxWidth: 480,
    marginVertical: "auto",
  },
  heroTagline: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 14,
    color: "#E2E8F0",
    lineHeight: 22,
    fontWeight: "400",
    marginBottom: 16,
  },
  trustPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  miniPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(8px)" as any,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  miniPillText: {
    color: "#F1F5F9",
    fontSize: 11,
    fontWeight: "600",
  },
  glassCard: {
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    backdropFilter: "blur(14px)" as any,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 14,
    padding: 16,
    maxWidth: 480,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 6,
  },
  starsLabel: {
    color: "#FBBF24",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  savingTag: {
    marginLeft: "auto",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  savingTagText: {
    color: "#6EE7B7",
    fontSize: 10,
    fontWeight: "700",
  },
  quoteText: {
    fontSize: 12,
    color: "#F1F5F9",
    lineHeight: 18,
    fontStyle: "italic",
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  authorLetter: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  authorName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  authorLoc: {
    color: "#94A3B8",
    fontSize: 10,
  },
  activeParcelsChip: {
    marginLeft: "auto",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  activeParcelsText: {
    color: "#E2E8F0",
    fontSize: 10,
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
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 4,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  langPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  formScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Platform.OS === "web" ? 36 : 20,
    paddingVertical: 12,
  },
  formWrapper: {
    maxWidth: 380,
    width: "100%",
    alignSelf: "center",
  },
  mobileHero: {
    alignItems: "center",
    marginBottom: 16,
  },
  mobileLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  mobileTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },
  mobileSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  titleBox: {
    marginBottom: 18,
  },
  formHeading: {
    fontSize: 23,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  formSubheading: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 18,
  },
  inputsBlock: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 5,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  forgotPass: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  flagBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
    borderRightWidth: 1.5,
    borderRightColor: "#E2E8F0",
  },
  flag: {
    fontSize: 14,
  },
  prefix: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
    outlineStyle: "none" as any,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0F172A",
    outlineStyle: "none" as any,
  },
  eyeBtn: {
    padding: 4,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingVertical: 12,
    borderRadius: 9,
    marginTop: 4,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnTxt: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  linksBox: {
    marginTop: 14,
    alignItems: "center",
  },
  createAccountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  newToText: {
    fontSize: 12,
    color: "#64748B",
  },
  createAccountLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  orText: {
    marginHorizontal: 8,
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  guestLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  guestLinkTxt: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "700",
  },
  demoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 14,
  },
  demoBarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  demoBarLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  demoPillsRow: {
    flexDirection: "row",
    gap: 4,
  },
  demoPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  demoPillTxt: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
  },
  trustFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 10,
  },
  trustFooterText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
  },
});

