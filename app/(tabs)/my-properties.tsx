import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { propertyService } from "../../src/services/propertyService";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import { AppTheme } from "../../constants/theme";

const DUMMY_MY_PROPERTIES = [
  { 
    id: "prop_1", 
    title: "Prime Commercial Plot on Main Bailey Road", 
    location: { district: "Danapur", state: "Bihar" }, 
    sellableArea: 2400, 
    price: 8500000,
    media: { photos: ["https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80"] }, 
    status: "verified", 
    date: "Listed: 12 Sep 2026", 
    badges: { identity: true, documents: true, site: true, lawyer: true } 
  },
  { 
    id: "prop_2", 
    title: "Residential Land for Modern Villa", 
    location: { district: "Bihta", state: "Bihar" }, 
    sellableArea: 1500, 
    price: 3200000,
    media: { photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"] }, 
    status: "pending", 
    date: "Listed: 10 Sep 2026", 
    badges: { identity: true, documents: true, site: false, lawyer: false } 
  },
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
      <FontAwesome5 name={icon} size={12} color={active ? AppTheme.colors.primaryDark : AppTheme.colors.textMuted} />
      <Text style={[styles.statusBadgeTxt, active ? { color: AppTheme.colors.primaryDark } : { color: AppTheme.colors.textMuted }]}>{label}</Text>
      {active && <MaterialIcons name="check-circle" size={12} color={AppTheme.colors.primary} style={{ marginLeft: "auto" }} />}
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const isVerified = item.status === "verified";
    const imageUri = item.media?.photos?.[0] || item.image || "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80";
    const rawPrice = Number(item.price) || 0;
    const formattedPrice = rawPrice >= 10000000 
      ? `₹${(rawPrice / 10000000).toFixed(2)} Cr` 
      : rawPrice >= 100000 
      ? `₹${(rawPrice / 100000).toFixed(2)} Lakh` 
      : `₹${rawPrice.toLocaleString("en-IN")}`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/property/${item.id || item._id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
          <View style={[styles.mainBadge, isVerified ? styles.bgVerified : styles.bgPending]}>
            <MaterialIcons name={isVerified ? "verified" : "hourglass-empty"} size={14} color={AppTheme.colors.white} />
            <Text style={styles.mainBadgeTxt}>{isVerified ? "Published & Live" : "Under Verification"}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.topRow}>
            <Text style={styles.price}>{formattedPrice}</Text>
            <Text style={styles.dateTxt}>{item.date || "Active"}</Text>
          </View>

          <Text style={styles.title} numberOfLines={1}>{item.title || "My Property"}</Text>

          <View style={styles.detailsRow}>
            <MaterialIcons name="location-on" size={16} color={AppTheme.colors.textMuted} />
            <Text style={styles.detailTxt}>{item.location?.district || item.location}, Bihar</Text>
            <Text style={styles.dot}> • </Text>
            <MaterialIcons name="straighten" size={16} color={AppTheme.colors.textMuted} />
            <Text style={styles.detailTxt}>{item.sellableArea || item.totalArea || item.area} sq.ft</Text>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.verificationHeader}>
            <Text style={styles.verificationTitle}>4-Stage Verification Status</Text>
            <Text style={styles.verificationSubtitle}>{isVerified ? "All Verified" : "2 of 4 Complete"}</Text>
          </View>

          <View style={styles.verificationGrid}>
            {renderBadge(item.badges?.identity ?? true, "id-card", "Owner KYC")}
            {renderBadge(item.badges?.documents ?? true, "file-contract", "Documents")}
            {renderBadge(item.badges?.site ?? false, "map-marked-alt", "Site Visit")}
            {renderBadge(item.badges?.lawyer ?? false, "gavel", "Lawyer")}
          </View>

          <View style={styles.cardActionRow}>
            <Text style={styles.cardActionLink}>View Full Details & Offers &rarr;</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* AppHeader with Back Navigation */}
      <AppHeader
        title="My Property Listings"
        subtitle="Manage listings & verification reports"
        showBack={true}
        fallbackRoute="/search"
        rightElement={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/listing/create")}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={18} color={AppTheme.colors.white} />
            <Text style={styles.addBtnTxt}>List New</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={properties}
            keyExtractor={(item) => item.id || item._id}
            contentContainerStyle={styles.listPadding}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <FontAwesome5 name="home" size={36} color={AppTheme.colors.textMuted} />
                </View>
                <Text style={styles.emptyMsg}>No properties listed yet</Text>
                <Text style={styles.emptySub}>Post your land or property to get 100% verified and connect directly with genuine buyers.</Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => router.push("/listing/create")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="add-circle-outline" size={20} color={AppTheme.colors.white} />
                  <Text style={styles.emptyAddBtnTxt}>Post Your First Property</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.colors.background },
  content: {
    flex: 1,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  listPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  addBtn: {
    flexDirection: "row",
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
    alignItems: "center",
    gap: 4,
  },
  addBtnTxt: {
    color: AppTheme.colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.xl,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    ...AppTheme.shadows.card,
  },
  cardHeader: {
    position: "relative",
    height: 180,
    width: "100%",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  mainBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
  },
  bgVerified: { backgroundColor: AppTheme.colors.primary },
  bgPending: { backgroundColor: AppTheme.colors.warning },
  mainBadgeTxt: { color: AppTheme.colors.white, fontSize: 11, fontWeight: "700" },
  cardBody: { padding: 18 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  price: {
    fontSize: 22,
    fontWeight: "800",
    color: AppTheme.colors.primaryDark,
  },
  title: { fontSize: 17, fontWeight: "700", color: AppTheme.colors.text, marginBottom: 6 },
  detailsRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  detailTxt: { fontSize: 13, color: AppTheme.colors.textSecondary, marginLeft: 4, fontWeight: "500" },
  dot: { color: AppTheme.colors.textMuted, marginHorizontal: 6 },
  dateTxt: { fontSize: 12, color: AppTheme.colors.textMuted },
  divider: { height: 1, backgroundColor: AppTheme.colors.divider, marginVertical: 12 },
  verificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  verificationTitle: { fontSize: 12, fontWeight: "700", color: AppTheme.colors.text, textTransform: "uppercase", letterSpacing: 0.5 },
  verificationSubtitle: { fontSize: 11, color: AppTheme.colors.textMuted, fontWeight: "600" },
  verificationGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    padding: 10,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
  },
  statusBadgeActive: { backgroundColor: AppTheme.colors.primaryLight, borderColor: AppTheme.colors.primary },
  statusBadgeInactive: { backgroundColor: AppTheme.colors.divider, borderColor: AppTheme.colors.border },
  statusBadgeTxt: { fontSize: 11, fontWeight: "700", marginLeft: 6 },
  cardActionRow: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.divider,
    alignItems: "flex-end",
  },
  cardActionLink: {
    fontSize: 13,
    fontWeight: "700",
    color: AppTheme.colors.primary,
  },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 60, padding: 24 },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppTheme.colors.divider,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyMsg: { fontSize: 18, color: AppTheme.colors.text, fontWeight: "800" },
  emptySub: { fontSize: 13, color: AppTheme.colors.textMuted, textAlign: "center", marginTop: 6, maxWidth: 300 },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: AppTheme.radius.md,
    ...AppTheme.shadows.soft,
  },
  emptyAddBtnTxt: { color: AppTheme.colors.white, fontWeight: "700", fontSize: 14 },
});
