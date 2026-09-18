import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { propertyService } from "../../src/services/propertyService";
import type { Property } from "../../src/types/property.types";
import PropertyCard from "../../components/PropertyCard";
import AppHeader from "../../components/AppHeader";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";
import { useListingFilterStore } from "../../src/store/listingFilterStore";
import { useAuthStore } from "../../src/store/authStore";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { AppTheme } from "../../constants/theme";

const CURATED_PROPERTIES: Property[] = [
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

export default function SearchScreenWeb() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const filters = useListingFilterStore();
  const { user, authState } = useAuthStore();
  
  const [properties, setProperties] = useState<Property[]>(CURATED_PROPERTIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("react-leaflet")
        .then((ReactLeaflet) => {
          setMapComponents(ReactLeaflet);
        })
        .catch((e) => console.error("Failed to load map components", e));
    }
  }, []);

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
        setProperties(CURATED_PROPERTIES);
      }
    } catch (e) {
      setProperties(CURATED_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = properties.filter((p) => {
    const loc = typeof p.location === "string" ? p.location : `${p.location?.district} ${p.location?.state}`;
    const matchesSearch = !searchQuery || 
      (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "verified") return p.status === "verified";
    if (activeFilter === "land") return p.type === "land";
    if (activeFilter === "flat") return p.type === "flat";
    if (activeFilter === "patna") return loc.toLowerCase().includes("patna");
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top Navbar Header */}
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

      {/* Enhanced Hero Search & Filter Bar */}
      <View style={styles.filterSection}>
        <View style={styles.searchBarWrapper}>
          {/* Header Banner Strip */}
          <View style={styles.heroStrip}>
            <View>
              <Text style={styles.heroTitle}>Direct Land & Plots from Genuine Owners</Text>
              <View style={styles.heroTrustRow}>
                <View style={styles.trustItem}>
                  <MaterialIcons name="verified" size={13} color="#059669" />
                  <Text style={styles.trustItemText}>100% Jamabandi & Registry Checked</Text>
                </View>
                <Text style={styles.trustDot}>&bull;</Text>
                <View style={styles.trustItem}>
                  <MaterialIcons name="gps-fixed" size={13} color="#059669" />
                  <Text style={styles.trustItemText}>Physical GPS Boundary Visits</Text>
                </View>
                <Text style={styles.trustDot}>&bull;</Text>
                <View style={styles.trustItem}>
                  <MaterialIcons name="handshake" size={13} color="#059669" />
                  <Text style={styles.trustItemText}>Zero Brokerage</Text>
                </View>
              </View>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeNum}>1,400+</Text>
              <Text style={styles.statBadgeTxt}>Verified Parcels</Text>
            </View>
          </View>

          {/* Composite Search Bar */}
          <View style={styles.searchComposite}>
            <View style={styles.locationPill}>
              <MaterialIcons name="place" size={16} color="#059669" />
              <Text style={styles.locationPillText}>Patna, BR</Text>
            </View>
            <View style={styles.searchDivider} />
            <View style={styles.searchBox}>
              <MaterialIcons name="search" size={18} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder={t(language, "search_placeholder") || "Search by colony, Danapur, Bihta, Bailey Road, plot size..."}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
                  <MaterialIcons name="close" size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity style={styles.searchActionBtn} activeOpacity={0.8}>
              <MaterialIcons name="search" size={16} color="#FFFFFF" />
              <Text style={styles.searchActionBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {[
              { key: "all", label: "All Properties", icon: "domain" },
              { key: "verified", label: "100% Verified Only", icon: "verified" },
              { key: "land", label: "Plots & Land", icon: "terrain" },
              { key: "flat", label: "Flats & Houses", icon: "apartment" },
              { key: "patna", label: "Patna Region", icon: "place" },
            ].map((chip) => {
              const isActive = activeFilter === chip.key;
              return (
                <TouchableOpacity
                  key={chip.key}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setActiveFilter(chip.key)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={chip.icon as any}
                    size={14}
                    color={isActive ? "#059669" : "#64748B"}
                  />
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Main Split Content: Map & Properties */}
      <View style={styles.content}>
        {/* Map View Left Panel */}
        <View style={styles.mapContainer}>
          {!MapComponents ? (
            <View style={styles.mapLoader}>
              <ActivityIndicator size="large" color={AppTheme.colors.primary} />
              <Text style={styles.loadingText}>Loading Interactive Verified Map...</Text>
            </View>
          ) : (
            <MapComponents.MapContainer
              center={[25.5941, 85.1376]} // Patna coordinates
              zoom={11}
              style={{ width: "100%", height: "100%" }}
            >
              <MapComponents.TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredList.map((prop) => {
                const lat = prop.location?.lat || 25.5941;
                const lng = prop.location?.lng || 85.1376;
                const priceStr = Number(prop.price) >= 10000000 
                  ? `₹${(Number(prop.price) / 10000000).toFixed(2)} Cr` 
                  : `₹${(Number(prop.price) / 100000).toFixed(2)} Lakh`;
                return (
                  <MapComponents.Marker key={prop.id} position={[lat, lng]}>
                    <MapComponents.Popup>
                      <View style={{ minWidth: 160, padding: 4 }}>
                        <Text style={{ fontWeight: "700", color: "#0F172A", fontSize: 13 }}>
                          {prop.title || prop.type.toUpperCase()}
                        </Text>
                        <Text style={{ color: "#059669", fontWeight: "800", fontSize: 14, marginVertical: 4 }}>
                          {priceStr}
                        </Text>
                        <Text style={{ color: "#64748B", fontSize: 11 }}>
                          {typeof prop.location === "string" ? prop.location : prop.location?.district}
                        </Text>
                        <TouchableOpacity
                          onPress={() => router.push(`/property/${prop.id}`)}
                          style={{
                            marginTop: 8,
                            backgroundColor: "#059669",
                            paddingVertical: 5,
                            paddingHorizontal: 10,
                            borderRadius: 4,
                            alignItems: "center"
                          }}
                        >
                          <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 11 }}>
                            View Property &rarr;
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </MapComponents.Popup>
                  </MapComponents.Marker>
                );
              })}
            </MapComponents.MapContainer>
          )}
        </View>

        {/* List View Right Panel */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listHeading}>
              Available Listings ({filteredList.length})
            </Text>
            <Text style={styles.listSubheading}>
              Zero Middlemen &bull; 100% Direct Verified Owners
            </Text>
          </View>

          {loading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color={AppTheme.colors.primary} />
              <Text style={styles.loadingText}>{t(language, "loading")}</Text>
            </View>
          ) : filteredList.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="search-off" size={48} color={AppTheme.colors.textMuted} />
              <Text style={styles.emptyTitle}>{t(language, "search_no_results")}</Text>
              <Text style={styles.emptySub}>Try clearing your filters or searching for another district.</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={() => { setSearchQuery(""); setActiveFilter("all"); }}>
                <Text style={styles.resetBtnTxt}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.cardsScroll}>
              {filteredList.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  filterSection: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  searchBarWrapper: {
    maxWidth: 1300,
    width: "100%",
    alignSelf: "center",
  },
  heroStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  heroTrustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trustItemText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "700",
  },
  trustDot: {
    color: "#94A3B8",
    fontSize: 11,
  },
  statBadge: {
    alignItems: "flex-end",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statBadgeNum: {
    fontSize: 15,
    fontWeight: "900",
    color: "#059669",
  },
  statBadgeTxt: {
    fontSize: 10,
    fontWeight: "600",
    color: "#166534",
  },
  searchComposite: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginBottom: 10,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  locationPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#065F46",
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "500",
    outlineStyle: "none" as any,
  },
  searchActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#059669",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  searchActionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  chipsScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppTheme.colors.textSecondary,
  },
  chipTextActive: {
    color: AppTheme.colors.primaryDark,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  mapContainer: {
    flex: 1.1,
    backgroundColor: "#E2E8F0",
    position: "relative",
  },
  mapLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: AppTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  listContainer: {
    flex: 0.9,
    backgroundColor: AppTheme.colors.background,
    borderLeftWidth: 1,
    borderLeftColor: AppTheme.colors.border,
  },
  listHeader: {
    padding: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.divider,
    backgroundColor: AppTheme.colors.white,
  },
  listHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: AppTheme.colors.text,
  },
  listSubheading: {
    fontSize: 12,
    color: AppTheme.colors.primaryDark,
    fontWeight: "600",
    marginTop: 2,
  },
  cardsScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  loaderBox: {
    padding: 40,
    alignItems: "center",
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
    maxWidth: 280,
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: AppTheme.radius.full,
  },
  loginBtnText: {
    color: AppTheme.colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppTheme.colors.divider,
    paddingVertical: 4,
    paddingHorizontal: 10,
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
    fontSize: 13,
    fontWeight: "600",
    color: AppTheme.colors.text,
    maxWidth: 100,
  },
});
