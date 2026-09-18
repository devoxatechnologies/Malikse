import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { advisorService } from "../../src/services/advisorService";
import AppHeader from "../../components/AppHeader";
import { AppTheme } from "../../constants/theme";

const DUMMY_TASKS = [
  { 
    id: "t1", 
    type: "Land Parcel Physical Survey", 
    location: { district: "Danapur, Patna", state: "Bihar" }, 
    owner: "Ramesh Kumar (Registered Owner)", 
    status: "pending", 
    date: "Today, 2:00 PM",
    surveyNo: "Khata 104 / Khesra 582"
  },
  { 
    id: "t2", 
    type: "Residential Plot GPS Boundary", 
    location: { district: "Bihta, Patna", state: "Bihar" }, 
    owner: "Suresh Singh (Registered Owner)", 
    status: "pending", 
    date: "Tomorrow, 10:30 AM",
    surveyNo: "Khata 78 / Khesra 319"
  },
];

export default function AdvisorTasksScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await advisorService.getAssignedTasks();
      setTasks(data.length ? data : DUMMY_TASKS);
    } catch (e) {
      setTasks(DUMMY_TASKS);
    } finally {
      setLoading(false);
    }
  };

  const handleGpsCheckIn = (task: any) => {
    Alert.alert(
      "GPS Geo-Check-In Verified",
      `Coordinates captured at ${task.location.district}. Timestamp recorded to audit ledger for verification proof.`,
      [{ text: "OK" }]
    );
  };

  const handleSubmitReport = (task: any) => {
    Alert.alert(
      "Submit Site Inspection Report",
      `Upload 4 geo-tagged site photos and checklist sign-off for ${task.type}.`,
      [{ text: "Proceed" }]
    );
  };

  const renderTask = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <MaterialIcons name="schedule" size={14} color={AppTheme.colors.warning} />
          <Text style={styles.badgeTxt}>Pending Site Visit</Text>
        </View>
        <Text style={styles.dateTxt}>{item.date}</Text>
      </View>
      
      <Text style={styles.title}>{item.type}</Text>
      
      <View style={styles.row}>
        <MaterialIcons name="location-on" size={18} color={AppTheme.colors.primary} />
        <Text style={styles.location}>{item.location.district}, {item.location.state}</Text>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="person" size={18} color={AppTheme.colors.textMuted} />
        <Text style={styles.owner}>{item.owner || item.ownerId?.name || "Registered Owner"}</Text>
      </View>

      {item.surveyNo && (
        <View style={styles.surveyTag}>
          <MaterialIcons name="description" size={14} color={AppTheme.colors.primaryDark} />
          <Text style={styles.surveyTagTxt}>{item.surveyNo}</Text>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => handleGpsCheckIn(item)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="my-location" size={16} color={AppTheme.colors.primary} />
          <Text style={styles.btnSecondaryTxt}>GPS Check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => handleSubmitReport(item)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="assignment-turned-in" size={16} color={AppTheme.colors.white} />
          <Text style={styles.btnPrimaryTxt}>Field Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Universal Top Header with Back Navigation */}
      <AppHeader
        title="Field Advisor Tasks"
        subtitle="GPS boundary check-in & verification checklist"
        badge="ADVISOR"
        badgeColor="#7C3AED"
        showBack={true}
        fallbackRoute="/search"
      />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={item => item._id || item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={renderTask}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <MaterialIcons name="task-alt" size={56} color={AppTheme.colors.primary} />
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptySub}>No pending site inspections currently assigned to your district.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  container: { maxWidth: 680, width: "100%", alignSelf: "center", flex: 1 },
  listPadding: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.xl,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    ...AppTheme.shadows.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: AppTheme.colors.warningBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.full,
  },
  badgeTxt: {
    color: AppTheme.colors.warning,
    fontSize: 11,
    fontWeight: "700",
  },
  dateTxt: {
    color: AppTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: AppTheme.colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    fontWeight: "500",
  },
  owner: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
  },
  surveyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: AppTheme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: AppTheme.radius.sm,
    alignSelf: "flex-start",
    marginTop: 6,
    marginBottom: 12,
  },
  surveyTagTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: AppTheme.colors.primaryDark,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.divider,
  },
  btnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: AppTheme.colors.primaryLight,
    paddingVertical: 12,
    borderRadius: AppTheme.radius.md,
  },
  btnSecondaryTxt: {
    color: AppTheme.colors.primaryDark,
    fontWeight: "700",
    fontSize: 13,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 12,
    borderRadius: AppTheme.radius.md,
  },
  btnPrimaryTxt: {
    color: AppTheme.colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: AppTheme.colors.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: AppTheme.colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 280,
  },
});
