import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { propertyService } from "../../src/services/propertyService";
import { MaterialIcons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import { useLanguageStore } from "../../src/store/languageStore";
import { t } from "../../src/i18n/translations";

const heroBgImg = require("../../assets/my_listings_hero_bg.png");
const defaultAerialPhoto = require("../../assets/plot_patna_aerial.jpg");

const DUMMY_MY_PROPERTIES = [
  {
    id: "prop_1",
    title: "Prime Land Plot in Patna, Bihar",
    location: { district: "Patna", state: "Bihar", area: "Patna" },
    sellableArea: 2400,
    price: 4500000,
    ratePerSqFt: 1875,
    khata: "104",
    khesra: "582",
    dimensions: "40 x 60 ft",
    roadWidth: "40 ft Road",
    media: { photos: [require("../../assets/plot_patna_aerial.jpg")] },
    status: "pending",
    date: "12 Sep 2026",
    offersCount: 3,
    highestOffer: "₹44.50 L",
    badges: { identity: true, documents: true, site: false, lawyer: false },
  },
];

export default function MyPropertiesScreen() {
  const router = useRouter();
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

  const formatPrice = (rawPrice: number) => {
    if (!rawPrice) return "₹45.00 Lakh";
    if (rawPrice >= 10000000) return `₹${(rawPrice / 10000000).toFixed(2)} Cr`;
    if (rawPrice >= 100000) return `₹${(rawPrice / 100000).toFixed(2)} Lakh`;
    return `₹${rawPrice.toLocaleString("en-IN")}`;
  };

  return (
    <View style={styles.screen}>
      {/* Universal Brand AppHeader matching all pages */}
      <AppHeader
        showBack={false}
        showNavLinks={true}
        showLanguageToggle={true}
        showPostPropertyBtn={true}
      />

      {/* Scenic Countryside Background from user upload */}
      <View style={styles.scenicBackgroundWrap} pointerEvents="none">
        <Image
          source={heroBgImg}
          style={styles.scenicBackgroundImage}
          resizeMode="cover"
        />
        <View style={styles.scenicBackgroundOverlay} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Centered Compact Column (maxWidth: 720, pixel-to-pixel matching mockup) */}
        <View style={styles.container}>
          {/* ================= PAGE HEADER SECTION ================= */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderRow}>
              <View style={{ flex: 1, minWidth: 260 }}>
                <Text style={styles.pageTitle}>
                  {t(language, "my_prop_page_title") || "My Property Listings"}
                </Text>
                <Text style={styles.pageSubtitle}>
                  {t(language, "my_prop_subtitle") ||
                    "Manage listings, track legal verification reports, and review buyer offers"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.headerPostBtn}
                onPress={() => router.push("/listing/create")}
                activeOpacity={0.85}
              >
                <MaterialIcons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.headerPostBtnText}>
                  {t(language, "post_land_free") || "Post Land (Free)"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= 1. COMPACT OVERVIEW METRICS ================= */}
          <View style={styles.metricsRow}>
            {/* Metric 1: Total */}
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{totalCount}</Text>
              <Text style={styles.metricLabel}>{t(language, "my_prop_stat_total") || "Total Listed"}</Text>
            </View>

            {/* Metric 2: Pending */}
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: "#D97706" }]}>{pendingCount}</Text>
              <Text style={styles.metricLabel}>{t(language, "my_prop_stat_pending") || "Under Verification"}</Text>
            </View>

            {/* Metric 3: Verified */}
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: "#059669" }]}>{verifiedCount}</Text>
              <Text style={styles.metricLabel}>{t(language, "my_prop_stat_verified") || "Verified & Live"}</Text>
            </View>

            {/* Metric 4: Active Offers */}
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: "#2563EB" }]}>3</Text>
              <Text style={styles.metricLabel}>{t(language, "my_prop_stat_offers") || "Active Offers"}</Text>
            </View>
          </View>

          {/* ================= 2. FILTER TABS ================= */}
          <View style={styles.filterSection}>
            <View style={styles.filterPills}>
              <TouchableOpacity
                style={[styles.filterPill, activeTab === "all" && styles.filterPillActive]}
                onPress={() => setActiveTab("all")}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, activeTab === "all" && styles.filterPillTextActive]}>
                  {t(language, "my_prop_tab_all") || "All Listings"} ({totalCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeTab === "pending" && styles.filterPillActive]}
                onPress={() => setActiveTab("pending")}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, activeTab === "pending" && styles.filterPillTextActive]}>
                  {t(language, "my_prop_tab_pending") || "Under Verification"} ({pendingCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeTab === "verified" && styles.filterPillActive]}
                onPress={() => setActiveTab("verified")}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, activeTab === "verified" && styles.filterPillTextActive]}>
                  {t(language, "my_prop_tab_verified") || "Verified & Live"} ({verifiedCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= 3. PROPERTY LISTINGS ================= */}
          {loading ? (
            <View style={styles.loaderCenter}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={{ marginTop: 12, color: "#64748B", fontSize: 13, fontWeight: "500" }}>
                Loading properties...
              </Text>
            </View>
          ) : filteredProperties.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <MaterialIcons name="landscape" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyHeading}>
                {t(language, "my_properties_empty") || "No properties listed yet"}
              </Text>
              <Text style={styles.emptySubText}>
                {t(language, "my_properties_empty_sub") ||
                  "Post your land parcel to get verified and receive direct buyer inquiries."}
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push("/listing/create")}
                activeOpacity={0.85}
              >
                <MaterialIcons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.emptyBtnText}>
                  {t(language, "post_land_free") || "Post Land (Free)"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {filteredProperties.map((item) => {
                const isVerified = item.status === "verified";
                const imageSource =
                  item.media?.photos?.[0] || defaultAerialPhoto;
                const priceStr = formatPrice(Number(item.price) || 4500000);
                const areaVal = item.sellableArea || item.totalArea || item.area || 2400;
                const katthaVal = (Number(areaVal) / 1361.25).toFixed(2);
                const ratePerSqFt =
                  item.ratePerSqFt || Math.round(Number(item.price || 4500000) / Number(areaVal));

                return (
                  <View key={item.id || item._id} style={styles.card}>
                    {/* Natural Photographic Thumbnail (Matching Mockup) */}
                    <View style={styles.mediaWrap}>
                      <Image
                        source={typeof imageSource === "string" ? { uri: imageSource } : imageSource}
                        style={styles.cardImg}
                        resizeMode="cover"
                      />

                      {/* Status Badge: In Verification (Amber) or Verified & Live (Green) */}
                      <View style={[styles.statusBadge, isVerified ? styles.statusBadgeVerified : styles.statusBadgePending]}>
                        <MaterialIcons
                          name={isVerified ? "verified" : "hourglass-top"}
                          size={13}
                          color="#FFFFFF"
                        />
                        <Text style={styles.statusBadgeText}>
                          {isVerified
                            ? language === "hi" ? "सत्यापित एवं लाइव" : "Verified & Live"
                            : language === "hi" ? "सत्यापन प्रक्रिया में" : "In Verification"}
                        </Text>
                      </View>

                      {/* Clean Property Type Tag: LAND */}
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>
                          {item.type ? item.type.toUpperCase() : "LAND"}
                        </Text>
                      </View>
                    </View>

                    {/* Card Content Details */}
                    <View style={styles.cardBody}>
                      {/* Price & Date Row */}
                      <View style={styles.priceRow}>
                        <View style={styles.priceCol}>
                          <Text style={styles.priceMain}>{priceStr}</Text>
                          <Text style={styles.priceSub}>₹{ratePerSqFt.toLocaleString("en-IN")} / sq.ft</Text>
                        </View>
                        <View style={styles.dateChip}>
                          <MaterialIcons name="schedule" size={13} color="#64748B" />
                          <Text style={styles.dateChipText}>{item.date || "12 Sep 2026"}</Text>
                        </View>
                      </View>

                      {/* Title */}
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title || "Prime Land Plot in Patna, Bihar"}
                      </Text>

                      {/* Location & Area Specs */}
                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <MaterialIcons name="place" size={14} color="#059669" />
                          <Text style={styles.metaText} numberOfLines={1}>
                            {item.location?.district || "Patna"}
                          </Text>
                        </View>
                        <View style={styles.metaDot} />
                        <View style={styles.metaItem}>
                          <MaterialIcons name="straighten" size={14} color="#059669" />
                          <Text style={styles.metaText}>
                            {areaVal} sq.ft ({katthaVal} Kattha)
                          </Text>
                        </View>
                      </View>

                      {/* 4-Pillar Verification Trust Strip */}
                      <View style={styles.trustStrip}>
                        <View style={[styles.trustPill, styles.trustPillComplete]}>
                          <MaterialIcons name="check-circle" size={12} color="#059669" />
                          <Text style={styles.trustPillCompleteText}>
                            {t(language, "my_prop_kyc") || "Owner KYC"}
                          </Text>
                        </View>

                        <View style={[styles.trustPill, styles.trustPillComplete]}>
                          <MaterialIcons name="check-circle" size={12} color="#059669" />
                          <Text style={styles.trustPillCompleteText}>
                            {t(language, "my_prop_docs") || "Documents"}
                          </Text>
                        </View>

                        <View style={[styles.trustPill, isVerified ? styles.trustPillComplete : styles.trustPillPending]}>
                          <MaterialIcons
                            name={isVerified ? "check-circle" : "radio-button-unchecked"}
                            size={12}
                            color={isVerified ? "#059669" : "#94A3B8"}
                          />
                          <Text style={isVerified ? styles.trustPillCompleteText : styles.trustPillPendingText}>
                            {t(language, "my_prop_site") || "GPS Site Visit"}
                          </Text>
                        </View>

                        <View style={[styles.trustPill, isVerified ? styles.trustPillComplete : styles.trustPillPending]}>
                          <MaterialIcons
                            name={isVerified ? "check-circle" : "radio-button-unchecked"}
                            size={12}
                            color={isVerified ? "#059669" : "#94A3B8"}
                          />
                          <Text style={isVerified ? styles.trustPillCompleteText : styles.trustPillPendingText}>
                            {t(language, "my_prop_lawyer") || "Legal / Lawyer"}
                          </Text>
                        </View>
                      </View>

                      {/* Action Buttons Row */}
                      <View style={styles.cardActions}>
                        {/* Primary View Details Button */}
                        <TouchableOpacity
                          style={styles.primaryActionBtn}
                          onPress={() => router.push(`/property/${item.id || item._id || "prop_1"}`)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.primaryActionBtnText}>
                            {t(language, "my_prop_btn_details") || "View Full Details & Offers"}
                          </Text>
                          <MaterialIcons name="arrow-forward" size={15} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* Secondary Actions: Document Vault & Boundary Map */}
                        <View style={styles.secondaryActions}>
                          <TouchableOpacity
                            style={styles.mintActionBtn}
                            onPress={() => router.push(`/property/${item.id || item._id || "prop_1"}`)}
                            activeOpacity={0.8}
                          >
                            <MaterialIcons name="folder-shared" size={14} color="#065F46" />
                            <Text style={styles.mintActionBtnText}>
                              {t(language, "my_prop_btn_vault") || "Document Vault"}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.mintActionBtn}
                            onPress={() => router.push("/listing/create")}
                            activeOpacity={0.8}
                          >
                            <MaterialIcons name="map" size={14} color="#065F46" />
                            <Text style={styles.mintActionBtnText}>
                              {t(language, "my_prop_btn_boundary") || "Boundary Map"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    position: "relative",
  },
  scenicBackgroundWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 310,
    overflow: "hidden",
    zIndex: 0,
  },
  scenicBackgroundImage: {
    width: "100%",
    height: "100%",
    opacity: 0.88,
  },
  scenicBackgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(248, 250, 252, 0.76)",
  },
  scrollContainer: {
    paddingBottom: 60,
    zIndex: 1,
  },
  /* Compact Centered Container (maxWidth: 720, pixel-to-pixel matching mockup) */
  container: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  /* Page Header Section */
  pageHeader: {
    marginBottom: 18,
  },
  pageHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 18,
  },
  headerPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#059669",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  headerPostBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
  },

  /* 1. Compact Overview Metrics */
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  metricValue: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 23,
  },
  metricLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },

  /* 2. Filter Pills */
  filterSection: {
    marginBottom: 16,
  },
  filterPills: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 3,
    borderRadius: 9999,
    gap: 3,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  filterPillActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
  },
  filterPillTextActive: {
    color: "#065F46",
    fontWeight: "700",
  },

  /* 3. Cards List */
  cardsList: {
    gap: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  mediaWrap: {
    height: 195,
    width: "100%",
    position: "relative",
    backgroundColor: "#0F172A",
  },
  cardImg: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  statusBadgePending: {
    backgroundColor: "#D97706",
  },
  statusBadgeVerified: {
    backgroundColor: "#059669",
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  typeBadge: {
    position: "absolute",
    bottom: 10,
    left: 12,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  /* Card Body */
  cardBody: {
    padding: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  priceCol: {},
  priceMain: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  priceSub: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "transparent",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  dateChipText: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
    marginBottom: 6,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#94A3B8",
    marginHorizontal: 2,
  },

  /* Trust Strip */
  trustStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  trustPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    borderRadius: 9999,
    borderWidth: 1,
  },
  trustPillComplete: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  trustPillCompleteText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  trustPillPending: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  trustPillPendingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },

  /* Actions */
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingVertical: 8.5,
    paddingHorizontal: 16,
    borderRadius: 9999,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  secondaryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mintActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#E6F4EA",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingVertical: 7.5,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  mintActionBtnText: {
    color: "#065F46",
    fontSize: 11.5,
    fontWeight: "700",
  },

  /* Empty State */
  loaderCenter: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
});
