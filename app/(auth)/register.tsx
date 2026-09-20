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
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { AppTheme } from "../../constants/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

  const { language, toggleLanguage } = useLanguageStore();

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

    const showMsg = (title: string, msg: string) => {
      if (Platform.OS === "web") alert(`${title}: ${msg}`);
      else Alert.alert(title, msg);
    };

    if (name.trim().length < 2) {
      showMsg("Required Field", "Please enter your full legal name.");
      return;
    }
    if (mobile.length < 10) {
      showMsg("Required Field", "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (resolvedPassword.length < 6) {
      showMsg("Required Field", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await authService.register(role, name, mobile, resolvedPassword, email);
      
      // Auto sign-in with newly created credentials
      try {
        const user = await authService.login(mobile, resolvedPassword);
        if (Platform.OS === "web") {
          alert(`Welcome to MalikSe, ${user.name}! Your account has been created.`);
        }
        if (user.role === "owner") router.replace("/my-properties");
        else router.replace("/search");
      } catch {
        if (Platform.OS === "web") {
          alert("Registration successful! Please sign in with your mobile number.");
        } else {
          Alert.alert("Success", "Registration successful! Please sign in.");
        }
        router.replace("/login");
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || "Failed to create account. Please try again.";
      showMsg("Registration Error", errorMsg);
    } finally {
      setLoading(false);
    }
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
            <View style={styles.heroOverlay} />

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
                  <Text style={styles.heroBadgeText}>Direct Marketplace</Text>
                </View>
              </View>

              {/* Marketing Narrative */}
              <View style={styles.heroCenterCopy}>
                <Text style={styles.heroHeading}>
                  Join the Network of{"\n"}Verified Landowners & Genuine Buyers
                </Text>
                <Text style={styles.heroSubheading}>
                  Whether you are listing generational agricultural land, commercial highway plots, or residential villas — MalikSe provides rigorous title verification, geo-tagging, and direct buyer access.
                </Text>

                <View style={styles.pillarsContainer}>
                  <View style={styles.pillarItem}>
                    <View style={styles.pillarIconWrap}>
                      <MaterialIcons name="real-estate-agent" size={20} color="#34D399" />
                    </View>
                    <View style={styles.pillarTextWrap}>
                      <Text style={styles.pillarTitle}>For Property Owners</Text>
                      <Text style={styles.pillarDesc}>Zero listing fee. Free verification report by licensed field advisors.</Text>
                    </View>
                  </View>

                  <View style={styles.pillarItem}>
                    <View style={styles.pillarIconWrap}>
                      <MaterialIcons name="verified" size={20} color="#38BDF8" />
                    </View>
                    <View style={styles.pillarTextWrap}>
                      <Text style={styles.pillarTitle}>For Buyers & Investors</Text>
                      <Text style={styles.pillarDesc}>Every plot has verified Jamabandi, LPC, survey numbers, and clear boundary GPS.</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Footer Trust Indicator */}
              <View style={styles.heroFooter}>
                <View style={styles.statPill}>
                  <MaterialIcons name="security" size={18} color="#10B981" />
                  <Text style={styles.statText}>RERA & Revenue Office Compliant</Text>
                </View>
                <Text style={styles.heroCopyright}>&copy; 2026 MalikSe Inc.</Text>
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
            {/* Top Navigation Bar */}
            <View style={styles.formTopBar}>
              <TouchableOpacity
                style={styles.backLink}
                onPress={() => router.replace("/login")}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={20} color={AppTheme.colors.text} />
                <Text style={styles.backLinkText}>Back to Sign In</Text>
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

            {/* Mobile Header Branding */}
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

            {/* Form Title */}
            <View style={styles.headerBlock}>
              <Text style={styles.welcomeHeading}>Create your account</Text>
              <Text style={styles.welcomeSub}>
                Join thousands of verified owners and investors on MalikSe.
              </Text>
            </View>

            {/* Role Selection Tabs */}
            <View style={styles.roleCardContainer}>
              <Text style={styles.roleSelectionLabel}>I want to:</Text>
              <View style={styles.roleTabsRow}>
                <TouchableOpacity
                  style={[styles.roleTab, role === "owner" && styles.roleTabActive]}
                  onPress={() => setRole("owner")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="home-work"
                    size={22}
                    color={role === "owner" ? AppTheme.colors.primaryDark : AppTheme.colors.textMuted}
                  />
                  <View style={styles.roleTabTextWrap}>
                    <Text style={[styles.roleTabTitle, role === "owner" && styles.roleTabTitleActive]}>
                      Sell / List Land
                    </Text>
                    <Text style={styles.roleTabSub}>Property Owner</Text>
                  </View>
                  {role === "owner" && (
                    <MaterialIcons name="check-circle" size={18} color={AppTheme.colors.primary} style={{ marginLeft: "auto" }} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleTab, role === "buyer" && styles.roleTabActive]}
                  onPress={() => setRole("buyer")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="search"
                    size={22}
                    color={role === "buyer" ? AppTheme.colors.primaryDark : AppTheme.colors.textMuted}
                  />
                  <View style={styles.roleTabTextWrap}>
                    <Text style={[styles.roleTabTitle, role === "buyer" && styles.roleTabTitleActive]}>
                      Buy / Invest
                    </Text>
                    <Text style={styles.roleTabSub}>Property Buyer</Text>
                  </View>
                  {role === "buyer" && (
                    <MaterialIcons name="check-circle" size={18} color={AppTheme.colors.primary} style={{ marginLeft: "auto" }} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formContent}>
              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Full Legal Name *</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="person-outline" size={20} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="As per Aadhaar or land registry papers"
                    placeholderTextColor={AppTheme.colors.textMuted}
                  />
                </View>
              </View>

              {/* Mobile Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Mobile Number *</Text>
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
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock-outline" size={20} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="Create a password (min 6 characters)"
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

              {/* Email (Optional) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Email Address (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="mail-outline" size={20} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    placeholder="name@example.com"
                    placeholderTextColor={AppTheme.colors.textMuted}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Submit CTA Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Creating Account..." : "Register on MalikSe"}
                </Text>
                {!loading && <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />}
              </TouchableOpacity>

              {/* Already have an account link */}
              <View style={styles.registerPrompt}>
                <Text style={styles.registerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/login")} activeOpacity={0.7}>
                  <Text style={styles.registerLink}>Sign In &rarr;</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Trust Footer */}
            <View style={styles.trustFooter}>
              <MaterialIcons name="verified-user" size={14} color={AppTheme.colors.primary} />
              <Text style={styles.trustFooterText}>
                Zero spam &bull; Direct verified owners &bull; Encrypted storage
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
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(6, 78, 59, 0.42)",
    backgroundImage: "linear-gradient(180deg, rgba(6, 78, 59, 0.35) 0%, rgba(15, 23, 42, 0.65) 55%, rgba(15, 23, 42, 0.92) 100%)" as any,
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
    marginBottom: 24,
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
    marginBottom: 20,
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
    marginBottom: 20,
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
    marginTop: 4,
    lineHeight: 22,
  },
  roleCardContainer: {
    marginBottom: 20,
  },
  roleSelectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  roleTabsRow: {
    flexDirection: "row",
    gap: 12,
  },
  roleTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    gap: 10,
  },
  roleTabActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#059669",
  },
  roleTabTextWrap: {
    flex: 1,
  },
  roleTabTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  roleTabTitleActive: {
    color: "#065F46",
  },
  roleTabSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  formContent: {
    width: "100%",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: "#0F172A",
    outlineStyle: "none" as any,
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
    paddingHorizontal: 12,
    paddingVertical: 13,
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
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
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
