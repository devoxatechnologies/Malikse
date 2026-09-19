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
  showBack = true,
  onBackPress,
  fallbackRoute = "/search",
  rightElement,
  showLanguageToggle = false,
  showHomeButton = false,
  showNavLinks = true,
  showPostPropertyBtn = true,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { language, toggleLanguage } = useLanguageStore();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute as any);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Left Section: Back Button or Brand Logo */}
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
                <FontAwesome5 name="shield-alt" size={16} color="#FFFFFF" />
              </View>
              <View>
                <View style={styles.brandNameRow}>
                  <Text style={styles.brandName}>
                    Malik<Text style={styles.brandAccent}>Se</Text>
                  </Text>
                  <View style={styles.directBadge}>
                    <MaterialIcons name="verified" size={11} color="#059669" />
                    <Text style={styles.directBadgeText}>100% DIRECT</Text>
                  </View>
                </View>
                <Text style={styles.brandTagline}>Zero Brokers • Verified Land</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Section: Desktop Nav Links OR Page Title */}
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
            <TouchableOpacity
              style={[styles.navLink, pathname === "/search" && styles.navLinkActive]}
              onPress={() => router.replace("/search")}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="explore"
                size={16}
                color={pathname === "/search" ? "#059669" : "#64748B"}
              />
              <Text style={[styles.navLinkText, pathname === "/search" && styles.navLinkTextActive]}>
                Explore Plots
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navLink, pathname === "/my-properties" && styles.navLinkActive]}
              onPress={() => router.push("/my-properties")}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="terrain"
                size={16}
                color={pathname === "/my-properties" ? "#059669" : "#64748B"}
              />
              <Text style={[styles.navLinkText, pathname === "/my-properties" && styles.navLinkTextActive]}>
                My Land Listings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navLink, pathname === "/saved" && styles.navLinkActive]}
              onPress={() => router.push("/saved")}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="favorite-border"
                size={16}
                color={pathname === "/saved" ? "#059669" : "#64748B"}
              />
              <Text style={[styles.navLinkText, pathname === "/saved" && styles.navLinkTextActive]}>
                Saved
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Right Section: Post Land CTA, Custom Actions, Home, or Language Toggle */}
        <View style={styles.rightSection}>
          {/* Post Property Free CTA Button on Web */}
          {showPostPropertyBtn && isDesktop && (
            <TouchableOpacity
              style={styles.postPropertyBtn}
              onPress={() => {
                const { authState, user } = useAuthStore.getState();
                if (authState !== "AUTHENTICATED" || !user) {
                  router.push("/login");
                } else {
                  router.push("/listing/create");
                }
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add-circle" size={16} color="#FFFFFF" />
              <Text style={styles.postPropertyBtnText}>+ Post Land (Free)</Text>
            </TouchableOpacity>
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

          {showLanguageToggle && (
            <TouchableOpacity
              style={styles.langBtn}
              onPress={toggleLanguage}
              activeOpacity={0.7}
            >
              <MaterialIcons name="translate" size={15} color="#059669" />
              <Text style={styles.langText}>{language === "en" ? "हिन्दी" : "EN"}</Text>
            </TouchableOpacity>
          )}

          {rightElement}
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
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  brandNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandName: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: "#059669",
  },
  directBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  directBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#065F46",
    letterSpacing: 0.3,
  },
  brandTagline: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
    marginTop: -1,
  },

  /* Center Nav Links (Desktop) */
  navLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  navLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 7,
  },
  navLinkActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  navLinkText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  navLinkTextActive: {
    color: "#059669",
    fontWeight: "700",
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
    gap: 10,
  },
  postPropertyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  postPropertyBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
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
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 5,
  },
  langText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#065F46",
  },
});
