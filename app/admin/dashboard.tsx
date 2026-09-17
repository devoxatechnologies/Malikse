import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import api from "../../src/services/authService";

const DUMMY_DATA = {
  users: { owners: 142, buyers: 580 },
  properties: { pending: 24, verified: 89 },
  deals: { active: 15 },
  financials: { commissionEarned: "1,24,500" }
};

const DUMMY_ACTIVITY = [
  { id: "1", type: "Approval", title: "Property Verification", desc: "Ramesh Kumar's land in Patna is pending final approval.", time: "2h ago" },
  { id: "2", type: "Deal", title: "New Deal Initiated", desc: "Buyer Suresh offered ₹15L for Plot #42.", time: "5h ago" },
  { id: "3", type: "User", title: "New Advisor Registered", desc: "Amit Singh joined as Advisor.", time: "1d ago" },
];

export default function AdminDashboardScreen() {
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

  if (!data) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.profileBtn}>
          <FontAwesome5 name="user-circle" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <FontAwesome5 name="user-tie" size={20} color="#2A85FF" style={styles.cardIcon} />
            <Text style={styles.val}>{data.users.owners}</Text>
            <Text style={styles.label}>Owners</Text>
          </View>
          <View style={styles.card}>
            <FontAwesome5 name="users" size={20} color="#0F5132" style={styles.cardIcon} />
            <Text style={styles.val}>{data.users.buyers}</Text>
            <Text style={styles.label}>Buyers</Text>
          </View>
          <View style={styles.card}>
            <FontAwesome5 name="clock" size={20} color="#FF9800" style={styles.cardIcon} />
            <Text style={styles.val}>{data.properties.pending}</Text>
            <Text style={styles.label}>Pending</Text>
          </View>
          <View style={styles.card}>
            <FontAwesome5 name="check-circle" size={20} color="#4CAF50" style={styles.cardIcon} />
            <Text style={styles.val}>{data.properties.verified}</Text>
            <Text style={styles.label}>Verified</Text>
          </View>
          <View style={[styles.card, styles.wideCard]}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#673AB7" style={styles.cardIcon} />
            <Text style={styles.val}>₹{data.financials.commissionEarned}</Text>
            <Text style={styles.label}>Total Commission Earned</Text>
          </View>
        </View>
      </View>

      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {DUMMY_ACTIVITY.map(act => (
          <View key={act.id} style={styles.activityCard}>
            <View style={styles.activityIconWrap}>
              <FontAwesome5 name={act.type === "Approval" ? "file-signature" : act.type === "Deal" ? "handshake" : "user-plus"} size={16} color="#2A85FF" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{act.title}</Text>
              <Text style={styles.activityDesc}>{act.desc}</Text>
            </View>
            <Text style={styles.activityTime}>{act.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  header: { 
    padding: 24, 
    paddingTop: 60, 
    backgroundColor: "#1A237E", 
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: "#FFF" },
  profileBtn: { padding: 8 },
  overviewSection: { padding: 16, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 16, marginLeft: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { 
    width: "48%", 
    backgroundColor: "#FFF", 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 16, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative"
  },
  wideCard: { width: "100%", alignItems: "center" },
  cardIcon: { position: "absolute", top: 16, right: 16, opacity: 0.2 },
  val: { fontSize: 28, fontWeight: "bold", color: "#222", marginBottom: 4 },
  label: { fontSize: 13, color: "#777", fontWeight: "600" },
  activitySection: { padding: 16 },
  activityCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  activityIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center", marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: "bold", color: "#333" },
  activityDesc: { fontSize: 13, color: "#666", marginTop: 2 },
  activityTime: { fontSize: 12, color: "#AAA" }
});
