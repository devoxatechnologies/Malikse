import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useLanguageStore } from "../src/store/languageStore";
import { t } from "../src/i18n/translations";
import { useAuthStore } from "../src/store/authStore";
import { AppTheme } from "../constants/theme";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguageStore();
  const role = useAuthStore((s) => s.role);
  const authState = useAuthStore((s) => s.authState);

  // Define tabs based on role
  const tabs = [
    { name: t(language, "nav_search"), route: "/search", icon: "search", type: "font-awesome" },
    role === "owner"
      ? { name: t(language, "nav_my_properties"), route: "/my-properties", icon: "home", type: "font-awesome" }
      : { name: t(language, "nav_saved"), route: "/saved", icon: "heart", type: "font-awesome" },
    { name: t(language, "nav_messages"), route: "/messages", icon: "comment-alt", type: "font-awesome" },
    { name: t(language, "nav_profile"), route: "/profile", icon: "user", type: "font-awesome" },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {tabs.map((tab, idx) => {
          const isActive = pathname === tab.route;
          return (
            <TouchableOpacity
              key={idx}
              style={styles.tab}
              onPress={() => router.replace(tab.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                {tab.type === "font-awesome" ? (
                  <FontAwesome5
                    name={tab.icon}
                    size={18}
                    color={isActive ? AppTheme.colors.primary : AppTheme.colors.textMuted}
                  />
                ) : (
                  <MaterialIcons
                    name={tab.icon as any}
                    size={22}
                    color={isActive ? AppTheme.colors.primary : AppTheme.colors.textMuted}
                  />
                )}
              </View>
              <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.name}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Quick Post Property CTA if owner */}
        {role === "owner" && (
          <TouchableOpacity
            style={styles.tab}
            onPress={() => router.push("/listing/create")}
            activeOpacity={0.7}
          >
            <View style={styles.postBtn}>
              <MaterialIcons name="add" size={20} color={AppTheme.colors.white} />
            </View>
            <Text style={[styles.label, { color: AppTheme.colors.primaryDark, fontWeight: "700" }]}>
              + Post
            </Text>
          </TouchableOpacity>
        )}

        {/* Language Toggle Tab */}
        <TouchableOpacity style={styles.tab} onPress={toggleLanguage} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="translate" size={20} color={AppTheme.colors.textMuted} />
          </View>
          <Text style={styles.label}>{language === "en" ? "हिन्दी" : "Eng"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: AppTheme.colors.white,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
    ...AppTheme.shadows.card,
  },
  container: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 82 : 66,
    paddingBottom: Platform.OS === "ios" ? 18 : 6,
    paddingTop: 6,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
  },
  iconContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconContainer: {
    backgroundColor: AppTheme.colors.primaryLight,
  },
  label: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
    fontWeight: "500",
  },
  activeLabel: {
    color: AppTheme.colors.primaryDark,
    fontWeight: "700",
  },
  postBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
