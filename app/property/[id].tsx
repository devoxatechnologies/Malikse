import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { propertyService } from "../../src/services/propertyService";
import type { Property } from "../../src/types/property.types";
import { FontAwesome5 } from "@expo/vector-icons";
import MiniMapPreview from "../../components/MiniMapPreview";
import VerificationBadgeRow from "../../components/VerificationBadgeRow";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language } = useLanguageStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const data = await propertyService.getPropertyById(id);
      setProperty(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2A85FF" /></View>;
  if (!property) return <View style={styles.center}><Text>Property not found</Text></View>;

  const formattedPrice = property.price >= 10000000 
    ? `₹${(property.price / 10000000).toFixed(2)} Cr` 
    : property.price >= 100000 
    ? `₹${(property.price / 100000).toFixed(2)} L` 
    : `₹${property.price.toLocaleString("en-IN")}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Property Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Main Details */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.price}>{formattedPrice}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusTxt}>{property.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.location}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#666" /> {property.location.district}, {property.location.state}
          </Text>
          <Text style={styles.area}>
            {t(language, "prop_area")}: {property.sellableArea} sq.ft
          </Text>
        </View>

        {/* Verification Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Status</Text>
          <VerificationBadgeRow badges={property.badges} />
          <Text style={styles.disclaimer}>{t(language, "prop_verified_disclaimer")}</Text>
        </View>

        {/* Map Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <MiniMapPreview property={property} />
        </View>

        {/* Legal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t(language, "prop_type")}</Text>
            <Text style={styles.detailValue}>{property.type.toUpperCase()}</Text>
          </View>
          {property.khata && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t(language, "prop_khata")}</Text>
              <Text style={styles.detailValue}>{property.khata}</Text>
            </View>
          )}
          {property.khesra && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t(language, "prop_khesra")}</Text>
              <Text style={styles.detailValue}>{property.khesra}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Bar (Buyer perspective) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.contactBtn}>
          <Text style={styles.contactTxt}>{t(language, "prop_contact_owner")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.offerBtn}>
          <Text style={styles.offerTxt}>{t(language, "prop_send_offer")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, paddingTop: 48, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#EAEAEA" },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111" },
  scroll: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: "#FFF", padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#EAEAEA" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  price: { fontSize: 24, fontWeight: "bold", color: "#111" },
  statusBadge: { backgroundColor: "#E6F4FE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusTxt: { fontSize: 12, fontWeight: "bold", color: "#2A85FF" },
  location: { fontSize: 16, color: "#666", marginBottom: 8 },
  area: { fontSize: 16, color: "#444" },
  section: { backgroundColor: "#FFF", padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#EAEAEA" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#111", marginBottom: 12 },
  disclaimer: { fontSize: 12, color: "#999", fontStyle: "italic", marginTop: 8 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderColor: "#F0F0F0" },
  detailLabel: { fontSize: 14, color: "#666" },
  detailValue: { fontSize: 14, fontWeight: "500", color: "#111" },
  bottomBar: { flexDirection: "row", position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "#FFF", borderTopWidth: 1, borderColor: "#EAEAEA", elevation: 10 },
  contactBtn: { flex: 1, padding: 16, backgroundColor: "#F0F0F0", borderRadius: 8, alignItems: "center", marginRight: 8 },
  contactTxt: { fontSize: 16, color: "#111", fontWeight: "bold" },
  offerBtn: { flex: 1, padding: 16, backgroundColor: "#2A85FF", borderRadius: 8, alignItems: "center", marginLeft: 8 },
  offerTxt: { fontSize: 16, color: "#FFF", fontWeight: "bold" }
});
