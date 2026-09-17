import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const DUMMY_SAVED = [
  { id: "s1", title: "Premium Plot in Kankarbagh", price: "₹45,00,000", location: "Patna, Bihar", area: "1200 sq.ft", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80" },
  { id: "s2", title: "Agricultural Land", price: "₹12,50,000", location: "Hajipur, Bihar", area: "1 Acre", image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&q=80" }
];

export default function SavedScreen() {
  const [saved, setSaved] = useState(DUMMY_SAVED);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <TouchableOpacity style={styles.heartBtn}>
        <FontAwesome5 name="heart" solid size={20} color="#FF3B30" />
      </TouchableOpacity>
      <View style={styles.cardBody}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price}</Text>
          <View style={styles.badge}><Text style={styles.badgeTxt}>Verified</Text></View>
        </View>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <View style={styles.detailsRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.detailTxt}>{item.location}</Text>
          <Text style={styles.dot}> • </Text>
          <MaterialIcons name="square-foot" size={16} color="#666" />
          <Text style={styles.detailTxt}>{item.area}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Properties</Text>
        <Text style={styles.headerSub}>Properties you love, ready for you.</Text>
      </View>

      <FlatList
        data={saved}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="heart" size={64} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No saved properties</Text>
            <Text style={styles.emptySub}>Start exploring and save your favorites here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { padding: 24, paddingTop: 60, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#EAEAEA" },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#111" },
  headerSub: { fontSize: 14, color: "#666", marginTop: 4 },
  card: { backgroundColor: "#FFF", borderRadius: 16, marginBottom: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardImage: { width: "100%", height: 180, backgroundColor: "#EEE" },
  heartBtn: { position: "absolute", top: 12, right: 12, backgroundColor: "#FFF", padding: 8, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  cardBody: { padding: 16 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  price: { fontSize: 20, fontWeight: "bold", color: "#2A85FF" },
  badge: { backgroundColor: "#E8F5E9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeTxt: { color: "#2E7D32", fontSize: 12, fontWeight: "bold" },
  title: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 8 },
  detailsRow: { flexDirection: "row", alignItems: "center" },
  detailTxt: { fontSize: 14, color: "#666", marginLeft: 4 },
  dot: { color: "#CCC", marginHorizontal: 4 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginTop: 24 },
  emptySub: { fontSize: 14, color: "#666", marginTop: 8, textAlign: "center", paddingHorizontal: 32 }
});
