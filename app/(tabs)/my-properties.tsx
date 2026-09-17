import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { propertyService } from "../../src/services/propertyService";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const DUMMY_MY_PROPERTIES = [
  { id: "p1", title: "Commercial Plot on Main Road", location: "Danapur, Patna", area: "2400 sq.ft", image: "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=400&q=80", status: "verified", date: "Listed: 12 Sep 2026", badges: { identity: true, documents: true, site: true, lawyer: true } },
  { id: "p2", title: "Residential Land for Villa", location: "Bihta, Patna", area: "1500 sq.ft", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80", status: "pending", date: "Listed: 10 Sep 2026", badges: { identity: true, documents: true, site: false, lawyer: false } },
];

export default function MyPropertiesScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyService.getMyProperties();
      setProperties(data.length ? data : DUMMY_MY_PROPERTIES);
    } catch (e) {
      setProperties(DUMMY_MY_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  const renderBadge = (active: boolean, icon: string, label: string) => (
    <View style={[styles.statusBadge, active ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
      <FontAwesome5 name={icon} size={12} color={active ? "#2E7D32" : "#999"} />
      <Text style={[styles.statusBadgeTxt, active ? { color: "#2E7D32" } : { color: "#999" }]}>{label}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.image || item.media?.photos?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80" }} style={styles.cardImage} />
        <View style={[styles.mainBadge, item.status === "verified" ? styles.bgVerified : styles.bgPending]}>
          <Text style={styles.mainBadgeTxt}>{item.status === "verified" ? "Published" : "Under Verification"}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>{item.title || "My Property"}</Text>
        <View style={styles.detailsRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.detailTxt}>{item.location?.district || item.location}</Text>
          <Text style={styles.dot}> • </Text>
          <MaterialIcons name="square-foot" size={16} color="#666" />
          <Text style={styles.detailTxt}>{item.totalArea || item.area}</Text>
        </View>
        <Text style={styles.dateTxt}>{item.date}</Text>

        <View style={styles.divider} />
        <Text style={styles.verificationTitle}>Verification Progress</Text>
        <View style={styles.verificationGrid}>
          {renderBadge(item.badges?.identity, "id-card", "Identity")}
          {renderBadge(item.badges?.documents, "file-contract", "Documents")}
          {renderBadge(item.badges?.site, "map-marked-alt", "Site Visit")}
          {renderBadge(item.badges?.lawyer, "gavel", "Lawyer")}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Properties</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/listing/create")}>
          <FontAwesome5 name="plus" size={14} color="#FFF" />
          <Text style={styles.addBtnTxt}>List New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="home" size={48} color="#CCC" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyMsg}>No properties listed yet.</Text>
            <TouchableOpacity style={[styles.addBtn, { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12 }]} onPress={() => router.push("/listing/create")}>
              <Text style={styles.addBtnTxt}>List Your Property</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#EAEAEA",
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#111" },
  addBtn: {
    flexDirection: "row",
    backgroundColor: "#2A85FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
  },
  addBtnTxt: { color: "#FFF", fontWeight: "bold", marginLeft: 8 },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 100 },
  emptyMsg: { fontSize: 18, color: "#444", fontWeight: "600" },
  card: { backgroundColor: "#FFF", borderRadius: 16, marginBottom: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardHeader: { position: "relative" },
  cardImage: { width: "100%", height: 160, backgroundColor: "#EEE" },
  mainBadge: { position: "absolute", top: 12, right: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  bgVerified: { backgroundColor: "#4CAF50" },
  bgPending: { backgroundColor: "#FF9800" },
  mainBadgeTxt: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  cardBody: { padding: 16 },
  title: { fontSize: 18, fontWeight: "bold", color: "#222", marginBottom: 6 },
  detailsRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailTxt: { fontSize: 14, color: "#666", marginLeft: 4 },
  dot: { color: "#CCC", marginHorizontal: 4 },
  dateTxt: { fontSize: 12, color: "#999" },
  divider: { height: 1, backgroundColor: "#EAEAEA", marginVertical: 12 },
  verificationTitle: { fontSize: 13, fontWeight: "bold", color: "#333", marginBottom: 12 },
  verificationGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statusBadge: { flexDirection: "row", alignItems: "center", width: "48%", padding: 8, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
  statusBadgeActive: { backgroundColor: "#F1F8E9", borderColor: "#C8E6C9" },
  statusBadgeInactive: { backgroundColor: "#F9F9F9", borderColor: "#EEE" },
  statusBadgeTxt: { fontSize: 12, fontWeight: "600", marginLeft: 6 }
});
