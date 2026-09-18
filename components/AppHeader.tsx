import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { AppTheme } from "../constants/theme";
import { useLanguageStore } from "../src/store/languageStore";

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
}: AppHeaderProps) {
  const router = useRouter();
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
              <MaterialIcons name="arrow-back" size={22} color={AppTheme.colors.text} />
              {Platform.OS === "web" && <Text style={styles.backText}>Back</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.brandRow}
              onPress={() => router.replace("/search")}
              activeOpacity={0.8}
            >
              <View style={styles.logoIcon}>
                <FontAwesome5 name="shield-alt" size={16} color={AppTheme.colors.white} />
              </View>
              <Text style={styles.brandName}>Malik<Text style={styles.brandAccent}>Se</Text></Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Section: Title & Subtitle */}
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
        ) : null}

        {/* Right Section: Custom Actions, Home, or Language Toggle */}
        <View style={styles.rightSection}>
          {showHomeButton && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.replace("/search")}
              activeOpacity={0.7}
            >
              <MaterialIcons name="home" size={22} color={AppTheme.colors.textSecondary} />
            </TouchableOpacity>
          )}

          {showLanguageToggle && (
            <TouchableOpacity
              style={styles.langBtn}
              onPress={toggleLanguage}
              activeOpacity={0.7}
            >
              <MaterialIcons name="translate" size={16} color={AppTheme.colors.primary} />
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
    backgroundColor: AppTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
    paddingTop: Platform.OS === "web" ? 10 : Platform.OS === "ios" ? 48 : 12,
    paddingBottom: 10,
    zIndex: 100,
    ...AppTheme.shadows.soft,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 70,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.divider,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: AppTheme.radius.full,
  },
  backText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppTheme.colors.text,
    marginLeft: 4,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: AppTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "800",
    color: AppTheme.colors.text,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: AppTheme.colors.primary,
  },
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
    color: AppTheme.colors.text,
    textAlign: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: AppTheme.radius.full,
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
    color: AppTheme.colors.textMuted,
    marginTop: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 70,
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppTheme.colors.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
    gap: 4,
  },
  langText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppTheme.colors.primaryDark,
  },
});
