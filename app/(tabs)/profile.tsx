import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  useWindowDimensions,
  Platform,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import { useAuthStore } from "../../src/store/authStore";
import { useLanguageStore } from "../../src/store/languageStore";
import { UserRole } from "../../src/types/auth.types";
import { t } from "../../src/i18n/translations";

const heroBgImg = require("../../assets/my_listings_hero_bg.png");
const villaThumb = require("../../assets/verification_boost_bg.png");

export default function ProfileScreen() {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguageStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const authStore = useAuthStore();
  const { user } = authStore;

  // Active navigation in profile sidebar
  const [activeSidebarNav, setActiveSidebarNav] = useState<
    | "profile"
    | "security"
    | "listings"
    | "messages"
    | "saved"
    | "documents"
    | "notifications"
    | "settings"
  >("profile");

  // Profile data state (defaults to exact user screenshot)
  const [fullName, setFullName] = useState(user?.name || "Nikhil kumar");
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || "7667184920");
  const [emailAddress, setEmailAddress] = useState("nikhil@malikse.com");
  const [currentRole, setCurrentRole] = useState<UserRole>(user?.role || "admin");
  const [memberSince] = useState("12 Sep 2026");

  // Preferences
  const [prefLanguage, setPrefLanguage] = useState<"English" | "Hindi">("English");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [themeMode, setThemeMode] = useState<"Light" | "Dark">("Light");

  // Modals
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showEditPrefModal, setShowEditPrefModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(false);

  // Edit Temp Inputs
  const [editNameInput, setEditNameInput] = useState(fullName);
  const [editMobileInput, setEditMobileInput] = useState(mobileNumber);
  const [editEmailInput, setEditEmailInput] = useState(emailAddress);

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
    setShowEditAccountModal(false);
  };

  const avatarLetter = (fullName.charAt(0) || "N").toUpperCase();

  return (
    <View style={styles.screen}>
      {/* Universal Brand AppHeader navbar */}
      <AppHeader
        showBack={false}
        showNavLinks={true}
        showLanguageToggle={true}
        showPostPropertyBtn={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
          {/* ================= LEFT SIDEBAR ================= */}
          {isDesktop && (
            <View style={styles.sidebar}>
              {/* Back to Home action */}
              <TouchableOpacity
                style={styles.sidebarBackBtn}
                onPress={() => router.replace("/search")}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={16} color="#1E293B" />
                <Text style={styles.sidebarBackBtnText}>
                  {language === "hi" ? "होम पर वापस" : "Back to Home"}
                </Text>
              </TouchableOpacity>

              {/* Sidebar Menu Items */}
              <View style={styles.sidebarMenu}>
                {/* 1. Profile (Active) */}
                <TouchableOpacity
                  style={[
                    styles.sidebarNavItem,
                    activeSidebarNav === "profile" && styles.sidebarNavItemActive,
                  ]}
                  onPress={() => setActiveSidebarNav("profile")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="person"
                    size={18}
                    color={activeSidebarNav === "profile" ? "#065F46" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.sidebarNavText,
                      activeSidebarNav === "profile" && styles.sidebarNavTextActive,
                    ]}
                  >
                    {language === "hi" ? "प्रोफ़ाइल" : "Profile"}
                  </Text>
                </TouchableOpacity>

                {/* 2. Security */}
                <TouchableOpacity
                  style={[
                    styles.sidebarNavItem,
                    activeSidebarNav === "security" && styles.sidebarNavItemActive,
                  ]}
                  onPress={() => {
                    setActiveSidebarNav("security");
                    setShowSecurityModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="shield"
                    size={18}
                    color={activeSidebarNav === "security" ? "#065F46" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.sidebarNavText,
                      activeSidebarNav === "security" && styles.sidebarNavTextActive,
                    ]}
                  >
                    {language === "hi" ? "सुरक्षा" : "Security"}
                  </Text>
                </TouchableOpacity>

                {/* 3. My Listings */}
                <TouchableOpacity
                  style={[
                    styles.sidebarNavItem,
                    activeSidebarNav === "listings" && styles.sidebarNavItemActive,
                  ]}
                  onPress={() => {
                    setActiveSidebarNav("listings");
                    router.push("/my-properties");
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="home-work"
                    size={18}
                    color={activeSidebarNav === "listings" ? "#065F46" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.sidebarNavText,
                      activeSidebarNav === "listings" && styles.sidebarNavTextActive,
                    ]}
                  >
                    {language === "hi" ? "मेरी लिस्टिंग" : "My Listings"}
                  </Text>
                </TouchableOpacity>

                {/* 4. Messages */}
                <TouchableOpacity
                  style={[
                    styles.sidebarNavItem,
                    activeSidebarNav === "messages" && styles.sidebarNavItemActive,
                  ]}
                  onPress={() => {
                    setActiveSidebarNav("messages");
                    router.push("/messages");
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="mail-outline"
                    size={18}
                    color={activeSidebarNav === "messages" ? "#065F46" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.sidebarNavText,
                      activeSidebarNav === "messages" && styles.sidebarNavTextActive,
                    ]}
                  >
                    {language === "hi" ? "संदेश" : "Messages"}
                  </Text>
                </TouchableOpacity>

                {/* 5. Saved Properties */}
                <TouchableOpacity
                  style={[
                    styles.sidebarNavItem,
                    activeSidebarNav === "saved" && styles.sidebarNavItemActive,
                  ]}
                  onPress={() => {
                    setActiveSidebarNav("saved");
                    router.push("/saved");
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="favorite-border"
                    size={18}
                    color={activeSidebarNav === "saved" ? "#065F46" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.sidebarNavText,
                      activeSidebarNav === "saved" && styles.sidebarNavTextActive,
                    ]}
                  >
                    {language === "hi" ? "सहेजी गई संपत्तियां" : "Saved Properties"}
                  </Text>
                </TouchableOpacity>

                {/* 6. Documents */}
                <TouchableOpacity
                  style={[
                    styles.sidebarNavItem,
                    activeSidebarNav === "documents" && styles.sidebarNavItemActive,
                  ]}
                  onPress={() => setActiveSidebarNav("documents")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="description"
                    size={18}
                    color={activeSidebarNav === "documents" ? "#065F46" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.sidebarNavText,
                      activeSidebarNav === "documents" && styles.sidebarNavTextActive,
                    ]}
                  >
                    {language === "hi" ? "दस्तावेज़" : "Documents"}
                  </Text>
                </TouchableOpacity>

                {/* 7. Notifications */}
                <TouchableOpacity
                  style={[
                    styles.sidebarNavItem,
                    activeSidebarNav === "notifications" && styles.sidebarNavItemActive,
                  ]}
                  onPress={() => setActiveSidebarNav("notifications")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="notifications-none"
                    size={18}
                    color={activeSidebarNav === "notifications" ? "#065F46" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.sidebarNavText,
                      activeSidebarNav === "notifications" && styles.sidebarNavTextActive,
                    ]}
                  >
                    {language === "hi" ? "सूचनाएं" : "Notifications"}
                  </Text>
                </TouchableOpacity>

                {/* 8. Settings */}
                <TouchableOpacity
                  style={[
                    styles.sidebarNavItem,
                    activeSidebarNav === "settings" && styles.sidebarNavItemActive,
                  ]}
                  onPress={() => {
                    setActiveSidebarNav("settings");
                    setShowEditPrefModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="settings"
                    size={18}
                    color={activeSidebarNav === "settings" ? "#065F46" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.sidebarNavText,
                      activeSidebarNav === "settings" && styles.sidebarNavTextActive,
                    ]}
                  >
                    {language === "hi" ? "सेटिंग्स" : "Settings"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Promo Card ("Build a Safer Tomorrow") */}
              <View style={styles.sidebarPromoCard}>
                <View style={styles.sidebarPromoHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sidebarPromoTitle}>
                      Build a Safer{"\n"}Tomorrow
                    </Text>
                    <Text style={styles.sidebarPromoSub}>
                      Verified People{"\n"}Genuine Properties
                    </Text>
                  </View>
                  <View style={styles.sidebarPromoArrowBtn}>
                    <MaterialIcons name="arrow-forward" size={14} color="#059669" />
                  </View>
                </View>
                <View style={styles.sidebarPromoImgWrap}>
                  <Image
                    source={villaThumb}
                    style={styles.sidebarPromoImg}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          )}

          {/* ================= RIGHT MAIN CONTENT AREA ================= */}
          <View style={styles.mainContent}>
            {/* Top Page Header Title & Top-Right Landscape Watermark */}
            <View style={styles.topPageHeaderRow}>
              <View>
                <Text style={styles.pageMainTitle}>
                  {language === "hi" ? "खाता और प्रोफ़ाइल" : "Account & Profile"}
                </Text>
                <Text style={styles.pageSubtitle}>
                  {language === "hi"
                    ? "अपनी व्यक्तिगत जानकारी, सुरक्षा और प्राथमिकताओं का प्रबंधन करें"
                    : "Manage your personal information, security and preferences"}
                </Text>
              </View>

              {/* Scenic Top-Right Cursive & Hills Graphic */}
              {isDesktop && (
                <View style={styles.topHeaderGraphicBox}>
                  <Image
                    source={heroBgImg}
                    style={styles.topHeaderGraphicImg}
                    resizeMode="cover"
                  />
                  <View style={styles.topHeaderGraphicOverlay} />
                  <View style={styles.topHeaderCursiveWrap}>
                    <Text style={styles.topHeaderCursiveText}>
                      Verified Land{"\n"}Brighter Tomorrow
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* User Profile Identity Hero Card */}
            <View style={styles.profileHeroCard}>
              {/* Left Column: Avatar + Camera Badge + Details */}
              <View style={styles.profileHeroLeft}>
                {/* Avatar with Camera Overlay */}
                <TouchableOpacity
                  style={styles.avatarWrap}
                  onPress={() => setShowAvatarPrompt(true)}
                  activeOpacity={0.85}
                >
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarTxt}>{avatarLetter}</Text>
                  </View>
                  <View style={styles.avatarCameraBadge}>
                    <MaterialIcons name="photo-camera" size={13} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>

                {/* User Name & Badges & Mobile */}
                <View style={styles.profileHeroMeta}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userNameText}>{fullName}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setEditNameInput(fullName);
                        setEditMobileInput(mobileNumber);
                        setEditEmailInput(emailAddress);
                        setShowEditAccountModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="edit" size={16} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.userBadgesRow}>
                    <View style={styles.adminPill}>
                      <Text style={styles.adminPillText}>ADMIN</Text>
                    </View>
                    <View style={styles.rolePill}>
                      <Text style={styles.rolePillText}>Super Admin</Text>
                    </View>
                  </View>

                  <View style={styles.userPhoneRow}>
                    <MaterialIcons name="phone" size={13} color="#64748B" />
                    <Text style={styles.userPhoneText}>{mobileNumber}</Text>
                  </View>
                </View>
              </View>

              {/* Right Column: 3 Quick Metric Counters */}
              <View style={styles.profileHeroStats}>
                {/* Metric 1: Listings */}
                <View style={styles.heroStatCol}>
                  <Text style={styles.heroStatNumber}>1</Text>
                  <Text style={styles.heroStatLabel}>Listings</Text>
                </View>

                <View style={styles.heroStatDivider} />

                {/* Metric 2: Messages */}
                <View style={styles.heroStatCol}>
                  <Text style={styles.heroStatNumber}>3</Text>
                  <Text style={styles.heroStatLabel}>Messages</Text>
                </View>

                <View style={styles.heroStatDivider} />

                {/* Metric 3: Saved */}
                <View style={styles.heroStatCol}>
                  <Text style={styles.heroStatNumber}>0</Text>
                  <Text style={styles.heroStatLabel}>Saved</Text>
                </View>
              </View>
            </View>

            {/* 2-Column Content Grid */}
            <View style={[styles.contentGrid, isDesktop && styles.contentGridDesktop]}>
              {/* ===== LEFT COLUMN ===== */}
              <View style={styles.gridLeftCol}>
                {/* 1. Account Information Card */}
                <View style={styles.sectionCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardHeaderTitle}>Account Information</Text>
                    <TouchableOpacity
                      style={styles.cardHeaderEditBtn}
                      onPress={() => {
                        setEditNameInput(fullName);
                        setEditMobileInput(mobileNumber);
                        setEditEmailInput(emailAddress);
                        setShowEditAccountModal(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="edit" size={13} color="#475569" />
                      <Text style={styles.cardHeaderEditBtnText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Rows */}
                  <View style={styles.tableList}>
                    {/* Row 1: Full Name */}
                    <View style={styles.tableRow}>
                      <View style={styles.tableLabelCol}>
                        <MaterialIcons name="person-outline" size={17} color="#64748B" />
                        <Text style={styles.tableLabel}>Full Name</Text>
                      </View>
                      <Text style={styles.tableValue}>{fullName}</Text>
                    </View>

                    {/* Row 2: Registered Mobile */}
                    <View style={styles.tableRow}>
                      <View style={styles.tableLabelCol}>
                        <MaterialIcons name="phone" size={17} color="#64748B" />
                        <Text style={styles.tableLabel}>Registered Mobile</Text>
                      </View>
                      <Text style={styles.tableValue}>{mobileNumber}</Text>
                    </View>

                    {/* Row 3: Email Address */}
                    <View style={styles.tableRow}>
                      <View style={styles.tableLabelCol}>
                        <MaterialIcons name="mail-outline" size={17} color="#64748B" />
                        <Text style={styles.tableLabel}>Email Address</Text>
                      </View>
                      <Text style={styles.tableValue}>{emailAddress}</Text>
                    </View>

                    {/* Row 4: Identity Verification */}
                    <View style={styles.tableRow}>
                      <View style={styles.tableLabelCol}>
                        <MaterialIcons name="verified" size={17} color="#059669" />
                        <Text style={styles.tableLabel}>Identity Verification</Text>
                      </View>
                      <View style={styles.verifiedBadgePill}>
                        <MaterialIcons name="check" size={12} color="#047857" />
                        <Text style={styles.verifiedBadgeText}>Verified</Text>
                      </View>
                    </View>

                    {/* Row 5: Current Portal */}
                    <View style={styles.tableRow}>
                      <View style={styles.tableLabelCol}>
                        <MaterialIcons name="shield" size={17} color="#2563EB" />
                        <Text style={styles.tableLabel}>Current Portal</Text>
                      </View>
                      <Text style={styles.tableValue}>Super Admin</Text>
                    </View>

                    {/* Row 6: Member Since */}
                    <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                      <View style={styles.tableLabelCol}>
                        <MaterialIcons name="event" size={17} color="#64748B" />
                        <Text style={styles.tableLabel}>Member Since</Text>
                      </View>
                      <Text style={styles.tableValue}>{memberSince}</Text>
                    </View>
                  </View>
                </View>

                {/* 2. Switch User Role Portal Card */}
                <View style={styles.sectionCard}>
                  <View style={styles.roleCardHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={styles.cardHeaderTitle}>Switch User Role Portal</Text>
                      <MaterialIcons name="info-outline" size={15} color="#94A3B8" />
                    </View>
                    <Text style={styles.roleCardSubtitle}>
                      Easily preview buyer, owner, advisor, or admin views
                    </Text>
                  </View>

                  {/* 2x2 Grid of Roles */}
                  <View style={styles.roleGrid}>
                    {/* Buyer */}
                    <TouchableOpacity
                      style={[
                        styles.roleGridItem,
                        currentRole === "buyer" && styles.roleGridItemActive,
                      ]}
                      onPress={() => switchRole("buyer")}
                      activeOpacity={0.8}
                    >
                      <View style={styles.roleGridItemLeft}>
                        <MaterialIcons
                          name="group"
                          size={18}
                          color={currentRole === "buyer" ? "#065F46" : "#64748B"}
                        />
                        <Text
                          style={[
                            styles.roleGridItemText,
                            currentRole === "buyer" && styles.roleGridItemTextActive,
                          ]}
                        >
                          Buyer
                        </Text>
                      </View>
                      {currentRole === "buyer" && (
                        <View style={styles.roleCheckedCircle}>
                          <MaterialIcons name="check" size={13} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Owner */}
                    <TouchableOpacity
                      style={[
                        styles.roleGridItem,
                        currentRole === "owner" && styles.roleGridItemActive,
                      ]}
                      onPress={() => switchRole("owner")}
                      activeOpacity={0.8}
                    >
                      <View style={styles.roleGridItemLeft}>
                        <MaterialIcons
                          name="home"
                          size={18}
                          color={currentRole === "owner" ? "#065F46" : "#64748B"}
                        />
                        <Text
                          style={[
                            styles.roleGridItemText,
                            currentRole === "owner" && styles.roleGridItemTextActive,
                          ]}
                        >
                          Owner
                        </Text>
                      </View>
                      {currentRole === "owner" && (
                        <View style={styles.roleCheckedCircle}>
                          <MaterialIcons name="check" size={13} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Advisor */}
                    <TouchableOpacity
                      style={[
                        styles.roleGridItem,
                        currentRole === "advisor" && styles.roleGridItemActive,
                      ]}
                      onPress={() => switchRole("advisor")}
                      activeOpacity={0.8}
                    >
                      <View style={styles.roleGridItemLeft}>
                        <MaterialIcons
                          name="verified-user"
                          size={18}
                          color={currentRole === "advisor" ? "#065F46" : "#64748B"}
                        />
                        <Text
                          style={[
                            styles.roleGridItemText,
                            currentRole === "advisor" && styles.roleGridItemTextActive,
                          ]}
                        >
                          Advisor
                        </Text>
                      </View>
                      {currentRole === "advisor" && (
                        <View style={styles.roleCheckedCircle}>
                          <MaterialIcons name="check" size={13} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Admin (Active) */}
                    <TouchableOpacity
                      style={[
                        styles.roleGridItem,
                        currentRole === "admin" && styles.roleGridItemActive,
                      ]}
                      onPress={() => switchRole("admin")}
                      activeOpacity={0.8}
                    >
                      <View style={styles.roleGridItemLeft}>
                        <MaterialIcons
                          name="settings"
                          size={18}
                          color={currentRole === "admin" ? "#065F46" : "#64748B"}
                        />
                        <Text
                          style={[
                            styles.roleGridItemText,
                            currentRole === "admin" && styles.roleGridItemTextActive,
                          ]}
                        >
                          Admin
                        </Text>
                      </View>
                      {currentRole === "admin" && (
                        <View style={styles.roleCheckedCircle}>
                          <MaterialIcons name="check" size={13} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3. Preferences Card */}
                <View style={styles.sectionCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardHeaderTitle}>Preferences</Text>
                    <TouchableOpacity
                      style={styles.cardHeaderEditBtn}
                      onPress={() => setShowEditPrefModal(true)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="edit" size={13} color="#475569" />
                      <Text style={styles.cardHeaderEditBtnText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Rows */}
                  <View style={styles.tableList}>
                    {/* Row 1: Language */}
                    <View style={styles.tableRow}>
                      <View style={styles.tableLabelCol}>
                        <MaterialIcons name="language" size={17} color="#64748B" />
                        <Text style={styles.tableLabel}>Language</Text>
                      </View>
                      <Text style={styles.tableValue}>{prefLanguage}</Text>
                    </View>

                    {/* Row 2: Email Notifications */}
                    <View style={styles.tableRow}>
                      <View style={styles.tableLabelCol}>
                        <MaterialIcons name="notifications-none" size={17} color="#64748B" />
                        <Text style={styles.tableLabel}>Email Notifications</Text>
                      </View>
                      <Text style={styles.tableValue}>
                        {emailNotifications ? "Enabled" : "Disabled"}
                      </Text>
                    </View>

                    {/* Row 3: Theme */}
                    <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                      <View style={styles.tableLabelCol}>
                        <MaterialIcons name="palette" size={17} color="#64748B" />
                        <Text style={styles.tableLabel}>Theme</Text>
                      </View>
                      <Text style={styles.tableValue}>{themeMode}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* ===== RIGHT COLUMN ===== */}
              <View style={styles.gridRightCol}>
                {/* 1. Profile Completion Card */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Profile Completion</Text>

                  {/* Circular Progress Ring */}
                  <View style={styles.progressRingBox}>
                    <View style={styles.progressRingWrapper}>
                      {Platform.OS === "web" ? (
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          {/* Background Track Circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#E2E8F0"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          {/* Progress Circle (80% dash: 2 * PI * 40 ≈ 251.2, 80% = 200.9) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#059669"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray="251.2"
                            strokeDashoffset="50.2"
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      ) : (
                        <View style={styles.mobileRingFallback}>
                          <View style={styles.mobileRingTrack} />
                        </View>
                      )}
                      <View style={styles.progressRingCenter}>
                        <Text style={styles.progressPercentText}>80%</Text>
                      </View>
                    </View>

                    <Text style={styles.progressHeadingText}>Almost there!</Text>
                    <Text style={styles.progressSubText}>
                      Complete your profile for a better experience.
                    </Text>
                  </View>

                  {/* Checklist */}
                  <View style={styles.checklist}>
                    {/* Item 1: Mobile Number */}
                    <View style={styles.checklistItem}>
                      <View style={styles.checkCircleCompleted}>
                        <MaterialIcons name="check" size={11} color="#FFFFFF" />
                      </View>
                      <Text style={styles.checklistLabel}>Mobile Number</Text>
                    </View>

                    {/* Item 2: Identity Verification */}
                    <View style={styles.checklistItem}>
                      <View style={styles.checkCircleCompleted}>
                        <MaterialIcons name="check" size={11} color="#FFFFFF" />
                      </View>
                      <Text style={styles.checklistLabel}>Identity Verification</Text>
                    </View>

                    {/* Item 3: Set Profile Picture */}
                    <View style={styles.checklistItem}>
                      <View style={styles.checkCircleCompleted}>
                        <MaterialIcons name="check" size={11} color="#FFFFFF" />
                      </View>
                      <Text style={styles.checklistLabel}>Set Profile Picture</Text>
                    </View>

                    {/* Item 4: Add Email Address */}
                    <View style={styles.checklistItem}>
                      <View style={styles.checkCirclePending} />
                      <Text style={styles.checklistLabelPending}>Add Email Address</Text>
                    </View>
                  </View>
                </View>

                {/* 2. Security Card */}
                <View style={styles.sectionCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardHeaderTitle}>Security</Text>
                    <TouchableOpacity
                      style={styles.cardHeaderEditBtn}
                      onPress={() => setShowSecurityModal(true)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="settings" size={13} color="#475569" />
                      <Text style={styles.cardHeaderEditBtnText}>Manage</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Security items list */}
                  <View style={styles.tableList}>
                    {/* Password */}
                    <TouchableOpacity
                      style={styles.securityRow}
                      onPress={() => setShowSecurityModal(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.securityRowLeft}>
                        <MaterialIcons name="lock-outline" size={18} color="#0F172A" />
                        <View>
                          <Text style={styles.securityRowTitle}>Password</Text>
                          <Text style={styles.securityRowSub}>Last changed 2 months ago</Text>
                        </View>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color="#64748B" />
                    </TouchableOpacity>

                    {/* Two-Factor Authentication */}
                    <TouchableOpacity
                      style={styles.securityRow}
                      onPress={() => setShowSecurityModal(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.securityRowLeft}>
                        <MaterialIcons name="security" size={18} color="#0F172A" />
                        <View>
                          <Text style={styles.securityRowTitle}>Two-Factor Authentication</Text>
                          <Text style={styles.securityRowSub}>Not enabled</Text>
                        </View>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color="#64748B" />
                    </TouchableOpacity>

                    {/* Active Sessions */}
                    <TouchableOpacity
                      style={[styles.securityRow, { borderBottomWidth: 0 }]}
                      onPress={() => setShowSecurityModal(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.securityRowLeft}>
                        <MaterialIcons name="smartphone" size={18} color="#0F172A" />
                        <View>
                          <Text style={styles.securityRowTitle}>Active Sessions</Text>
                          <Text style={styles.securityRowSub}>3 devices</Text>
                        </View>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3. Need Help? Card */}
                <View style={styles.needHelpCard}>
                  <View style={styles.needHelpTopRow}>
                    <View style={styles.needHelpIconCircle}>
                      <MaterialIcons name="headset-mic" size={20} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.needHelpTitle}>Need Help?</Text>
                      <Text style={styles.needHelpSub}>
                        Our support team is here to assist you.
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.needHelpActionBtn}
                    onPress={() => setShowSupportModal(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.needHelpActionBtnText}>Contact Support</Text>
                    <MaterialIcons name="arrow-forward" size={14} color="#059669" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ================= EDIT ACCOUNT MODAL ================= */}
      {showEditAccountModal && (
        <Modal
          visible={showEditAccountModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEditAccountModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Account Information</Text>
                <TouchableOpacity onPress={() => setShowEditAccountModal(false)}>
                  <MaterialIcons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editNameInput}
                    onChangeText={setEditNameInput}
                    placeholder="Enter your full name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Registered Mobile Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editMobileInput}
                    onChangeText={setEditMobileInput}
                    keyboardType="phone-pad"
                    placeholder="Enter 10-digit mobile"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editEmailInput}
                    onChangeText={setEditEmailInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Enter email address"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowEditAccountModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleSaveAccountInfo}
                >
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ================= PREFERENCES MODAL ================= */}
      {showEditPrefModal && (
        <Modal
          visible={showEditPrefModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEditPrefModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Preferences</Text>
                <TouchableOpacity onPress={() => setShowEditPrefModal(false)}>
                  <MaterialIcons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>App Display Language</Text>
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                    <TouchableOpacity
                      style={[
                        styles.prefSelectBtn,
                        prefLanguage === "English" && styles.prefSelectBtnActive,
                      ]}
                      onPress={() => setPrefLanguage("English")}
                    >
                      <Text
                        style={[
                          styles.prefSelectText,
                          prefLanguage === "English" && styles.prefSelectTextActive,
                        ]}
                      >
                        English
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.prefSelectBtn,
                        prefLanguage === "Hindi" && styles.prefSelectBtnActive,
                      ]}
                      onPress={() => setPrefLanguage("Hindi")}
                    >
                      <Text
                        style={[
                          styles.prefSelectText,
                          prefLanguage === "Hindi" && styles.prefSelectTextActive,
                        ]}
                      >
                        हिंदी
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Notifications</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleRowBtn,
                      emailNotifications && styles.toggleRowBtnActive,
                    ]}
                    onPress={() => setEmailNotifications(!emailNotifications)}
                  >
                    <MaterialIcons
                      name={emailNotifications ? "check-box" : "check-box-outline-blank"}
                      size={20}
                      color={emailNotifications ? "#059669" : "#64748B"}
                    />
                    <Text style={styles.toggleRowText}>
                      {emailNotifications
                        ? "Receive email notifications for buyer offers and updates"
                        : "Email notifications are turned off"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Theme</Text>
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                    <TouchableOpacity
                      style={[
                        styles.prefSelectBtn,
                        themeMode === "Light" && styles.prefSelectBtnActive,
                      ]}
                      onPress={() => setThemeMode("Light")}
                    >
                      <Text
                        style={[
                          styles.prefSelectText,
                          themeMode === "Light" && styles.prefSelectTextActive,
                        ]}
                      >
                        Light Theme
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.prefSelectBtn,
                        themeMode === "Dark" && styles.prefSelectBtnActive,
                      ]}
                      onPress={() => setThemeMode("Dark")}
                    >
                      <Text
                        style={[
                          styles.prefSelectText,
                          themeMode === "Dark" && styles.prefSelectTextActive,
                        ]}
                      >
                        Dark Theme
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={() => setShowEditPrefModal(false)}
                >
                  <Text style={styles.modalSaveText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ================= SECURITY MANAGE MODAL ================= */}
      {showSecurityModal && (
        <Modal
          visible={showSecurityModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSecurityModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Security & Access</Text>
                <TouchableOpacity onPress={() => setShowSecurityModal(false)}>
                  <MaterialIcons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 12, marginVertical: 14 }}>
                <TouchableOpacity style={styles.secActionItem} activeOpacity={0.7}>
                  <MaterialIcons name="lock-reset" size={22} color="#059669" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.secActionTitle}>Change Account Password</Text>
                    <Text style={styles.secActionSub}>
                      Update your login password regularly for maximum protection.
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.secActionItem} activeOpacity={0.7}>
                  <MaterialIcons name="verified-user" size={22} color="#2563EB" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.secActionTitle}>Setup Two-Factor Authentication</Text>
                    <Text style={styles.secActionSub}>
                      Secure login with OTP confirmation via SMS.
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.secActionItem} activeOpacity={0.7}>
                  <MaterialIcons name="devices" size={22} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.secActionTitle}>Manage Active Sessions</Text>
                    <Text style={styles.secActionSub}>
                      Review signed-in devices and revoke unrecognized sessions.
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={() => setShowSecurityModal(false)}
              >
                <Text style={styles.modalSaveText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ================= SUPPORT MODAL ================= */}
      {showSupportModal && (
        <Modal
          visible={showSupportModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSupportModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Contact MalikSe Support</Text>
                <TouchableOpacity onPress={() => setShowSupportModal(false)}>
                  <MaterialIcons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 13, color: "#475569", lineHeight: 18, marginTop: 4 }}>
                Our Patna-based ground verification and customer relationship team is ready to help you with property documentation, KYC, or general queries.
              </Text>

              <View style={{ gap: 10, marginVertical: 14 }}>
                <View style={styles.secActionItem}>
                  <MaterialIcons name="phone" size={20} color="#059669" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.secActionTitle}>Toll Free Helpline</Text>
                    <Text style={styles.secActionSub}>1800-MALIKSE (9 AM - 7 PM)</Text>
                  </View>
                </View>
                <View style={styles.secActionItem}>
                  <MaterialIcons name="email" size={20} color="#2563EB" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.secActionTitle}>Support Email</Text>
                    <Text style={styles.secActionSub}>support@malikse.com</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={() => setShowSupportModal(false)}
              >
                <Text style={styles.modalSaveText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ================= AVATAR PROMPT MODAL ================= */}
      {showAvatarPrompt && (
        <Modal
          visible={showAvatarPrompt}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAvatarPrompt(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxWidth: 400 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Profile Photo</Text>
                <TouchableOpacity onPress={() => setShowAvatarPrompt(false)}>
                  <MaterialIcons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 13, color: "#475569", marginVertical: 8 }}>
                Upload a verified profile photo or photo ID avatar for trusted landlord status.
              </Text>
              <View style={{ gap: 10, marginTop: 10 }}>
                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={() => setShowAvatarPrompt(false)}
                >
                  <Text style={styles.modalSaveText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { width: "100%", alignItems: "center" }]}
                  onPress={() => setShowAvatarPrompt(false)}
                >
                  <Text style={styles.modalCancelText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    paddingBottom: 48,
  },
  mainLayout: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  mainLayoutDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 24,
  },

  /* ================= LEFT SIDEBAR ================= */
  sidebar: {
    width: 240,
    backgroundColor: "transparent",
  },
  sidebarBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  sidebarBackBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  sidebarMenu: {
    gap: 4,
    marginBottom: 20,
  },
  sidebarNavItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  sidebarNavItemActive: {
    backgroundColor: "#ECFDF5",
  },
  sidebarNavText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  sidebarNavTextActive: {
    color: "#065F46",
    fontWeight: "800",
  },

  /* Sidebar Promo Card */
  sidebarPromoCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    padding: 14,
    overflow: "hidden",
  },
  sidebarPromoHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sidebarPromoTitle: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 17,
  },
  sidebarPromoSub: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 14,
  },
  sidebarPromoArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarPromoImgWrap: {
    width: "100%",
    height: 75,
    borderRadius: 10,
    overflow: "hidden",
  },
  sidebarPromoImg: {
    width: "100%",
    height: "100%",
  },

  /* ================= RIGHT MAIN CONTENT AREA ================= */
  mainContent: {
    flex: 1,
  },

  /* Top Page Header */
  topPageHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pageMainTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 3,
  },
  topHeaderGraphicBox: {
    width: 240,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  topHeaderGraphicImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  topHeaderGraphicOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  topHeaderCursiveWrap: {
    zIndex: 2,
  },
  topHeaderCursiveText: {
    fontFamily: Platform.OS === "web" ? "Kalam, Caveat, cursive" : "System",
    fontSize: 14,
    color: "#065F46",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 17,
    fontWeight: "700",
  },

  /* User Profile Identity Hero Card */
  profileHeroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      } as any,
    }),
  },
  profileHeroLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTxt: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  avatarCameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#065F46",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeroMeta: {
    gap: 4,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userNameText: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  userBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 2,
  },
  adminPill: {
    backgroundColor: "#DCFCE7",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  adminPillText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#059669",
  },
  rolePill: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  userPhoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  userPhoneText: {
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: "600",
  },

  /* Hero Stats Counter */
  profileHeroStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 12,
  },
  heroStatCol: {
    alignItems: "center",
    minWidth: 50,
  },
  heroStatNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  heroStatLabel: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E2E8F0",
  },

  /* Content 2-Column Grid */
  contentGrid: {
    gap: 20,
  },
  contentGridDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  gridLeftCol: {
    flex: 1.55,
    gap: 20,
  },
  gridRightCol: {
    flex: 1,
    gap: 20,
  },

  /* Section Card */
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      } as any,
    }),
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  cardHeaderEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  cardHeaderEditBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },

  /* Table Style Rows */
  tableList: {},
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableLabelCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tableLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  tableValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  verifiedBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#047857",
  },

  /* Role Switcher Card */
  roleCardHeader: {
    marginBottom: 14,
  },
  roleCardSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  roleGridItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  roleGridItemActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#10B981",
  },
  roleGridItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleGridItemText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#334155",
  },
  roleGridItemTextActive: {
    color: "#065F46",
    fontWeight: "800",
  },
  roleCheckedCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Profile Completion Circular Progress */
  progressRingBox: {
    alignItems: "center",
    paddingVertical: 16,
  },
  progressRingWrapper: {
    width: 100,
    height: 100,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  mobileRingFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: "#059669",
  },
  mobileRingTrack: {},
  progressRingCenter: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercentText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  progressHeadingText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
  },
  progressSubText: {
    fontSize: 11.5,
    color: "#64748B",
    textAlign: "center",
    marginTop: 2,
    maxWidth: 240,
  },

  /* Checklist */
  checklist: {
    gap: 10,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkCircleCompleted: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  checkCirclePending: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
  },
  checklistLabel: {
    fontSize: 12.5,
    color: "#334155",
    fontWeight: "600",
  },
  checklistLabelPending: {
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: "500",
  },

  /* Security Rows in Right Column */
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  securityRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  securityRowTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  securityRowSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },

  /* Need Help? Box */
  needHelpCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    padding: 16,
    gap: 12,
  },
  needHelpTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  needHelpIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  needHelpTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  needHelpSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  needHelpActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#059669",
    paddingVertical: 8,
    borderRadius: 9999,
  },
  needHelpActionBtnText: {
    color: "#059669",
    fontSize: 12.5,
    fontWeight: "700",
  },

  /* ================= MODAL STYLES ================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    gap: 14,
    ...Platform.select({
      web: {
        boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
      } as any,
    }),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },
  modalForm: {
    gap: 12,
    marginTop: 6,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  modalTextInput: {
    height: 42,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#0F172A",
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  modalSaveBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#059669",
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  prefSelectBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  prefSelectBtnActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#10B981",
  },
  prefSelectText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  prefSelectTextActive: {
    color: "#065F46",
    fontWeight: "800",
  },
  toggleRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  toggleRowBtnActive: {
    borderColor: "#BBF7D0",
  },
  toggleRowText: {
    fontSize: 12.5,
    color: "#334155",
    flex: 1,
  },
  secActionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  secActionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  secActionSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
});
