import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { authService } from "../../src/services/authService";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";
import { UserRole } from "../../src/types/auth.types";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import { AppTheme } from "../../constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const authStore = useAuthStore();
  const { user } = authStore;

  const handleLogout = () => {
    authService.logout();
    authStore.clearSession();
    authStore.setAuthState("NOT_AUTHENTICATED");
    router.replace("/login");
  };

  const switchRole = (newRole: UserRole) => {
    authStore.setTokens({ accessToken: "dummy_access", refreshToken: "dummy_refresh" });
    authStore.setUser({ 
      id: user?.id || "demo_id", 
      role: newRole, 
      name: user?.name || `Dev ${newRole}`, 
      mobile: user?.mobile || "9999999999", 
      isVerifiedIdentity: true, 
      createdAt: new Date().toISOString() 
    });
    authStore.setAuthState("AUTHENTICATED");

    if (newRole === "owner") router.replace("/my-properties");
    else if (newRole === "buyer") router.replace("/search");
    else if (newRole === "advisor") router.replace("/advisor/tasks");
    else if (newRole === "admin") router.replace("/admin/dashboard");
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Account & Profile"
        showBack={true}
        fallbackRoute="/search"
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {user ? (
            <>
              {/* User Avatar Card */}
              <View style={styles.profileCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTxt}>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</Text>
                </View>
                <Text style={styles.name}>{user.name || "User"}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeTxt}>{user.role.toUpperCase()}</Text>
                </View>
                <Text style={styles.mobileTxt}>{user.mobile}</Text>
              </View>

              {/* Account Details Section */}
              <View style={styles.card}>
                <Text style={styles.cardHeader}>Account Information</Text>

                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <MaterialIcons name="phone" size={18} color={AppTheme.colors.textMuted} />
                    <Text style={styles.infoLabel}>Registered Mobile</Text>
                  </View>
                  <Text style={styles.infoVal}>{user.mobile}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <MaterialIcons name="verified" size={18} color={user.isVerifiedIdentity ? AppTheme.colors.success : AppTheme.colors.textMuted} />
                    <Text style={styles.infoLabel}>Identity Verification</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: user.isVerifiedIdentity ? AppTheme.colors.successBg : AppTheme.colors.warningBg }]}>
                    <Text style={[styles.statusPillTxt, { color: user.isVerifiedIdentity ? AppTheme.colors.primaryDark : AppTheme.colors.warning }]}>
                      {user.isVerifiedIdentity ? "Verified" : "Pending KYC"}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <MaterialIcons name="shield" size={18} color={AppTheme.colors.accent} />
                    <Text style={styles.infoLabel}>Current Portal</Text>
                  </View>
                  <Text style={styles.infoVal}>
                    {user.role === "owner" ? "Owner Marketplace" : user.role === "buyer" ? "Buyer Portal" : user.role === "advisor" ? "Field Advisor" : "Super Admin"}
                  </Text>
                </View>
              </View>

              {/* Role Switcher for Testing */}
              <View style={styles.card}>
                <Text style={styles.cardHeader}>Switch User Role Portal</Text>
                <Text style={styles.cardSub}>Easily preview buyer, owner, advisor, or admin views</Text>

                <View style={styles.roleGrid}>
                  <TouchableOpacity
                    style={[styles.roleSelectBtn, user.role === "buyer" && styles.roleSelectBtnActive]}
                    onPress={() => switchRole("buyer")}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="search" size={18} color={user.role === "buyer" ? AppTheme.colors.primary : AppTheme.colors.textSecondary} />
                    <Text style={[styles.roleSelectTxt, user.role === "buyer" && styles.roleSelectTxtActive]}>Buyer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleSelectBtn, user.role === "owner" && styles.roleSelectBtnActive]}
                    onPress={() => switchRole("owner")}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="home-work" size={18} color={user.role === "owner" ? AppTheme.colors.primary : AppTheme.colors.textSecondary} />
                    <Text style={[styles.roleSelectTxt, user.role === "owner" && styles.roleSelectTxtActive]}>Owner</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleSelectBtn, user.role === "advisor" && styles.roleSelectBtnActive]}
                    onPress={() => switchRole("advisor")}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="verified-user" size={18} color={user.role === "advisor" ? AppTheme.colors.primary : AppTheme.colors.textSecondary} />
                    <Text style={[styles.roleSelectTxt, user.role === "advisor" && styles.roleSelectTxtActive]}>Advisor</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleSelectBtn, user.role === "admin" && styles.roleSelectBtnActive]}
                    onPress={() => switchRole("admin")}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="admin-panel-settings" size={18} color={user.role === "admin" ? AppTheme.colors.primary : AppTheme.colors.textSecondary} />
                    <Text style={[styles.roleSelectTxt, user.role === "admin" && styles.roleSelectTxtActive]}>Admin</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Logout Button */}
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                <MaterialIcons name="logout" size={20} color={AppTheme.colors.danger} />
                <Text style={styles.logoutTxt}>{t(language, "auth_logout")}</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Guest Profile State */
            <View style={styles.guestCard}>
              <View style={styles.guestIconBox}>
                <MaterialIcons name="account-circle" size={56} color={AppTheme.colors.textMuted} />
              </View>
              <Text style={styles.guestTitle}>Welcome to MalikSe</Text>
              <Text style={styles.guestSubtitle}>
                Sign in to view verified owner contact info, list properties, track legal verification, and send offers.
              </Text>

              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => router.push("/login")}
                activeOpacity={0.8}
              >
                <MaterialIcons name="login" size={18} color={AppTheme.colors.white} />
                <Text style={styles.signInBtnText}>Sign In / Register</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => router.replace("/search")}
                activeOpacity={0.7}
              >
                <Text style={styles.exploreBtnText}>Browse Listings as Guest</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  container: { maxWidth: 640, width: "100%", alignSelf: "center" },
  profileCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.xl,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    ...AppTheme.shadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    ...AppTheme.shadows.soft,
  },
  avatarTxt: { fontSize: 28, color: AppTheme.colors.white, fontWeight: "900" },
  name: { fontSize: 22, fontWeight: "800", color: AppTheme.colors.text, marginBottom: 4 },
  roleBadge: {
    backgroundColor: AppTheme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.full,
    marginBottom: 6,
  },
  roleBadgeTxt: { fontSize: 11, fontWeight: "800", color: AppTheme.colors.primaryDark },
  mobileTxt: { fontSize: 13, color: AppTheme.colors.textMuted },
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    ...AppTheme.shadows.card,
  },
  cardHeader: { fontSize: 15, fontWeight: "700", color: AppTheme.colors.text, marginBottom: 4 },
  cardSub: { fontSize: 12, color: AppTheme.colors.textMuted, marginBottom: 14 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { fontSize: 14, color: AppTheme.colors.textSecondary },
  infoVal: { fontSize: 14, fontWeight: "600", color: AppTheme.colors.text },
  divider: { height: 1, backgroundColor: AppTheme.colors.divider },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.full,
  },
  statusPillTxt: { fontSize: 11, fontWeight: "700" },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  roleSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  roleSelectBtnActive: {
    backgroundColor: AppTheme.colors.primaryLight,
    borderColor: AppTheme.colors.primary,
  },
  roleSelectTxt: { fontSize: 13, fontWeight: "600", color: AppTheme.colors.textSecondary },
  roleSelectTxtActive: { color: AppTheme.colors.primaryDark, fontWeight: "700" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppTheme.colors.card,
    paddingVertical: 14,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.danger,
    marginTop: 8,
  },
  logoutTxt: { color: AppTheme.colors.danger, fontSize: 15, fontWeight: "700" },
  guestCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.xl,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    ...AppTheme.shadows.card,
  },
  guestIconBox: { marginBottom: 12 },
  guestTitle: { fontSize: 22, fontWeight: "800", color: AppTheme.colors.text },
  guestSubtitle: { fontSize: 13, color: AppTheme.colors.textMuted, textAlign: "center", marginVertical: 10, maxWidth: 360 },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: AppTheme.radius.md,
    marginTop: 12,
  },
  signInBtnText: { color: AppTheme.colors.white, fontWeight: "700", fontSize: 15 },
  exploreBtn: { marginTop: 14, padding: 8 },
  exploreBtnText: { color: AppTheme.colors.primary, fontWeight: "600", fontSize: 14 },
});
