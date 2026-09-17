import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { advisorService } from "../../src/services/advisorService";

const DUMMY_TASKS = [
  { id: "t1", type: "Land Verification", location: { district: "Patna", state: "Bihar" }, owner: "Ramesh Kumar", status: "pending", date: "Today, 2:00 PM" },
  { id: "t2", type: "Flat Inspection", location: { district: "Ranchi", state: "Jharkhand" }, owner: "Suresh Singh", status: "pending", date: "Tomorrow, 10:00 AM" },
];

export default function AdvisorTasksScreen() {
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

  const renderTask = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>Pending</Text>
        </View>
        <Text style={styles.dateTxt}>{item.date}</Text>
      </View>
      
      <Text style={styles.title}>{item.type}</Text>
      <View style={styles.row}>
        <MaterialIcons name="location-on" size={16} color="#666" />
        <Text style={styles.location}>{item.location.district}, {item.location.state}</Text>
      </View>
      <View style={styles.row}>
        <FontAwesome5 name="user" size={14} color="#666" style={{ marginLeft: 2, marginRight: 2 }} />
        <Text style={styles.owner}>Owner: {item.owner || item.ownerId?.name}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.btnSecondary}>
          <FontAwesome5 name="map-marker-alt" size={14} color="#2A85FF" />
          <Text style={styles.btnSecondaryTxt}> GPS Check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary}>
          <FontAwesome5 name="file-alt" size={14} color="#FFF" />
          <Text style={styles.btnPrimaryTxt}> Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Field Tasks</Text>
        <Text style={styles.headerSub}>You have {tasks.length} pending verifications.</Text>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={item => item._id || item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderTask}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
             <FontAwesome5 name="check-circle" size={48} color="#CCC" />
             <Text style={styles.emptyTxt}>All caught up!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  header: { padding: 24, paddingTop: 60, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#EAEAEA" },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#111" },
  headerSub: { fontSize: 14, color: "#666", marginTop: 4 },
  card: { backgroundColor: "#FFF", padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  badge: { backgroundColor: "#FFF4E5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeTxt: { color: "#FF9800", fontSize: 12, fontWeight: "bold" },
  dateTxt: { color: "#888", fontSize: 12, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "bold", color: "#222", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  location: { fontSize: 14, color: "#555", marginLeft: 6 },
  owner: { fontSize: 14, color: "#555", marginLeft: 6 },
  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  btnSecondary: { flex: 1, backgroundColor: "#EBF3FF", paddingVertical: 12, borderRadius: 12, alignItems: "center", marginRight: 8, flexDirection: "row", justifyContent: "center" },
  btnSecondaryTxt: { color: "#2A85FF", fontWeight: "bold", marginLeft: 4 },
  btnPrimary: { flex: 1, backgroundColor: "#2A85FF", paddingVertical: 12, borderRadius: 12, alignItems: "center", marginLeft: 8, flexDirection: "row", justifyContent: "center" },
  btnPrimaryTxt: { color: "#FFF", fontWeight: "bold", marginLeft: 4 },
  emptyWrap: { alignItems: "center", marginTop: 80 },
  emptyTxt: { fontSize: 18, color: "#999", marginTop: 16, fontWeight: "600" }
});
