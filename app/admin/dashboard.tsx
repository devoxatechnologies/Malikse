import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import api from "../../src/services/authService";
import AppHeader from "../../components/AppHeader";
import { AppTheme } from "../../constants/theme";

const DUMMY_DATA = {
  users: { owners: 142, buyers: 580 },
  properties: { pending: 24, verified: 89 },
  deals: { active: 15 },
  financials: { commissionEarned: "1,24,500" }
};

const DUMMY_ACTIVITY = [
  { id: "1", type: "Approval", title: "Property Verification", desc: "Ramesh Kumar's land in Patna is pending final lawyer approval.", time: "2h ago" },
  { id: "2", type: "Deal", title: "New Deal Initiated", desc: "Buyer Suresh offered ₹15L for Plot #42 (Bihta).", time: "5h ago" },
  { id: "3", type: "User", title: "New Advisor Registered", desc: "Amit Singh joined as Field Advisor.", time: "1d ago" },
];

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/admin/dashboard/summary");
      setData(res.data || DUMMY_DATA);
    } catch (e) {
      setData(DUMMY_DATA);
    }
  };

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Top Header with Back Navigation */}
      <AppHeader
        title="Admin Control Center"
        subtitle="Verification approvals & marketplace audit"
        badge="SUPER ADMIN"
        badgeColor={AppTheme.colors.danger}
        showBack={true}
        fallbackRoute="/search"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Overview KPI Cards */}
          <Text style={styles.sectionHeading}>Platform Overview</Text>
          <View style={styles.grid}>
            <View style={styles.kpiCard}>
              <View style={[styles.iconCircle, { backgroundColor: AppTheme.colors.primaryLight }]}>
                <FontAwesome5 name="user-tie" size={18} color={AppTheme.colors.primaryDark} />
              </View>
              <Text style={styles.kpiVal}>{data.users.owners}</Text>
              <Text style={styles.kpiLabel}>Registered Owners</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={[styles.iconCircle, { backgroundColor: AppTheme.colors.accentLight }]}>
                <FontAwesome5 name="users" size={18} color={AppTheme.colors.accent} />
              </View>
              <Text style={styles.kpiVal}>{data.users.buyers}</Text>
              <Text style={styles.kpiLabel}>Active Buyers</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={[styles.iconCircle, { backgroundColor: AppTheme.colors.warningBg }]}>
                <MaterialIcons name="hourglass-top" size={20} color={AppTheme.colors.warning} />
              </View>
              <Text style={styles.kpiVal}>{data.properties.pending}</Text>
              <Text style={styles.kpiLabel}>Pending Audit</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={[styles.iconCircle, { backgroundColor: AppTheme.colors.successBg }]}>
                <MaterialIcons name="verified" size={20} color={AppTheme.colors.primary} />
              </View>
              <Text style={styles.kpiVal}>{data.properties.verified}</Text>
              <Text style={styles.kpiLabel}>Verified Live</Text>
            </View>

            <View style={[styles.kpiCard, styles.wideCard]}>
              <View style={[styles.iconCircle, { backgroundColor: "#F3E8FF" }]}>
                <MaterialIcons name="account-balance-wallet" size={24} color="#7C3AED" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.kpiLabel}>Commission Escrow Earned</Text>
                <Text style={[styles.kpiVal, { color: AppTheme.colors.primaryDark }]}>
                  ₹{data.financials.commissionEarned}
                </Text>
              </View>
            </View>
          </View>

          {/* Activity Log */}
          <Text style={styles.sectionHeading}>Audit Activity Stream</Text>
          <View style={styles.activityCard}>
            {DUMMY_ACTIVITY.map((act, idx) => (
              <View key={act.id}>
                <View style={styles.activityItem}>
                  <View style={styles.activityIconWrap}>
                    <FontAwesome5
                      name={act.type === "Approval" ? "file-signature" : act.type === "Deal" ? "handshake" : "user-plus"}
                      size={14}
                      color={AppTheme.colors.primary}
                    />
                  </View>
                  <View style={styles.activityBody}>
                    <Text style={styles.activityTitle}>{act.title}</Text>
                    <Text style={styles.activityDesc}>{act.desc}</Text>
                  </View>
                  <Text style={styles.activityTime}>{act.time}</Text>
                </View>
                {idx < DUMMY_ACTIVITY.length - 1 && <View style={styles.activityDivider} />}
              </View>
            ))}
          </View>

          {/* Quick Action Navigation */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push("/search")}
              activeOpacity={0.8}
            >
              <MaterialIcons name="storefront" size={18} color={AppTheme.colors.white} />
              <Text style={styles.actionBtnTxt}>Return to Marketplace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: AppTheme.colors.divider }]}
              onPress={() => router.push("/profile")}
              activeOpacity={0.8}
            >
              <MaterialIcons name="switch-account" size={18} color={AppTheme.colors.text} />
              <Text style={[styles.actionBtnTxt, { color: AppTheme.colors.text }]}>Switch Role</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  container: { maxWidth: 780, width: "100%", alignSelf: "center" },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: AppTheme.colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.lg,
    padding: 16,
    width: "48%",
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    ...AppTheme.shadows.card,
  },
  wideCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: "800",
    color: AppTheme.colors.text,
  },
  kpiLabel: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    marginBottom: 20,
    ...AppTheme.shadows.card,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    gap: 12,
  },
  activityIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppTheme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: AppTheme.colors.text,
  },
  activityDesc: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
  },
  activityDivider: {
    height: 1,
    backgroundColor: AppTheme.colors.divider,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: AppTheme.radius.md,
    ...AppTheme.shadows.soft,
  },
  actionBtnTxt: {
    color: AppTheme.colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
