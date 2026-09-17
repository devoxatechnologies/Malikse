import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useLanguageStore } from "../src/store/languageStore";
import { t } from "../src/i18n/translations";
import { useAuthStore } from "../src/store/authStore";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguageStore();
  const role = useAuthStore((s) => s.role);

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
    <View style={styles.container}>
      {tabs.map((tab, idx) => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity
            key={idx}
            style={styles.tab}
            onPress={() => router.replace(tab.route as any)}
          >
            {tab.type === "font-awesome" ? (
              <FontAwesome5 name={tab.icon} size={20} color={isActive ? "#2A85FF" : "#999"} />
            ) : (
              <MaterialIcons name={tab.icon as any} size={24} color={isActive ? "#2A85FF" : "#999"} />
            )}
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.name}</Text>
          </TouchableOpacity>
        );
      })}

      {/* Language Toggle Tab */}
      <TouchableOpacity style={styles.tab} onPress={toggleLanguage}>
        <MaterialIcons name="language" size={24} color="#999" />
        <Text style={styles.label}>{language === "en" ? "हिन्दी" : "Eng"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 80 : 64,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 8,
  },
  label: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  activeLabel: {
    color: "#2A85FF",
    fontWeight: "bold",
  },
});
