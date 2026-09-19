import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { AppTheme } from "../constants/theme";
import { useLanguageStore } from "../src/store/languageStore";
import { useAuthStore } from "../src/store/authStore";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  fallbackRoute?: string;
  rightElement?: React.ReactNode;
  showLanguageToggle?: boolean;
  showHomeButton?: boolean;
  showNavLinks?: boolean;
  showPostPropertyBtn?: boolean;
}

export default function AppHeader({
  title,
  subtitle,
  badge,
  badgeColor = AppTheme.colors.primary,
  showBack = false,
  onBackPress,
  fallbackRoute = "/search",
  rightElement,
  showLanguageToggle = true,
  showHomeButton = false,
  showNavLinks = true,
  showPostPropertyBtn = true,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { language, toggleLanguage } = useLanguageStore();
  const { user, authState } = useAuthStore();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute as any);
    }
  };

  const displayName = user?.name || "Nikhil kumar";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Left Section: Brand Logo or Back Button */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
            >
              <MaterialIcons name="arrow-back" size={20} color="#1E293B" />
              {Platform.OS === "web" && <Text style={styles.backText}>Back</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.brandRow}
              onPress={() => router.replace("/search")}
              activeOpacity={0.8}
            >
              <View style={styles.logoIcon}>
                <FontAwesome5 name="shield-alt" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.brandTextCol}>
                <Text style={styles.brandName}>MalikSe</Text>
                <Text style={styles.brandTagline}>Your Land. A Safer Future.</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Section: Desktop Nav Links OR Title */}
        {title ? (
          <View style={styles.centerSection}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {badge && (
                <View style={[styles.badge, { backgroundColor: `${badgeColor}15`, borderColor: badgeColor }]}>
                  <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
                </View>
              )}
            </View>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : isDesktop && showNavLinks ? (
          <View style={styles.navLinksRow}>
            {/* Explore Plots (Active with bold bottom underline) */}
            <TouchableOpacity
              style={[styles.navLink, pathname === "/search" && styles.navLinkActive]}
              onPress={() => router.replace("/search")}
              activeOpacity={0.8}
            >
              <Text style={[styles.navLinkText, pathname === "/search" && styles.navLinkTextActive]}>
                Explore Plots
              </Text>
              {pathname === "/search" && <View style={styles.activeIndicator} />}
            </TouchableOpacity>

            {/* My Listings */}
            <TouchableOpacity
              style={[styles.navLink, pathname === "/my-properties" && styles.navLinkActive]}
              onPress={() => router.push("/my-properties")}
              activeOpacity={0.8}
            >
              <Text style={[styles.navLinkText, pathname === "/my-properties" && styles.navLinkTextActive]}>
                My Listings
              </Text>
              {pathname === "/my-properties" && <View style={styles.activeIndicator} />}
            </TouchableOpacity>

            {/* Saved */}
            <TouchableOpacity
              style={[styles.navLink, pathname === "/saved" && styles.navLinkActive]}
              onPress={() => router.push("/saved")}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="favorite-border"
                size={16}
                color={pathname === "/saved" ? "#0B4D3C" : "#475569"}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.navLinkText, pathname === "/saved" && styles.navLinkTextActive]}>
                Saved
              </Text>
              {pathname === "/saved" && <View style={styles.activeIndicator} />}
            </TouchableOpacity>

            {/* Insights */}
            <TouchableOpacity
              style={[styles.navLink, pathname === "/insights" && styles.navLinkActive]}
              onPress={() => router.push("/search")}
              activeOpacity={0.8}
            >
              <Text style={[styles.navLinkText, pathname === "/insights" && styles.navLinkTextActive]}>
                Insights
              </Text>
              {pathname === "/insights" && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Right Section: Post Land (Free), Language Pill, User Profile Pill */}
        <View style={styles.rightSection}>
          {rightElement ? (
            rightElement
          ) : (
            <>
              {/* + Post Land (Free) Button */}
              {showPostPropertyBtn && isDesktop && (
                <TouchableOpacity
                  style={styles.postPropertyBtn}
                  onPress={() => {
                    if (authState !== "AUTHENTICATED" || !user) {
                      router.push("/login");
                    } else {
                      router.push("/listing/create");
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="add" size={17} color="#FFFFFF" />
                  <Text style={styles.postPropertyBtnText}>Post Land (Free)</Text>
                </TouchableOpacity>
              )}

              {/* Language Pill (e.g. "文A हिंदी") */}
              {showLanguageToggle && (
                <TouchableOpacity
                  style={styles.langBtn}
                  onPress={toggleLanguage}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="translate" size={15} color="#065F46" />
                  <Text style={styles.langText}>{language === "en" ? "हिंदी" : "EN"}</Text>
                </TouchableOpacity>
              )}

              {/* User Profile Pill ("N Nikhil kumar ⌵") */}
              <TouchableOpacity
                style={styles.userProfilePill}
                onPress={() => {
                  if (authState !== "AUTHENTICATED") {
                    router.push("/login");
                  } else {
                    router.push("/profile");
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.userAvatarCircle}>
                  <Text style={styles.userAvatarText}>{avatarLetter}</Text>
                </View>
                {isDesktop && (
                  <>
                    <Text style={styles.userProfileName} numberOfLines={1}>
                      {displayName}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={18} color="#64748B" />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {showHomeButton && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.replace("/search")}
              activeOpacity={0.7}
            >
              <MaterialIcons name="home" size={20} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingTop: Platform.OS === "web" ? 10 : Platform.OS === "ios" ? 48 : 12,
    paddingBottom: 10,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    maxWidth: 1300,
    width: "100%",
    alignSelf: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 4,
  },
  backText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  /* Left Brand */
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  brandTextCol: {
    justifyContent: "center",
  },
  brandName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 10.5,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 1,
  },

  /* Center Nav Links (Desktop) */
  navLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 28,
  },
  navLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    position: "relative",
  },
  navLinkActive: {
    backgroundColor: "transparent",
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  navLinkTextActive: {
    color: "#0B4D3C",
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#0B4D3C",
    borderRadius: 2,
  },

  /* Center Title */
  centerSection: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },

  /* Right Section */
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  postPropertyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0B4D3C",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#0B4D3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  postPropertyBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 5,
  },
  langText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#065F46",
  },
  userProfilePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  userAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0B4D3C",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
  },
  userProfileName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    maxWidth: 130,
  },
});
