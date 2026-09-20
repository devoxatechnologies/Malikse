import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, FlatList, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { propertyService } from "../../src/services/propertyService";
import type { Property } from "../../src/types/property.types";
import PropertyCard from "../../components/PropertyCard";
import AppHeader from "../../components/AppHeader";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";
import { useListingFilterStore } from "../../src/store/listingFilterStore";
import { useAuthStore } from "../../src/store/authStore";
import { MaterialIcons } from "@expo/vector-icons";
import { AppTheme } from "../../constants/theme";

const DUMMY_PROPERTIES: Property[] = [
  {
    id: "prop_1",
    ownerId: "owner_1",
    title: "Prime Commercial Plot on Main Bailey Road",
    type: "land",
    price: 8500000,
    totalArea: 2400,
    sellableArea: 2400,
    location: { district: "Danapur, Patna", state: "Bihar", lat: 25.6127, lng: 85.0456 },
    status: "verified",
    badges: { identityVerified: true, documentsChecked: true, siteVisited: true, lawyerReviewed: true, fullyVerified: true },
    media: { photos: ["https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80"] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prop_2",
    ownerId: "owner_2",
    title: "Residential Land for Modern Villa",
    type: "land",
    price: 3200000,
    totalArea: 1500,
    sellableArea: 1500,
    location: { district: "Bihta, Patna", state: "Bihar", lat: 25.5684, lng: 84.8582 },
    status: "verified",
    badges: { identityVerified: true, documentsChecked: true, siteVisited: true, lawyerReviewed: true, fullyVerified: true },
    media: { photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prop_3",
    ownerId: "owner_3",
    title: "Fertile Highway Agricultural Farm Land",
    type: "land",
    price: 1850000,
    totalArea: 43560,
    sellableArea: 43560,
    location: { district: "Naubatpur, Patna", state: "Bihar", lat: 25.5342, lng: 84.9741 },
    status: "verified",
    badges: { identityVerified: true, documentsChecked: true, siteVisited: true, lawyerReviewed: false, fullyVerified: false },
    media: { photos: ["https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80"] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prop_4",
    ownerId: "owner_4",
    title: "Luxury 3BHK Apartment in Gated Community",
    type: "flat",
    price: 6500000,
    totalArea: 1850,
    sellableArea: 1420,
    location: { district: "Kankarbagh, Patna", state: "Bihar", lat: 25.5941, lng: 85.1550 },
    status: "verified",
    badges: { identityVerified: true, documentsChecked: true, siteVisited: true, lawyerReviewed: true, fullyVerified: true },
    media: { photos: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default function SearchScreen() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const filters = useListingFilterStore();
  const { user, authState } = useAuthStore();
  
  const [properties, setProperties] = useState<Property[]>(DUMMY_PROPERTIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState("all");

  useEffect(() => {
    fetchProperties();
  }, [filters.verifiedOnly, filters.propertyType, filters.location]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyService.searchProperties({
        verifiedOnly: filters.verifiedOnly,
        type: filters.propertyType || undefined,
        location: filters.location || undefined
      });
      if (data && data.length > 0) {
        setProperties(data);
      } else {
        setProperties(DUMMY_PROPERTIES);
      }
    } catch (e) {
      setProperties(DUMMY_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const loc = typeof p.location === "string" ? p.location : `${p.location?.district} ${p.location?.state}`;
    const matchesSearch = !searchQuery || 
      (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeChip === "verified") return p.status === "verified";
    if (activeChip === "land") return p.type === "land";
    if (activeChip === "flat") return p.type === "flat";
    if (activeChip === "patna") return loc.toLowerCase().includes("patna");
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top Brand Header */}
      <AppHeader
        showBack={false}
        showLanguageToggle={true}
        rightElement={
          authState === "AUTHENTICATED" && user ? (
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push("/profile")}
              activeOpacity={0.8}
            >
              <View style={styles.userAvatar}>
                <Text style={styles.avatarLetter}>{user.name?.charAt(0) || "U"}</Text>
              </View>
              <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push("/login")}
              activeOpacity={0.8}
            >
              <MaterialIcons name="login" size={16} color={AppTheme.colors.white} />
              <Text style={styles.loginBtnText}>Sign In</Text>
            </TouchableOpacity>
          )
        }
      />

      {/* Search Header */}
      <View style={styles.header}>
        {/* Mobile Locality & Trust Strip */}
        <View style={styles.mobileLocationRow}>
          <View style={styles.locationTag}>
            <MaterialIcons name="place" size={14} color="#059669" />
            <Text style={styles.locationTagText}>Patna & Surrounding Parcels</Text>
          </View>
          <View style={styles.verifiedTag}>
            <MaterialIcons name="verified" size={12} color="#059669" />
            <Text style={styles.verifiedTagText}>Direct Owners</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#059669" />
          <TextInput 
            style={styles.searchInput} 
            placeholder={t(language, "search_placeholder") || "Search by colony, Danapur, Bihta..."}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
              <MaterialIcons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.filterIconBtn} activeOpacity={0.7}>
            <MaterialIcons name="tune" size={18} color="#059669" />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {[
            { key: "all", label: "All Properties", icon: "domain" },
            { key: "verified", label: "100% Verified", icon: "verified" },
            { key: "land", label: "Plots & Land", icon: "terrain" },
            { key: "flat", label: "Flats & Villas", icon: "apartment" },
            { key: "patna", label: "Patna", icon: "place" },
          ].map((chip) => {
            const isActive = activeChip === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveChip(chip.key)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={chip.icon as any}
                  size={14}
                  color={isActive ? "#059669" : "#64748B"}
                />
                <Text style={[styles.chipTxt, isActive && styles.chipTxtActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content List */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
            <Text style={styles.loadingText}>{t(language, "loading")}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProperties}
            keyExtractor={(item, index) => item.id || item._id || String(index)}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => <PropertyCard property={item} />}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <MaterialIcons name="search-off" size={48} color={AppTheme.colors.textMuted} />
                <Text style={styles.emptyTitle}>{t(language, "search_no_results")}</Text>
                <Text style={styles.emptySub}>Try searching for a different area or clear filters.</Text>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => { setSearchQuery(""); setActiveChip("all"); }}
                >
                  <Text style={styles.resetBtnTxt}>Clear Filters</Text>
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
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: { 
    padding: 14, 
    backgroundColor: "#FFFFFF", 
    borderBottomWidth: 1, 
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  mobileLocationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  locationTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  filterIconBtn: {
    padding: 6,
    marginLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: AppTheme.colors.text,
    outlineStyle: "none" as any,
  },
  chipsRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  chipActive: {
    backgroundColor: AppTheme.colors.primaryLight,
    borderColor: AppTheme.colors.primary,
  },
  chipTxt: {
    color: AppTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTxtActive: {
    color: AppTheme.colors.primaryDark,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  listPadding: {
    padding: 16,
    paddingBottom: 80,
  },
  loaderBox: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: AppTheme.colors.textSecondary,
    fontSize: 13,
  },
  emptyBox: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppTheme.colors.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: AppTheme.colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 260,
  },
  resetBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: AppTheme.colors.primaryLight,
    borderRadius: AppTheme.radius.md,
  },
  resetBtnTxt: {
    color: AppTheme.colors.primaryDark,
    fontWeight: "700",
    fontSize: 13,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
  },
  loginBtnText: {
    color: AppTheme.colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppTheme.colors.divider,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: AppTheme.radius.full,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: AppTheme.colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  userName: {
    fontSize: 12,
    fontWeight: "600",
    color: AppTheme.colors.text,
    maxWidth: 80,
  },
});
