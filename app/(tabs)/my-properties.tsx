import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { propertyService } from "../../src/services/propertyService";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import { useLanguageStore } from "../../src/store/languageStore";
import { t } from "../../src/i18n/translations";

const DUMMY_MY_PROPERTIES = [
  {
    id: "prop_1",
    title: "Prime Commercial & Residential Plot on Main Bailey Road",
    location: { district: "Patna", state: "Bihar", area: "Bailey Road, Danapur" },
    sellableArea: 2400,
    price: 4500000,
    ratePerSqFt: 1875,
    khata: "104",
    khesra: "582",
    dimensions: "40 x 60 ft",
    roadWidth: "40 ft Road",
    media: { photos: ["https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80"] },
    status: "pending",
    date: "12 Sep 2026",
    offersCount: 2,
    highestOffer: "₹44.50 L",
    badges: { identity: true, documents: true, site: false, lawyer: false },
  },
  {
    id: "prop_2",
    title: "Residential Land for Modern Villa in Bihta Mega Growth Corridor",
    location: { district: "Patna", state: "Bihar", area: "Near IIT Bihta Campus" },
    sellableArea: 1500,
    price: 3200000,
    ratePerSqFt: 2133,
    khata: "88",
    khesra: "341",
    dimensions: "30 x 50 ft",
    roadWidth: "30 ft Road",
    media: { photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"] },
    status: "verified",
    date: "05 Sep 2026",
    offersCount: 1,
    highestOffer: "₹31.00 L",
    badges: { identity: true, documents: true, site: true, lawyer: true },
  },
];

export default function MyPropertiesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isTablet = width >= 640 && width < 900;
  const { language } = useLanguageStore();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "verified">("all");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyService.getMyProperties();
      if (data && data.length) {
        // Merge with dummy if only 1 to give rich dashboard view
        setProperties(data);
      } else {
        setProperties(DUMMY_MY_PROPERTIES);
      }
    } catch (e) {
      setProperties(DUMMY_MY_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((p) => {
    if (activeTab === "pending") return p.status !== "verified";
    if (activeTab === "verified") return p.status === "verified";
    return true;
  });

  const totalCount = properties.length;
  const pendingCount = properties.filter((p) => p.status !== "verified").length;
  const verifiedCount = properties.filter((p) => p.status === "verified").length;

  const renderBadge = (active: boolean, icon: string, label: string) => (
    <View style={[styles.statusBadge, active ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
      <FontAwesome5
        name={icon}
        size={12}
        color={active ? "#065F46" : "#94A3B8"}
      />
      <Text
        style={[
          styles.statusBadgeTxt,
          active ? { color: "#065F46" } : { color: "#64748B" },
        ]}
      >
        {label}
      </Text>
      {active ? (
        <MaterialIcons name="check-circle" size={14} color="#059669" style={{ marginLeft: "auto" }} />
      ) : (
        <MaterialIcons name="radio-button-unchecked" size={14} color="#CBD5E1" style={{ marginLeft: "auto" }} />
      )}
    </View>
  );

  const formatPrice = (rawPrice: number) => {
    if (!rawPrice) return "₹45.00 Lakh";
    if (rawPrice >= 10000000) return `₹${(rawPrice / 10000000).toFixed(2)} Cr`;
    if (rawPrice >= 100000) return `₹${(rawPrice / 100000).toFixed(2)} Lakh`;
    return `₹${rawPrice.toLocaleString("en-IN")}`;
  };

  return (
    <View style={styles.screen}>
      {/* Universal App Header with matching navigation */}
      <AppHeader
        title={t(language, "my_prop_page_title") || "My Property Listings"}
        subtitle={
          t(language, "my_prop_subtitle") ||
          "Manage listings, track legal verification reports, and review buyer offers"
        }
        showBack={true}
        fallbackRoute="/search"
        showPostPropertyBtn={true}
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrap}>
          {/* ================= 1. TOP STATS OVERVIEW CARDS ================= */}
          <View style={styles.statsRow}>
            {/* Stat 1: Total Listed */}
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: "#E6F4EA" }]}>
                <MaterialIcons name="domain" size={22} color="#059669" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statNumber}>{totalCount}</Text>
                <Text style={styles.statLabel}>
                  {t(language, "my_prop_stat_total") || "Total Listed"}
                </Text>
              </View>
            </View>

            {/* Stat 2: Under Verification */}
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: "#FFFBEB" }]}>
                <MaterialIcons name="hourglass-top" size={22} color="#D97706" />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statNumber, { color: "#D97706" }]}>{pendingCount}</Text>
                <Text style={styles.statLabel}>
                  {t(language, "my_prop_stat_pending") || "Under Verification"}
                </Text>
              </View>
            </View>

            {/* Stat 3: Verified & Live */}
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: "#ECFDF5" }]}>
                <MaterialIcons name="verified-user" size={22} color="#059669" />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statNumber, { color: "#059669" }]}>{verifiedCount}</Text>
                <Text style={styles.statLabel}>
                  {t(language, "my_prop_stat_verified") || "Verified & Live"}
                </Text>
              </View>
            </View>

            {/* Stat 4: Active Offers */}
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: "#F0FDF4" }]}>
                <MaterialIcons name="local-offer" size={22} color="#16A34A" />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statNumber, { color: "#16A34A" }]}>3</Text>
                <Text style={styles.statLabel}>
                  {t(language, "my_prop_stat_offers") || "Active Offers"}
                </Text>
              </View>
            </View>
          </View>

          {/* ================= 2. FILTER TABS & ACTIONS ROW ================= */}
          <View style={styles.filterRow}>
            <View style={styles.tabsPillGroup}>
              {/* All Listings Tab */}
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === "all" && styles.tabBtnActive]}
                onPress={() => setActiveTab("all")}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabBtnText, activeTab === "all" && styles.tabBtnTextActive]}>
                  {t(language, "my_prop_tab_all") || "All Listings"} ({totalCount})
                </Text>
              </TouchableOpacity>

              {/* Under Verification Tab */}
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === "pending" && styles.tabBtnActive]}
                onPress={() => setActiveTab("pending")}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabBtnText, activeTab === "pending" && styles.tabBtnTextActive]}>
                  {t(language, "my_prop_tab_pending") || "Under Verification"} ({pendingCount})
                </Text>
              </TouchableOpacity>

              {/* Verified Tab */}
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === "verified" && styles.tabBtnActive]}
                onPress={() => setActiveTab("verified")}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabBtnText, activeTab === "verified" && styles.tabBtnTextActive]}>
                  {t(language, "my_prop_tab_verified") || "Verified & Live"} ({verifiedCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right Action: + Post Another Land */}
            <TouchableOpacity
              style={styles.postNewBtn}
              onPress={() => router.push("/listing/create")}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.postNewBtnText}>
                {t(language, "post_land_free") || "Post Land (Free)"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================= 3. PROPERTY LISTINGS GRID ================= */}
          {loading ? (
            <View style={styles.loaderCenter}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={{ marginTop: 12, color: "#64748B", fontWeight: "600" }}>
                Loading your property listings...
              </Text>
            </View>
          ) : filteredProperties.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <MaterialIcons name="domain-disabled" size={38} color="#94A3B8" />
              </View>
              <Text style={styles.emptyHeading}>
                {t(language, "my_properties_empty") || "No properties found in this category"}
              </Text>
              <Text style={styles.emptySubText}>
                {t(language, "my_properties_empty_sub") ||
                  "Post your plot to get platform-assisted verification and connect directly with genuine buyers."}
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => router.push("/listing/create")}
                activeOpacity={0.85}
              >
                <MaterialIcons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.emptyActionBtnText}>
                  {t(language, "post_land_free") || "Post Land (Free)"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.propertiesGrid}>
              {filteredProperties.map((item) => {
                const isVerified = item.status === "verified";
                const imageUri =
                  item.media?.photos?.[0] ||
                  item.image ||
                  "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80";
                const priceStr = formatPrice(Number(item.price) || 0);
                const areaVal = item.sellableArea || item.totalArea || item.area || 2400;
                const katthaVal = (Number(areaVal) / 1361.25).toFixed(2);
                const ratePerSqFt =
                  item.ratePerSqFt || Math.round(Number(item.price || 4500000) / Number(areaVal));

                return (
                  <View key={item.id || item._id} style={styles.propertyCard}>
                    {/* Card Media Header with Overlays */}
                    <View style={styles.cardMediaHeader}>
                      <Image source={{ uri: imageUri }} style={styles.propertyImage} resizeMode="cover" />

                      {/* Overlay: Top-Left Plot ID */}
                      <View style={styles.plotIdBadge}>
                        <MaterialIcons name="tag" size={12} color="#FFFFFF" />
                        <Text style={styles.plotIdText}>ID: #{item.id?.substring(0, 8) || "MLS-8291"}</Text>
                      </View>

                      {/* Overlay: Top-Right Verification Status Pill */}
                      <View style={[styles.statusPill, isVerified ? styles.statusPillVerified : styles.statusPillPending]}>
                        <MaterialIcons
                          name={isVerified ? "verified" : "hourglass-top"}
                          size={14}
                          color="#FFFFFF"
                        />
                        <Text style={styles.statusPillText}>
                          {isVerified ? "Published & Live" : "Under Verification"}
                        </Text>
                      </View>

                      {/* Overlay: Bottom-Left Dimension Tag */}
                      <View style={styles.dimensionTag}>
                        <MaterialIcons name="straighten" size={13} color="#FFFFFF" />
                        <Text style={styles.dimensionTagText}>
                          {item.dimensions || "40 x 60 ft"} • {areaVal} sq.ft
                        </Text>
                      </View>

                      {/* Overlay: Bottom-Right Earth Tag */}
                      <View style={styles.earthTag}>
                        <MaterialIcons name="satellite-alt" size={13} color="#FFFFFF" />
                        <Text style={styles.earthTagText}>Google Earth Live</Text>
                      </View>
                    </View>

                    {/* Card Content Details */}
                    <View style={styles.cardContent}>
                      {/* Price & Unit Rate Row */}
                      <View style={styles.priceRow}>
                        <View>
                          <Text style={styles.priceMain}>{priceStr}</Text>
                          <Text style={styles.rateSub}>₹{ratePerSqFt.toLocaleString("en-IN")} / sq.ft</Text>
                        </View>
                        <View style={styles.dateBadge}>
                          <MaterialIcons name="schedule" size={13} color="#64748B" />
                          <Text style={styles.dateBadgeText}>{item.date || "Listed: 12 Sep 2026"}</Text>
                        </View>
                      </View>

                      {/* Property Title */}
                      <Text style={styles.propertyTitle} numberOfLines={1}>
                        {item.title || "Prime Land Plot in Patna, Bihar"}
                      </Text>

                      {/* Location & Specs Row */}
                      <View style={styles.specsRow}>
                        <View style={styles.specItem}>
                          <MaterialIcons name="place" size={15} color="#059669" />
                          <Text style={styles.specItemText}>
                            {item.location?.district || "Patna"}, {item.location?.state || "Bihar"}
                          </Text>
                        </View>
                        <View style={styles.specDot} />
                        <View style={styles.specItem}>
                          <MaterialIcons name="crop-free" size={15} color="#059669" />
                          <Text style={styles.specItemText}>
                            {areaVal} sq.ft ({katthaVal} Kattha)
                          </Text>
                        </View>
                        {item.khata && (
                          <>
                            <View style={styles.specDot} />
                            <View style={styles.specItem}>
                              <MaterialIcons name="description" size={15} color="#059669" />
                              <Text style={styles.specItemText}>
                                Khata: {item.khata} • Khesra: {item.khesra || "582"}
                              </Text>
                            </View>
                          </>
                        )}
                      </View>

                      {/* Divider */}
                      <View style={styles.cardDivider} />

                      {/* 4-Stage Verification Milestone Section */}
                      <View style={styles.milestoneSection}>
                        <View style={styles.milestoneHeader}>
                          <Text style={styles.milestoneTitle}>
                            {t(language, "my_prop_four_stage") || "4-Stage Verification Status"}
                          </Text>
                          <Text style={styles.milestoneSubtitle}>
                            {isVerified ? "4 of 4 Complete (100%)" : "2 of 4 Complete (50%)"}
                          </Text>
                        </View>

                        {/* Thin Progress Track */}
                        <View style={styles.verifTrack}>
                          <View style={[styles.verifBar, { width: isVerified ? "100%" : "50%" }]} />
                        </View>

                        {/* 4 Milestone Badges */}
                        <View style={styles.milestoneGrid}>
                          {renderBadge(
                            item.badges?.identity ?? true,
                            "id-card",
                            t(language, "my_prop_kyc") || "Owner KYC"
                          )}
                          {renderBadge(
                            item.badges?.documents ?? true,
                            "file-contract",
                            t(language, "my_prop_docs") || "Documents"
                          )}
                          {renderBadge(
                            item.badges?.site ?? isVerified,
                            "map-marked-alt",
                            t(language, "my_prop_site") || "Site Visit"
                          )}
                          {renderBadge(
                            item.badges?.lawyer ?? isVerified,
                            "gavel",
                            t(language, "my_prop_lawyer") || "Lawyer"
                          )}
                        </View>
                      </View>

                      {/* Action Buttons Row */}
                      <View style={styles.actionsFooterRow}>
                        {/* Primary View Details Button */}
                        <TouchableOpacity
                          style={styles.btnPrimaryDetails}
                          onPress={() => router.push(`/property/${item.id || item._id || "prop_1"}`)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.btnPrimaryDetailsText}>
                            {t(language, "my_prop_btn_details") || "View Full Details & Offers"}
                          </Text>
                          <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* Secondary Quick Action: Document Vault */}
                        <TouchableOpacity
                          style={styles.btnSecondaryMint}
                          onPress={() => router.push(`/property/${item.id || item._id || "prop_1"}`)}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons name="folder-shared" size={16} color="#065F46" />
                          <Text style={styles.btnSecondaryMintText}>
                            {t(language, "my_prop_btn_vault") || "Vault"}
                          </Text>
                        </TouchableOpacity>

                        {/* Tertiary Quick Action: Boundary Map */}
                        <TouchableOpacity
                          style={styles.btnSecondaryMint}
                          onPress={() => router.push("/listing/create")}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons name="map" size={16} color="#065F46" />
                          <Text style={styles.btnSecondaryMintText}>
                            {t(language, "my_prop_btn_boundary") || "Map"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* ================= 4. WANT TO LIST ANOTHER PLOT? BANNER ================= */}
          <View style={styles.calloutBanner}>
            <View style={styles.calloutLeft}>
              <View style={styles.calloutIconCircle}>
                <MaterialIcons name="add-location-alt" size={26} color="#059669" />
              </View>
              <View style={{ flex: 1, minWidth: 260 }}>
                <Text style={styles.calloutTitle}>
                  {t(language, "my_prop_banner_title") || "Want to list another land parcel?"}
                </Text>
                <Text style={styles.calloutSub}>
                  {t(language, "my_prop_banner_sub") ||
                    "Post your plot boundary directly to verified buyers with 0% brokerage."}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.calloutBtn}
              onPress={() => router.push("/listing/create")}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.calloutBtnText}>
                {t(language, "my_prop_btn_post") || "Post Another Land"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    paddingBottom: 60,
  },
  contentWrap: {
    maxWidth: 1480,
    width: "98%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  /* Top Stats Overview */
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statInfo: {
    justifyContent: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },

  /* Filter Tabs & Right Action */
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  tabsPillGroup: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 4,
    borderRadius: 9999,
    gap: 4,
  },
  tabBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#64748B",
  },
  tabBtnTextActive: {
    color: "#065F46",
    fontWeight: "800",
  },
  postNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 9999,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  postNewBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
  },

  /* Property Listings Grid */
  propertiesGrid: {
    gap: 20,
  },
  propertyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMediaHeader: {
    height: 220,
    width: "100%",
    position: "relative",
    backgroundColor: "#1E293B",
  },
  propertyImage: {
    width: "100%",
    height: "100%",
  },
  plotIdBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  plotIdText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  statusPill: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  statusPillPending: {
    backgroundColor: "#D97706",
  },
  statusPillVerified: {
    backgroundColor: "#059669",
  },
  statusPillText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "800",
  },
  dimensionTag: {
    position: "absolute",
    bottom: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dimensionTagText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700",
  },
  earthTag: {
    position: "absolute",
    bottom: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(6, 95, 70, 0.88)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(167, 243, 208, 0.3)",
  },
  earthTagText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  /* Card Content */
  cardContent: {
    padding: 22,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  priceMain: {
    fontSize: 24,
    fontWeight: "900",
    color: "#065F46",
    letterSpacing: -0.5,
  },
  rateSub: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F1F5F9",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  dateBadgeText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#475569",
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  specsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  specItemText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  specDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 16,
  },

  /* 4-Stage Verification Milestone Section */
  milestoneSection: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
  },
  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  milestoneSubtitle: {
    fontSize: 11.5,
    color: "#059669",
    fontWeight: "700",
  },
  verifTrack: {
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 9999,
    overflow: "hidden",
    marginBottom: 12,
  },
  verifBar: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 9999,
  },
  milestoneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 150,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  statusBadgeActive: {
    backgroundColor: "#E6F4EA",
    borderColor: "#A7F3D0",
  },
  statusBadgeInactive: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  statusBadgeTxt: {
    fontSize: 11.5,
    fontWeight: "700",
  },

  /* Action Buttons Row */
  actionsFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  btnPrimaryDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#059669",
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 9999,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
    flex: 1,
    minWidth: 220,
  },
  btnPrimaryDetailsText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  btnSecondaryMint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E6F4EA",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  btnSecondaryMintText: {
    color: "#065F46",
    fontSize: 12.5,
    fontWeight: "800",
  },

  /* Bottom Callout Banner */
  calloutBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    padding: 20,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  calloutLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 280,
  },
  calloutIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E6F4EA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  calloutSub: {
    fontSize: 12.5,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 18,
  },
  calloutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 9999,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  calloutBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  /* Empty State */
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptySubText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    maxWidth: 380,
    lineHeight: 19,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    marginTop: 20,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyActionBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
  },
  loaderCenter: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});
