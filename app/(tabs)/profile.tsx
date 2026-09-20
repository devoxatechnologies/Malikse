import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import Svg, { Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import AppHeader from "../../components/AppHeader";
import { useAuthStore } from "../../src/store/authStore";
import { useLanguageStore } from "../../src/store/languageStore";
import { UserRole } from "../../src/types/auth.types";
import { t } from "../../src/i18n/translations";

// Top container background: scenic image matching messages & saved layout
const heroScenicImg = require("../../assets/messages_hero_scenic.jpg");

export default function ProfileScreenMobile() {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguageStore();
  const authStore = useAuthStore();
  const { user } = authStore;

  // Profile data state
  const [fullName, setFullName] = useState(user?.name || "Nikhil kumar");
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || "7667184920");
  const [emailAddress, setEmailAddress] = useState("nikhil@malikse.com");
  const [currentRole, setCurrentRole] = useState<UserRole>(user?.role || "admin");
  const [memberSince] = useState("12 Sep 2026");

  // Preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [otpSecurity, setOtpSecurity] = useState(true);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Edit Temp Inputs
  const [editNameInput, setEditNameInput] = useState(fullName);
  const [editMobileInput, setEditMobileInput] = useState(mobileNumber);
  const [editEmailInput, setEditEmailInput] = useState(emailAddress);

  // Inject Google Fonts for authentic cursive script on web
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const fontId = "google-fonts-malikse-cursive";
      if (!document.getElementById(fontId)) {
        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Kalam:wght@400;700&display=swap";
        document.head.appendChild(link);
      }
    }
  }, []);

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    authStore.setUser({
      id: user?.id || "demo_id",
      role: newRole,
      name: fullName,
      mobile: mobileNumber,
      isVerifiedIdentity: true,
      createdAt: new Date().toISOString(),
    });
    setShowRoleModal(false);

    if (newRole === "owner") router.push("/my-properties");
    else if (newRole === "buyer") router.push("/search");
    else if (newRole === "advisor") router.push("/advisor/tasks");
    else if (newRole === "admin") router.push("/admin/dashboard");
  };

  const handleSaveAccountInfo = () => {
    setFullName(editNameInput.trim());
    setMobileNumber(editMobileInput.trim());
    setEmailAddress(editEmailInput.trim());
    if (user) {
      authStore.setUser({
        ...user,
        name: editNameInput.trim(),
        mobile: editMobileInput.trim(),
      });
    }
    setShowEditModal(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    authStore.clearSession();
    router.replace("/search");
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case "owner":
        return "Property Owner";
      case "buyer":
        return "Verified Buyer";
      case "advisor":
        return "MalikSe Advisor";
      case "admin":
        return "System Admin";
      default:
        return "User";
    }
  };

  return (
    <View style={styles.screen}>
      {/* 1. Global Brand Header */}
      <AppHeader
        showBack={false}
        showNavLinks={false}
        showLanguageToggle={true}
        showPostPropertyBtn={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 2. HERO BANNER (TOP CONTAINER) ================= */}
        <View style={styles.heroCard}>
          {/* Scenic Background Image — fills 100% of container */}
          <Image
            source={heroScenicImg}
            style={styles.heroBackground}
            resizeMode="cover"
          />

          {/* Seamless Soft Gradient Mist on Left */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="heroGradient" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.90" />
                  <Stop offset="38%" stopColor="#FFFFFF" stopOpacity="0.72" />
                  <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.25" />
                  <Stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.0" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroGradient)" />
            </Svg>
          </View>

          {/* Content Layer (Overlays) */}
          <View style={styles.heroContentLayer} pointerEvents="box-none">
            {/* Top Row: Left Title + Right Cursive Script */}
            <View style={styles.heroTopRow}>
              <View style={styles.heroTitlesWrap}>
                <Text style={styles.heroCategoryLabel}>
                  {language === "hi" ? "मेरा खाता और प्रोफ़ाइल" : "MY ACCOUNT & PROFILE"}
                </Text>
                <Text style={styles.heroHeadline}>
                  Verified Identity &{"\n"}Account Settings
                </Text>
                <Text style={styles.heroSubtitle}>
                  Manage your verification status, active role and preferences.
                </Text>
              </View>

              {/* Right Top Cursive Script */}
              <View style={styles.heroCursiveWrap}>
                <Text style={styles.heroCursiveText}>
                  Safe Deals{"\n"}Trusted Future
                </Text>
              </View>
            </View>

            {/* Bottom 3 Floating Feature Pills */}
            <View style={styles.heroPillsRow}>
              {/* Pill 1: ID KYC */}
              <View style={styles.heroPill}>
                <View style={styles.heroPillIconBox}>
                  <MaterialIcons name="fingerprint" size={15} color="#059669" />
                </View>
                <View style={styles.heroPillTextWrap}>
                  <Text style={styles.heroPillTitle}>ID KYC</Text>
                  <Text style={styles.heroPillSub}>Verified</Text>
                </View>
              </View>

              {/* Pill 2: Phone OTP */}
              <View style={styles.heroPill}>
                <View style={styles.heroPillIconBox}>
                  <MaterialIcons name="phonelink-lock" size={14} color="#059669" />
                </View>
                <View style={styles.heroPillTextWrap}>
                  <Text style={styles.heroPillTitle}>Phone OTP</Text>
                  <Text style={styles.heroPillSub}>Protected</Text>
                </View>
              </View>

              {/* Pill 3: Active Role */}
              <TouchableOpacity
                style={styles.heroPill}
                onPress={() => setShowRoleModal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.heroPillIconBox}>
                  <MaterialIcons name="admin-panel-settings" size={15} color="#059669" />
                </View>
                <View style={styles.heroPillTextWrap}>
                  <Text style={styles.heroPillTitle}>Role</Text>
                  <Text style={styles.heroPillSub} numberOfLines={1}>
                    {getRoleLabel(currentRole)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bodyContent}>
          {/* ================= 3. USER PROFILE HERO CARD ================= */}
          <View style={styles.card}>
            <View style={styles.profileHeaderRow}>
              {/* Large Circular Avatar with Verified Badge */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>
                    {fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.avatarVerifiedBadge}>
                  <MaterialIcons name="check" size={11} color="#FFFFFF" />
                </View>
              </View>

              {/* User Info Details */}
              <View style={styles.profileInfoWrap}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {fullName}
                  </Text>
                  <View style={styles.roleBadgePill}>
                    <Text style={styles.roleBadgeText}>
                      {getRoleLabel(currentRole)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.profileSubtext}>
                  +91 {mobileNumber} • {emailAddress}
                </Text>

                <View style={styles.memberSinceRow}>
                  <MaterialIcons name="date-range" size={13} color="#64748B" />
                  <Text style={styles.memberSinceText}>
                    Member since {memberSince}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action buttons inside card */}
            <View style={styles.profileActionsRow}>
              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => {
                  setEditNameInput(fullName);
                  setEditMobileInput(mobileNumber);
                  setEditEmailInput(emailAddress);
                  setShowEditModal(true);
                }}
                activeOpacity={0.8}
              >
                <Feather name="edit-2" size={14} color="#065F46" />
                <Text style={styles.editProfileBtnText}>Edit Account Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchRoleBtn}
                onPress={() => setShowRoleModal(true)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="sync-alt" size={15} color="#475569" />
                <Text style={styles.switchRoleBtnText}>Switch Role</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= 4. 4-STAGE TRUST & VERIFICATION STATUS ================= */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <MaterialIcons name="security" size={18} color="#059669" />
              <Text style={styles.cardTitle}>Trust & Verification Status</Text>
              <View style={styles.verifiedScoreBadge}>
                <Text style={styles.verifiedScoreText}>100% Verified</Text>
              </View>
            </View>

            <View style={styles.trustGrid}>
              <View style={styles.trustItem}>
                <View style={[styles.trustIconCircle, styles.trustGreen]}>
                  <MaterialIcons name="fingerprint" size={16} color="#059669" />
                </View>
                <Text style={styles.trustTitle}>Govt ID KYC</Text>
                <Text style={styles.trustStatus}>Verified</Text>
              </View>

              <View style={styles.trustItem}>
                <View style={[styles.trustIconCircle, styles.trustGreen]}>
                  <MaterialIcons name="phone-android" size={16} color="#059669" />
                </View>
                <Text style={styles.trustTitle}>Phone OTP</Text>
                <Text style={styles.trustStatus}>Linked</Text>
              </View>

              <View style={styles.trustItem}>
                <View style={[styles.trustIconCircle, styles.trustGreen]}>
                  <MaterialIcons name="lock" size={16} color="#059669" />
                </View>
                <Text style={styles.trustTitle}>Document Vault</Text>
                <Text style={styles.trustStatus}>Encrypted</Text>
              </View>

              <View style={styles.trustItem}>
                <View style={[styles.trustIconCircle, styles.trustGreen]}>
                  <MaterialIcons name="verified" size={16} color="#059669" />
                </View>
                <Text style={styles.trustTitle}>Standing</Text>
                <Text style={styles.trustStatus}>Excellent</Text>
              </View>
            </View>
          </View>

          {/* ================= 5. QUICK NAVIGATION SHORTCUTS ================= */}
          <Text style={styles.sectionHeader}>QUICK ACCESS</Text>
          <View style={styles.cardGroup}>
            {/* My Properties */}
            <TouchableOpacity
              style={styles.navRow}
              onPress={() => router.push("/my-properties")}
              activeOpacity={0.75}
            >
              <View style={[styles.navIconBox, { backgroundColor: "#ECFDF5" }]}>
                <MaterialIcons name="home-work" size={18} color="#059669" />
              </View>
              <View style={styles.navRowTextWrap}>
                <Text style={styles.navRowTitle}>My Listed Properties</Text>
                <Text style={styles.navRowSubtitle}>Manage listings & verification reports</Text>
              </View>
              <View style={styles.navCountBadge}>
                <Text style={styles.navCountBadgeText}>2 Listed</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Saved Properties */}
            <TouchableOpacity
              style={styles.navRow}
              onPress={() => router.push("/saved")}
              activeOpacity={0.75}
            >
              <View style={[styles.navIconBox, { backgroundColor: "#F0FDF4" }]}>
                <MaterialIcons name="bookmark" size={18} color="#059669" />
              </View>
              <View style={styles.navRowTextWrap}>
                <Text style={styles.navRowTitle}>Saved Properties</Text>
                <Text style={styles.navRowSubtitle}>Your shortlisted plots and land</Text>
              </View>
              <View style={styles.navCountBadge}>
                <Text style={styles.navCountBadgeText}>2 Saved</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Direct Messages */}
            <TouchableOpacity
              style={styles.navRow}
              onPress={() => router.push("/messages")}
              activeOpacity={0.75}
            >
              <View style={[styles.navIconBox, { backgroundColor: "#EFF6FF" }]}>
                <MaterialIcons name="chat" size={18} color="#2563EB" />
              </View>
              <View style={styles.navRowTextWrap}>
                <Text style={styles.navRowTitle}>Messages & Enquiries</Text>
                <Text style={styles.navRowSubtitle}>Chats with buyers, owners & advisors</Text>
              </View>
              <View style={[styles.navCountBadge, { backgroundColor: "#A7F3D0" }]}>
                <Text style={[styles.navCountBadgeText, { color: "#065F46" }]}>1 New</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* ================= 6. PREFERENCES & SECURITY ================= */}
          <Text style={styles.sectionHeader}>PREFERENCES & SECURITY</Text>
          <View style={styles.cardGroup}>
            {/* Language Switch */}
            <View style={styles.navRow}>
              <View style={[styles.navIconBox, { backgroundColor: "#F5F3FF" }]}>
                <MaterialIcons name="translate" size={18} color="#7C3AED" />
              </View>
              <View style={styles.navRowTextWrap}>
                <Text style={styles.navRowTitle}>App Language</Text>
                <Text style={styles.navRowSubtitle}>
                  {language === "hi" ? "हिंदी (Hindi)" : "English"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.langToggleBtn}
                onPress={toggleLanguage}
                activeOpacity={0.8}
              >
                <Text style={styles.langToggleBtnText}>
                  {language === "hi" ? "Switch to English" : "हिंदी में बदलें"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowDivider} />

            {/* Push Notifications Toggle */}
            <View style={styles.navRow}>
              <View style={[styles.navIconBox, { backgroundColor: "#FFFBEB" }]}>
                <MaterialIcons name="notifications-active" size={18} color="#D97706" />
              </View>
              <View style={styles.navRowTextWrap}>
                <Text style={styles.navRowTitle}>Deal & Offer Alerts</Text>
                <Text style={styles.navRowSubtitle}>Receive push & SMS notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: "#CBD5E1", true: "#A7F3D0" }}
                thumbColor={pushNotifications ? "#059669" : "#F1F5F9"}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* OTP Two-Factor Authentication */}
            <View style={styles.navRow}>
              <View style={[styles.navIconBox, { backgroundColor: "#ECFDF5" }]}>
                <MaterialIcons name="security" size={18} color="#059669" />
              </View>
              <View style={styles.navRowTextWrap}>
                <Text style={styles.navRowTitle}>OTP 2-Factor Login</Text>
                <Text style={styles.navRowSubtitle}>Mandatory phone verification</Text>
              </View>
              <Switch
                value={otpSecurity}
                onValueChange={setOtpSecurity}
                trackColor={{ false: "#CBD5E1", true: "#A7F3D0" }}
                thumbColor={otpSecurity ? "#059669" : "#F1F5F9"}
              />
            </View>
          </View>

          {/* ================= 7. HELP & LEGAL ================= */}
          <Text style={styles.sectionHeader}>SUPPORT & LEGAL</Text>
          <View style={styles.cardGroup}>
            {/* Helpdesk */}
            <TouchableOpacity
              style={styles.navRow}
              onPress={() => setShowSupportModal(true)}
              activeOpacity={0.75}
            >
              <View style={[styles.navIconBox, { backgroundColor: "#F0FDF4" }]}>
                <MaterialIcons name="support-agent" size={18} color="#059669" />
              </View>
              <View style={styles.navRowTextWrap}>
                <Text style={styles.navRowTitle}>Helpdesk & Advisor Support</Text>
                <Text style={styles.navRowSubtitle}>Talk with a Patna land verification specialist</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Terms & Privacy */}
            <View style={styles.navRow}>
              <View style={[styles.navIconBox, { backgroundColor: "#F1F5F9" }]}>
                <MaterialIcons name="gavel" size={18} color="#475569" />
              </View>
              <View style={styles.navRowTextWrap}>
                <Text style={styles.navRowTitle}>Security & Privacy Terms</Text>
                <Text style={styles.navRowSubtitle}>Licensed land registry & escrow protocols</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
            </View>
          </View>

          {/* ================= 8. LOGOUT BUTTON ================= */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={18} color="#DC2626" />
            <Text style={styles.logoutBtnText}>Log Out of MalikSe</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>
            MalikSe v2.4.0 • Bihar Verified Land Exchange
          </Text>
        </View>
      </ScrollView>

      {/* ================= MODAL: EDIT ACCOUNT ================= */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Account Details</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editNameInput}
              onChangeText={setEditNameInput}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={styles.modalInput}
              value={editMobileInput}
              onChangeText={setEditMobileInput}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.modalInput}
              value={editEmailInput}
              onChangeText={setEditEmailInput}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowEditModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveAccountInfo}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: SWITCH ROLE ================= */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Active Role</Text>
              <TouchableOpacity
                onPress={() => setShowRoleModal(false)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Switch between perspectives to view customized features.
            </Text>

            {(["owner", "buyer", "advisor", "admin"] as UserRole[]).map((r) => {
              const isSelected = currentRole === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleOptionRow, isSelected && styles.roleOptionRowSelected]}
                  onPress={() => switchRole(r)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={
                      r === "owner"
                        ? "home"
                        : r === "buyer"
                        ? "shopping-bag"
                        : r === "advisor"
                        ? "support-agent"
                        : "admin-panel-settings"
                    }
                    size={20}
                    color={isSelected ? "#065F46" : "#475569"}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={[
                        styles.roleOptionTitle,
                        isSelected && styles.roleOptionTitleSelected,
                      ]}
                    >
                      {getRoleLabel(r)}
                    </Text>
                  </View>
                  {isSelected && (
                    <MaterialIcons name="check-circle" size={18} color="#059669" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: SUPPORT ================= */}
      <Modal
        visible={showSupportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>MalikSe Advisor Support</Text>
              <TouchableOpacity
                onPress={() => setShowSupportModal(false)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Direct assistance with registry checks, mutation slips, circle office queries, and site visits.
            </Text>

            <View style={styles.supportContactBox}>
              <MaterialIcons name="headset-mic" size={24} color="#059669" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.supportContactTitle}>Helpline & WhatsApp</Text>
                <Text style={styles.supportContactPhone}>+91 7667184920</Text>
                <Text style={styles.supportContactHours}>Daily 9:00 AM – 8:00 PM</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={() => setShowSupportModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalSaveBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: LOGOUT CONFIRMATION ================= */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalSub}>
              Are you sure you want to log out of your MalikSe account?
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: "#DC2626" }]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSaveBtnText}>Yes, Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    paddingBottom: 32,
  },

  /* ================= HERO BANNER ================= */
  heroCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    height: 222,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: "#E2E8F0",
  },
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroContentLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    justifyContent: "space-between",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroTitlesWrap: {
    flex: 1,
    paddingRight: 6,
  },
  heroCategoryLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroHeadline: {
    fontSize: 20.5,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 25,
    letterSpacing: -0.4,
    marginTop: 3,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    lineHeight: 15,
    marginTop: 4,
  },
  heroCursiveWrap: {
    alignItems: "flex-end",
    paddingTop: 1,
  },
  heroCursiveText: {
    fontFamily: Platform.OS === "web" ? "Caveat, Kalam, 'Segoe Script', cursive" : (Platform.OS === "ios" ? "Snell Roundhand" : "serif"),
    fontSize: 13.5,
    color: "#166534",
    fontStyle: "italic",
    textAlign: "right",
    lineHeight: 17,
    transform: [{ rotate: "-4deg" }],
    fontWeight: "700",
  },
  heroPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroPill: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  heroPillIconBox: {
    width: 25,
    height: 25,
    borderRadius: 7,
    backgroundColor: "#E6F4EA",
    justifyContent: "center",
    alignItems: "center",
  },
  heroPillTextWrap: {
    flex: 1,
  },
  heroPillTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
  },
  heroPillSub: {
    fontSize: 8.5,
    color: "#475569",
    fontWeight: "600",
    marginTop: 1,
  },

  /* ================= BODY CONTENT ================= */
  bodyContent: {
    paddingHorizontal: 16,
    gap: 14,
  },

  /* Card Container */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  /* Profile Header Inside Card */
  profileHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#047857",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#047857",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  avatarVerifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#059669",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfoWrap: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  roleBadgePill: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#065F46",
  },
  profileSubtext: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
  memberSinceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  memberSinceText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },

  profileActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#065F46",
  },
  switchRoleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  switchRoleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },

  /* Trust Status Grid */
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
  },
  verifiedScoreBadge: {
    backgroundColor: "#ECFDF5",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  verifiedScoreText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#065F46",
  },
  trustGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trustItem: {
    alignItems: "center",
    flex: 1,
  },
  trustIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  trustGreen: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  trustTitle: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
  trustStatus: {
    fontSize: 10,
    fontWeight: "800",
    color: "#065F46",
    marginTop: 1,
  },

  /* Section Header */
  sectionHeader: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginTop: 6,
    marginBottom: -4,
  },

  /* Nav Rows in Card Groups */
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  navIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  navRowTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  navRowTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  navRowSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  navCountBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    marginRight: 6,
  },
  navCountBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#475569",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 60,
  },
  langToggleBtn: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  langToggleBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7C3AED",
  },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#DC2626",
  },
  versionText: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSub: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 14,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#0F172A",
    outlineStyle: "none" as any,
  },
  modalBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  modalCancelBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#475569",
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#059669",
  },
  modalSaveBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  roleOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  roleOptionRowSelected: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  roleOptionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  roleOptionTitleSelected: {
    color: "#065F46",
    fontWeight: "800",
  },
  supportContactBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 16,
  },
  supportContactTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#065F46",
  },
  supportContactPhone: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  supportContactHours: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 1,
  },
});
