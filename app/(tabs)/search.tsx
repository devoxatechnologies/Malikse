import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Image, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { propertyService } from "../../src/services/propertyService";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";
import { useListingFilterStore } from "../../src/store/listingFilterStore";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const DUMMY_PROPERTIES = [
  { id: "p1", title: "Commercial Plot on Main Road", price: "₹85,00,000", location: "Danapur, Patna", area: "2400 sq.ft", image: "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=400&q=80", verified: true },
  { id: "p2", title: "Residential Land for Villa", price: "₹32,00,000", location: "Bihta, Patna", area: "1500 sq.ft", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80", verified: true },
  { id: "p3", title: "Farm Land with Tube Well", price: "₹18,50,000", location: "Naubatpur, Patna", area: "1.5 Acre", image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&q=80", verified: false }
];

export default function SearchScreen() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const filters = useListingFilterStore();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProperties();
  }, [filters.verifiedOnly, filters.type, filters.location]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyService.searchProperties({
        verifiedOnly: filters.verifiedOnly,
        type: filters.propertyType || undefined,
        location: filters.location || undefined
      });
      setProperties(data.length ? data : DUMMY_PROPERTIES);
    } catch (e) {
      setProperties(DUMMY_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image || item.media?.photos?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80" }} style={styles.cardImage} />
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={14} color="#FFF" />
            <Text style={styles.verifiedTxt}>Verified Owner</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price || "₹--,--,---"}</Text>
          <TouchableOpacity style={styles.contactBtn}>
            <Text style={styles.contactBtnTxt}>Contact</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title} numberOfLines={1}>{item.title || "Property Listing"}</Text>
        <View style={styles.detailsRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.detailTxt}>{item.location?.district || item.location}</Text>
          <Text style={styles.dot}> • </Text>
          <MaterialIcons name="square-foot" size={16} color="#666" />
          <Text style={styles.detailTxt}>{item.totalArea || item.area}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={16} color="#999" />
          <TextInput 
            style={styles.searchInput} 
            placeholder={t(language, "search_placeholder") || "Search location..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterIconBtn}>
            <FontAwesome5 name="sliders-h" size={16} color="#2A85FF" />
          </TouchableOpacity>
        </View>
        <View style={styles.chipsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={[styles.chip, styles.chipActive]}><Text style={styles.chipTxtActive}>All</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipTxt}>Plots</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipTxt}>Agricultural</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipTxt}>Commercial</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  header: { 
    padding: 16, 
    paddingTop: 60, 
    backgroundColor: "#FFF", 
    borderBottomWidth: 1, 
    borderColor: "#EAEAEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: "#333" },
  filterIconBtn: { padding: 8 },
  chipsRow: { marginTop: 12, flexDirection: "row" },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F0F2F5", marginRight: 8, borderWidth: 1, borderColor: "transparent" },
  chipActive: { backgroundColor: "#EBF3FF", borderColor: "#2A85FF" },
  chipTxt: { color: "#666", fontWeight: "500" },
  chipTxtActive: { color: "#2A85FF", fontWeight: "bold" },
  content: { flex: 1 },
  card: { backgroundColor: "#FFF", borderRadius: 16, marginBottom: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  imageContainer: { position: "relative" },
  cardImage: { width: "100%", height: 200, backgroundColor: "#EEE" },
  verifiedBadge: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(46, 125, 50, 0.9)", flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  verifiedTxt: { color: "#FFF", fontSize: 12, fontWeight: "bold", marginLeft: 4 },
  cardBody: { padding: 16 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  price: { fontSize: 22, fontWeight: "bold", color: "#111" },
  contactBtn: { backgroundColor: "#2A85FF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  contactBtnTxt: { color: "#FFF", fontWeight: "bold", fontSize: 13 },
  title: { fontSize: 16, fontWeight: "600", color: "#444", marginBottom: 8 },
  detailsRow: { flexDirection: "row", alignItems: "center" },
  detailTxt: { fontSize: 14, color: "#777", marginLeft: 4 },
  dot: { color: "#CCC", marginHorizontal: 4 }
});
