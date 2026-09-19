import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInput,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { propertyService } from "../../src/services/propertyService";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import { useLanguageStore } from "../../src/store/languageStore";
import { t } from "../../src/i18n/translations";

const heroBgImg = require("../../assets/my_listings_hero_bg.png");
const boostBgImg = require("../../assets/verification_boost_bg.png");
const defaultAerialPhoto = require("../../assets/plot_patna_aerial.jpg");

const DUMMY_MY_PROPERTIES = [
  {
    id: "prop_1",
    idCode: "MSE00123",
    title: "Prime Land Plot in Patna, Bihar",
    location: { district: "Patna", state: "Bihar", area: "Danapur, Patna, Bihar" },
    sellableArea: 2400,
    price: 4500000,
    ratePerSqFt: 1875,
    dimensions: "40 x 60 ft",
    roadWidth: "40 ft Road",
    facing: "East Facing",
    type: "LAND",
    category: "Residential",
    media: { photos: [defaultAerialPhoto] },
    photosCount: 8,
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
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "verified" | "inactive">("all");
  const [activeSidebarNav, setActiveSidebarNav] = useState<string>("listings");
  const [searchQuery, setSearchQuery] = useState("");

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
    if (activeTab === "inactive") return p.status === "inactive";
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.location?.area?.toLowerCase().includes(q) ||
        p.location?.district?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCount = properties.length;
  const pendingCount = properties.filter((p) => p.status !== "verified").length;
  const verifiedCount = properties.filter((p) => p.status === "verified").length;
  const inactiveCount = properties.filter((p) => p.status === "inactive").length;

  const formatPrice = (rawPrice: number) => {
    if (!rawPrice) return "₹45.00 Lakh";
    if (rawPrice >= 10000000) return `₹${(rawPrice / 10000000).toFixed(2)} Cr`;
    if (rawPrice >= 100000) return `₹${(rawPrice / 100000).toFixed(2)} Lakh`;
    return `₹${rawPrice.toLocaleString("en-IN")}`;
  };

  return (
    <View style={styles.screen}>
      {/* Universal Brand AppHeader navbar */}
      <AppHeader
        showBack={false}
        showNavLinks={true}
        showLanguageToggle={true}
        showPostPropertyBtn={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
          {/* ================= LEFT EXECUTIVE SIDEBAR ================= */}
          {isDesktop && (
            <View style={styles.sidebar}>
              {/* Navigation Menu List */}
              <View style={styles.sidebarMenu}>
                {/* Dashboard */}
                <TouchableOpacity
                  style={[styles.sidebarNavItem, activeSidebarNav === "dashboard" && styles.sidebarNavItemActive]}
                  onPress={() => setActiveSidebarNav("dashboard")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="space-dashboard"
                    size={18}
                    color={activeSidebarNav === "dashboard" ? "#065F46" : "#64748B"}
                  />
                  <Text style={[styles.sidebarNavText, activeSidebarNav === "dashboard" && styles.sidebarNavTextActive]}>
                    {language === "hi" ? "डैशबोर्ड" : "Dashboard"}
                  </Text>
                </TouchableOpacity>

                {/* My Listings (Active) */}
                <TouchableOpacity
                  style={[styles.sidebarNavItem, activeSidebarNav === "listings" && styles.sidebarNavItemActive]}
                  onPress={() => setActiveSidebarNav("listings")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="grid-view"
                    size={18}
                    color={activeSidebarNav === "listings" ? "#065F46" : "#64748B"}
                  />
                  <Text style={[styles.sidebarNavText, activeSidebarNav === "listings" && styles.sidebarNavTextActive]}>
                    {language === "hi" ? "मेरी लिस्टिंग" : "My Listings"}
                  </Text>
                  <View style={styles.sidebarBadgeActive}>
                    <Text style={styles.sidebarBadgeTextActive}>1</Text>
                  </View>
                </TouchableOpacity>

                {/* Messages */}
                <TouchableOpacity
                  style={[styles.sidebarNavItem, activeSidebarNav === "messages" && styles.sidebarNavItemActive]}
                  onPress={() => {
                    setActiveSidebarNav("messages");
                    router.push("/messages");
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="chat-bubble-outline"
                    size={18}
                    color={activeSidebarNav === "messages" ? "#065F46" : "#64748B"}
                  />
                  <Text style={[styles.sidebarNavText, activeSidebarNav === "messages" && styles.sidebarNavTextActive]}>
                    {language === "hi" ? "संदेश" : "Messages"}
                  </Text>
                  <View style={styles.sidebarBadge}>
                    <Text style={styles.sidebarBadgeText}>3</Text>
                  </View>
                </TouchableOpacity>

                {/* Offers */}
                <TouchableOpacity
                  style={[styles.sidebarNavItem, activeSidebarNav === "offers" && styles.sidebarNavItemActive]}
                  onPress={() => setActiveSidebarNav("offers")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="local-offer"
                    size={18}
                    color={activeSidebarNav === "offers" ? "#065F46" : "#64748B"}
                  />
                  <Text style={[styles.sidebarNavText, activeSidebarNav === "offers" && styles.sidebarNavTextActive]}>
                    {language === "hi" ? "ऑफ़र" : "Offers"}
                  </Text>
                  <View style={styles.sidebarBadge}>
                    <Text style={styles.sidebarBadgeText}>3</Text>
                  </View>
                </TouchableOpacity>

                {/* Verification */}
                <TouchableOpacity
                  style={[styles.sidebarNavItem, activeSidebarNav === "verification" && styles.sidebarNavItemActive]}
                  onPress={() => setActiveSidebarNav("verification")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="verified-user"
                    size={18}
                    color={activeSidebarNav === "verification" ? "#065F46" : "#64748B"}
                  />
                  <Text style={[styles.sidebarNavText, activeSidebarNav === "verification" && styles.sidebarNavTextActive]}>
                    {language === "hi" ? "सत्यापन" : "Verification"}
                  </Text>
                  <View style={styles.sidebarBadge}>
                    <Text style={styles.sidebarBadgeText}>1</Text>
                  </View>
                </TouchableOpacity>

                {/* Documents */}
                <TouchableOpacity
                  style={[styles.sidebarNavItem, activeSidebarNav === "documents" && styles.sidebarNavItemActive]}
                  onPress={() => setActiveSidebarNav("documents")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="description"
                    size={18}
                    color={activeSidebarNav === "documents" ? "#065F46" : "#64748B"}
                  />
                  <Text style={[styles.sidebarNavText, activeSidebarNav === "documents" && styles.sidebarNavTextActive]}>
                    {language === "hi" ? "दस्तावेज़" : "Documents"}
                  </Text>
                </TouchableOpacity>

                {/* Analytics */}
                <TouchableOpacity
                  style={[styles.sidebarNavItem, activeSidebarNav === "analytics" && styles.sidebarNavItemActive]}
                  onPress={() => setActiveSidebarNav("analytics")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="bar-chart"
                    size={18}
                    color={activeSidebarNav === "analytics" ? "#065F46" : "#64748B"}
                  />
                  <Text style={[styles.sidebarNavText, activeSidebarNav === "analytics" && styles.sidebarNavTextActive]}>
                    {language === "hi" ? "एनालिटिक्स" : "Analytics"}
                  </Text>
                </TouchableOpacity>

                {/* Settings */}
                <TouchableOpacity
                  style={[styles.sidebarNavItem, activeSidebarNav === "settings" && styles.sidebarNavItemActive]}
                  onPress={() => setActiveSidebarNav("settings")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="settings"
                    size={18}
                    color={activeSidebarNav === "settings" ? "#065F46" : "#64748B"}
                  />
                  <Text style={[styles.sidebarNavText, activeSidebarNav === "settings" && styles.sidebarNavTextActive]}>
                    {language === "hi" ? "सेटिंग्स" : "Settings"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sidebar Mini Promo Card: Grow with MalikSe */}
              <View style={styles.sidebarPromoCard}>
                <View style={styles.sidebarPromoIconCircle}>
                  <MaterialIcons name="eco" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sidebarPromoTitle}>Grow with MalikSe</Text>
                  <Text style={styles.sidebarPromoSubtitle}>
                    More visibility.{"\n"}More genuine buyers.
                  </Text>
                </View>
                <TouchableOpacity style={styles.sidebarPromoBtn} activeOpacity={0.8}>
                  <MaterialIcons name="arrow-forward" size={14} color="#059669" />
                </TouchableOpacity>
              </View>

              {/* Sidebar Bottom Landscape Contour Graphic */}
              <View style={styles.sidebarFooterGraphicWrap}>
                {Platform.OS === "web" ? (
                  <svg
                    viewBox="0 0 220 90"
                    width="100%"
                    height="90"
                    style={{ display: "block" }}
                  >
                    <defs>
                      <linearGradient id="sideMtnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    <path d="M0,90 L0,50 Q45,25 90,45 Q135,20 180,48 Q200,42 220,55 L220,90 Z" fill="url(#sideMtnGrad)" />
                  </svg>
                ) : null}
                <View style={styles.sidebarCursiveWrap}>
                  <Text style={styles.sidebarCursiveText}>
                    Verified Land{"\n"}Brighter Tomorrows
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ================= RIGHT MAIN CONTENT AREA ================= */}
          <View style={styles.mainContent}>
            {/* 1. SCENIC HERO HEADER BANNER (With Uploaded Background) */}
            <View style={styles.heroBannerCard}>
              <Image
                source={heroBgImg}
                style={styles.heroBannerBackground}
                resizeMode="cover"
              />
              <View style={styles.heroBannerOverlay} />

              {/* Left Column: Title & Subtitle */}
              <View style={styles.heroLeftCol}>
                <Text style={styles.heroMainTitle}>
                  {t(language, "my_prop_page_title") || "My Property Listings"}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {language === "hi"
                    ? "अपनी लिस्टिंग प्रबंधित करें, सत्यापन स्थिति ट्रैक करें और खरीदार ऑफ़र देखें — सब एक जगह।"
                    : "Manage your listings, track verification status, and review buyer offers — all in one place."}
                </Text>
              </View>

              {/* Center Cursive Script */}
              <View style={styles.heroCursiveBox}>
                <Text style={styles.heroCursiveText}>
                  List Today{"\n"}Build Tomorrow
                </Text>
              </View>

              {/* Right Action Button */}
              <TouchableOpacity
                style={styles.heroPostBtn}
                onPress={() => router.push("/listing/create")}
                activeOpacity={0.85}
              >
                <MaterialIcons name="add" size={17} color="#FFFFFF" />
                <Text style={styles.heroPostBtnText}>
                  {t(language, "post_land_free") || "Post Land (Free)"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. 4 OVERVIEW KPI METRIC CARDS (Exact match to Mockup) */}
            <View style={styles.metricsRow}>
              {/* Metric 1: Total Listed */}
              <View style={styles.metricCard}>
                <View style={[styles.metricIconCircle, { backgroundColor: "#ECFDF5" }]}>
                  <MaterialIcons name="grid-view" size={18} color="#059669" />
                </View>
                <View style={styles.metricTextCol}>
                  <Text style={styles.metricValue}>{totalCount}</Text>
                  <Text style={styles.metricLabel}>{t(language, "my_prop_stat_total") || "Total Listed"}</Text>
                  <Text style={styles.metricMicroSub}>Keep going!</Text>
                </View>
              </View>

              {/* Metric 2: Under Verification */}
              <View style={styles.metricCard}>
                <View style={[styles.metricIconCircle, { backgroundColor: "#FEF3C7" }]}>
                  <MaterialIcons name="hourglass-top" size={18} color="#D97706" />
                </View>
                <View style={styles.metricTextCol}>
                  <Text style={[styles.metricValue, { color: "#D97706" }]}>{pendingCount}</Text>
                  <Text style={styles.metricLabel}>{t(language, "my_prop_stat_pending") || "Under Verification"}</Text>
                  <Text style={[styles.metricMicroSub, { color: "#D97706" }]}>In progress</Text>
                </View>
              </View>

              {/* Metric 3: Verified & Live */}
              <View style={styles.metricCard}>
                <View style={[styles.metricIconCircle, { backgroundColor: "#ECFDF5" }]}>
                  <MaterialIcons name="check-circle" size={18} color="#059669" />
                </View>
                <View style={styles.metricTextCol}>
                  <Text style={[styles.metricValue, { color: "#059669" }]}>{verifiedCount}</Text>
                  <Text style={styles.metricLabel}>{t(language, "my_prop_stat_verified") || "Verified & Live"}</Text>
                  <Text style={styles.metricMicroSub}>Will be visible soon</Text>
                </View>
              </View>

              {/* Metric 4: Active Offers */}
              <View style={styles.metricCard}>
                <View style={[styles.metricIconCircle, { backgroundColor: "#EFF6FF" }]}>
                  <MaterialIcons name="people" size={18} color="#2563EB" />
                </View>
                <View style={styles.metricTextCol}>
                  <Text style={[styles.metricValue, { color: "#2563EB" }]}>{3}</Text>
                  <Text style={styles.metricLabel}>{t(language, "my_prop_stat_offers") || "Active Offers"}</Text>
                  <Text style={styles.metricMicroSub}>Buyer interest</Text>
                </View>
              </View>
            </View>

            {/* 3. FILTER TABS & SEARCH ROW */}
            <View style={styles.controlsRow}>
              {/* Segment Pills */}
              <View style={styles.filterPillsTrack}>
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

                <TouchableOpacity
                  style={[styles.filterPill, activeTab === "inactive" && styles.filterPillActive]}
                  onPress={() => setActiveTab("inactive")}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, activeTab === "inactive" && styles.filterPillTextActive]}>
                    Inactive ({inactiveCount})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Right Side: Search Box & Filter Button */}
              <View style={styles.searchFilterGroup}>
                <View style={styles.searchBox}>
                  <MaterialIcons name="search" size={17} color="#64748B" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={language === "hi" ? "अपनी लिस्टिंग खोजें..." : "Search your listings..."}
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                <TouchableOpacity style={styles.filtersBtn} activeOpacity={0.8}>
                  <MaterialIcons name="filter-list" size={17} color="#475569" />
                  <Text style={styles.filtersBtnText}>Filters</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. THE PROPERTY LISTING CARD (Horizontal Split Layout) */}
            {loading ? (
              <View style={styles.loaderCenter}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={{ marginTop: 12, color: "#64748B", fontSize: 13, fontWeight: "500" }}>
                  Loading your properties...
                </Text>
              </View>
            ) : filteredProperties.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialIcons name="landscape" size={36} color="#94A3B8" />
                <Text style={styles.emptyHeading}>
                  {t(language, "my_properties_empty") || "No properties listed yet"}
                </Text>
                <Text style={styles.emptySubText}>
                  {t(language, "my_properties_empty_sub") ||
                    "Post your land parcel to get verified and receive direct buyer inquiries."}
                </Text>
                <TouchableOpacity
                  style={styles.heroPostBtn}
                  onPress={() => router.push("/listing/create")}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="add" size={17} color="#FFFFFF" />
                  <Text style={styles.heroPostBtnText}>
                    {t(language, "post_land_free") || "Post Land (Free)"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cardsList}>
                {filteredProperties.map((item) => {
                  const isVerified = item.status === "verified";
                  const imageSource = item.media?.photos?.[0] || defaultAerialPhoto;
                  const priceStr = formatPrice(Number(item.price) || 4500000);
                  const areaVal = item.sellableArea || item.totalArea || item.area || 2400;
                  const katthaVal = (Number(areaVal) / 1361.25).toFixed(2);
                  const ratePerSqFt =
                    item.ratePerSqFt || Math.round(Number(item.price || 4500000) / Number(areaVal));
                  const idCode = item.idCode || "MSE00123";

                  return (
                    <View key={item.id || item._id} style={styles.propertyCard}>
                      {/* Left: Photo Slider Half */}
                      <View style={styles.photoSliderHalf}>
                        <Image
                          source={typeof imageSource === "string" ? { uri: imageSource } : imageSource}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />

                        {/* Top-Left: Status Badge */}
                        <View style={[styles.statusBadge, isVerified ? styles.statusBadgeVerified : styles.statusBadgePending]}>
                          <MaterialIcons
                            name={isVerified ? "verified" : "hourglass-top"}
                            size={12}
                            color="#FFFFFF"
                          />
                          <Text style={styles.statusBadgeText}>
                            {isVerified
                              ? language === "hi" ? "सत्यापित एवं लाइव" : "Verified & Live"
                              : language === "hi" ? "सत्यापन प्रक्रिया में" : "In Verification"}
                          </Text>
                        </View>

                        {/* Left & Right Chevrons */}
                        <TouchableOpacity style={styles.sliderChevronLeft} activeOpacity={0.85}>
                          <MaterialIcons name="chevron-left" size={17} color="#0F172A" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sliderChevronRight} activeOpacity={0.85}>
                          <MaterialIcons name="chevron-right" size={17} color="#0F172A" />
                        </TouchableOpacity>

                        {/* Bottom-Left: Photo Count Pill */}
                        <View style={styles.photoCountBadge}>
                          <MaterialIcons name="photo-camera" size={11} color="#FFFFFF" />
                          <Text style={styles.photoCountText}>1 / {item.photosCount || 8}</Text>
                        </View>

                        {/* Bottom-Right: View on Map & Heart Pill */}
                        <View style={styles.photoActionOverlays}>
                          <TouchableOpacity style={styles.viewOnMapPill} activeOpacity={0.85}>
                            <MaterialIcons name="place" size={12} color="#FFFFFF" />
                            <Text style={styles.viewOnMapText}>View on Map</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.photoHeartBtn} activeOpacity={0.85}>
                            <FontAwesome5 name="heart" size={12} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Right: Details Half */}
                      <View style={styles.cardDetailsHalf}>
                        {/* Top Row: Tags & ID & Menu */}
                        <View style={styles.cardTopMetaRow}>
                          <View style={styles.cardTagsGroup}>
                            <View style={styles.landTypeTag}>
                              <Text style={styles.landTypeTagText}>{item.type || "LAND"}</Text>
                            </View>
                            <View style={styles.residentialTag}>
                              <Text style={styles.residentialTagText}>{item.category || "Residential"}</Text>
                            </View>
                          </View>

                          <View style={styles.cardIdMenuRow}>
                            <Text style={styles.cardIdText}>ID #{idCode}</Text>
                            <TouchableOpacity style={styles.moreMenuBtn} activeOpacity={0.7}>
                              <MaterialIcons name="more-vert" size={18} color="#64748B" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Title */}
                        <Text style={styles.propertyTitle} numberOfLines={1}>
                          {item.title || "Prime Land Plot in Patna, Bihar"}
                        </Text>

                        {/* Location & Area Specs */}
                        <View style={styles.locationSpecsRow}>
                          <View style={styles.specItem}>
                            <MaterialIcons name="place" size={15} color="#059669" />
                            <Text style={styles.specText}>
                              {item.location?.area || "Danapur, Patna, Bihar"}
                            </Text>
                          </View>

                          <View style={[styles.specItem, { marginLeft: 16 }]}>
                            <MaterialIcons name="straighten" size={15} color="#059669" />
                            <Text style={styles.specText}>
                              {areaVal} sq.ft ({katthaVal} Kattha)
                            </Text>
                          </View>
                        </View>

                        {/* Price & Date Row */}
                        <View style={styles.priceDateRow}>
                          <View style={styles.priceCol}>
                            <Text style={styles.mainPriceText}>{priceStr}</Text>
                            <Text style={styles.subRateText}>₹{ratePerSqFt.toLocaleString("en-IN")} / sq.ft</Text>
                          </View>

                          <View style={styles.dateTagBox}>
                            <MaterialIcons name="schedule" size={13} color="#64748B" />
                            <Text style={styles.dateTagText}>{item.date || "12 Sep 2026"}</Text>
                          </View>
                        </View>

                        {/* 4 Verification Trust Pills */}
                        <View style={styles.trustPillsRow}>
                          <View style={[styles.trustPill, styles.trustPillComplete]}>
                            <MaterialIcons name="check-circle" size={13} color="#059669" />
                            <Text style={styles.trustPillCompleteText}>Owner KYC</Text>
                          </View>

                          <View style={[styles.trustPill, styles.trustPillComplete]}>
                            <MaterialIcons name="check-circle" size={13} color="#059669" />
                            <Text style={styles.trustPillCompleteText}>Documents</Text>
                          </View>

                          <View style={[styles.trustPill, isVerified ? styles.trustPillComplete : styles.trustPillPending]}>
                            <MaterialIcons
                              name={isVerified ? "check-circle" : "radio-button-unchecked"}
                              size={13}
                              color={isVerified ? "#059669" : "#94A3B8"}
                            />
                            <Text style={isVerified ? styles.trustPillCompleteText : styles.trustPillPendingText}>
                              GPS Site Visit
                            </Text>
                          </View>

                          <View style={[styles.trustPill, isVerified ? styles.trustPillComplete : styles.trustPillPending]}>
                            <MaterialIcons
                              name={isVerified ? "check-circle" : "radio-button-unchecked"}
                              size={13}
                              color={isVerified ? "#059669" : "#94A3B8"}
                            />
                            <Text style={isVerified ? styles.trustPillCompleteText : styles.trustPillPendingText}>
                              Legal / Lawyer
                            </Text>
                          </View>
                        </View>

                        {/* Action Buttons Row */}
                        <View style={styles.cardActionsRow}>
                          {/* Primary View Details */}
                          <TouchableOpacity
                            style={styles.viewDetailsBtn}
                            onPress={() => router.push(`/property/${item.id || item._id || "prop_1"}`)}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.viewDetailsBtnText}>View Full Details & Offers</Text>
                            <MaterialIcons name="arrow-forward" size={15} color="#FFFFFF" />
                          </TouchableOpacity>

                          {/* Secondary: Document Vault */}
                          <TouchableOpacity
                            style={styles.mintBtn}
                            onPress={() => router.push(`/property/${item.id || item._id || "prop_1"}`)}
                            activeOpacity={0.8}
                          >
                            <MaterialIcons name="folder-shared" size={14} color="#065F46" />
                            <Text style={styles.mintBtnText}>Document Vault</Text>
                          </TouchableOpacity>

                          {/* Secondary: Boundary Map */}
                          <TouchableOpacity
                            style={styles.mintBtn}
                            onPress={() => router.push("/listing/create")}
                            activeOpacity={0.8}
                          >
                            <MaterialIcons name="map" size={14} color="#065F46" />
                            <Text style={styles.mintBtnText}>Boundary Map</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* 5. BOTTOM BOOSTER BANNER: Want faster verification? */}
            <View style={styles.boostBanner}>
              {/* Full container panoramic landscape background */}
              <Image
                source={boostBgImg}
                style={styles.boostBannerBackground}
                resizeMode="cover"
              />
              <View style={styles.boostBannerOverlay} />

              <View style={styles.boostBannerLeft}>
                <View style={styles.boostIconCircle}>
                  <MaterialIcons name="insights" size={20} color="#047857" />
                </View>
                <View style={styles.boostTextCol}>
                  <Text style={styles.boostTitle}>
                    {language === "hi" ? "क्या आपको त्वरित सत्यापन चाहिए?" : "Want faster verification?"}
                  </Text>
                  <Text style={styles.boostSubtitle}>
                    {language === "hi"
                      ? "अपने दस्तावेज़ पूरे करें और अपनी लिस्टिंग को लाइव करने के लिए साइट विज़िट शेड्यूल करें।"
                      : "Complete your documents and schedule a site visit to get your listing live."}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.boostActionBtn}
                onPress={() => router.push("/listing/create")}
                activeOpacity={0.85}
              >
                <Text style={styles.boostActionBtnText}>
                  {language === "hi" ? "सत्यापन पूरा करें" : "Complete Verification"}
                </Text>
                <MaterialIcons name="arrow-forward" size={15} color="#059669" />
              </TouchableOpacity>
            </View>
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
    paddingBottom: 48,
  },
  mainLayout: {
    width: "100%",
    maxWidth: 1380,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  mainLayoutDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
  },

  /* ================= LEFT SIDEBAR ================= */
  sidebar: {
    width: 220,
    backgroundColor: "transparent",
  },
  sidebarMenu: {
    gap: 4,
    marginBottom: 20,
  },
  sidebarNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
  },
  sidebarNavItemActive: {
    backgroundColor: "#E6F4EA",
  },
  sidebarNavText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    flex: 1,
  },
  sidebarNavTextActive: {
    color: "#065F46",
    fontWeight: "700",
  },
  sidebarBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 9999,
  },
  sidebarBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  sidebarBadgeActive: {
    backgroundColor: "#A7F3D0",
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 9999,
  },
  sidebarBadgeTextActive: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },

  /* Sidebar Promo Box */
  sidebarPromoCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sidebarPromoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarPromoTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  sidebarPromoSubtitle: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 14,
  },
  sidebarPromoBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Sidebar Bottom Graphic */
  sidebarFooterGraphicWrap: {
    position: "relative",
    width: "100%",
    height: 90,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  sidebarCursiveWrap: {
    position: "absolute",
    bottom: 6,
    left: 8,
  },
  sidebarCursiveText: {
    fontFamily: Platform.OS === "web" ? "Kalam, Caveat, cursive" : "System",
    fontSize: 13,
    color: "#065F46",
    fontStyle: "italic",
    lineHeight: 16,
    opacity: 0.8,
  },

  /* ================= RIGHT MAIN CONTENT ================= */
  mainContent: {
    flex: 1,
  },

  /* 1. Hero Banner */
  heroBannerCard: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  heroBannerBackground: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  heroBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
    ...Platform.select({
      web: {
        background:
          "linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.05) 75%, transparent 100%)",
      } as any,
      default: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
      },
    }),
  },
  heroLeftCol: {
    zIndex: 2,
    maxWidth: 480,
  },
  heroMainTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.4,
    ...Platform.select({
      web: {
        textShadow: "0 1px 3px rgba(255, 255, 255, 0.85)",
      } as any,
    }),
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: "#334155",
    fontWeight: "600",
    marginTop: 4,
    lineHeight: 17,
    ...Platform.select({
      web: {
        textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
      } as any,
    }),
  },
  heroCursiveBox: {
    zIndex: 2,
    alignItems: "center",
    transform: [{ rotate: "-4deg" }],
  },
  heroCursiveText: {
    fontFamily: Platform.OS === "web" ? "Kalam, Caveat, cursive" : "System",
    fontSize: 17,
    color: "#065F46",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "700",
  },
  heroPostBtn: {
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 9999,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  heroPostBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
  },

  /* 2. 4 Metric Cards */
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    flexWrap: "wrap",
  },
  metricCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  metricIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  metricTextCol: {
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 24,
  },
  metricLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 1,
  },
  metricMicroSub: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 1,
    fontWeight: "500",
  },

  /* 3. Filter & Search Controls */
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
    flexWrap: "wrap",
  },
  filterPillsTrack: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 3,
    borderRadius: 9999,
    gap: 3,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
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
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  filterPillTextActive: {
    color: "#065F46",
    fontWeight: "700",
  },
  searchFilterGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    width: 200,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: "#0F172A",
    outlineStyle: "none",
  } as any,
  filtersBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filtersBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },

  /* 4. The Property Listing Card */
  cardsList: {
    marginTop: 16,
    gap: 16,
  },
  propertyCard: {
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
    flexDirection: "row",
    flexWrap: "wrap",
  },
  photoSliderHalf: {
    width: "44%",
    minWidth: 320,
    minHeight: 260,
    position: "relative",
    backgroundColor: "#0F172A",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    borderRadius: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  statusBadgePending: {
    backgroundColor: "#EA580C",
  },
  statusBadgeVerified: {
    backgroundColor: "#059669",
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  sliderChevronLeft: {
    position: "absolute",
    left: 10,
    top: "45%",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sliderChevronRight: {
    position: "absolute",
    right: 10,
    top: "45%",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  photoCountBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  photoCountText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
  },
  photoActionOverlays: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewOnMapPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 6,
  },
  viewOnMapText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
  },
  photoHeartBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Card Details Half */
  cardDetailsHalf: {
    flex: 1,
    minWidth: 320,
    padding: 18,
    justifyContent: "space-between",
  },
  cardTopMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTagsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  landTypeTag: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  landTypeTagText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.3,
  },
  residentialTag: {
    backgroundColor: "#ECFDF5",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  residentialTagText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#065F46",
  },
  cardIdMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardIdText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
  },
  moreMenuBtn: {
    padding: 2,
  },

  propertyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 23,
  },
  locationSpecsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  specText: {
    fontSize: 12.5,
    color: "#475569",
    fontWeight: "600",
  },

  priceDateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  priceCol: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  mainPriceText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subRateText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  dateTagBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateTagText: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "500",
  },

  trustPillsRow: {
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
    paddingHorizontal: 9,
    borderRadius: 9999,
    borderWidth: 1,
  },
  trustPillComplete: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  trustPillCompleteText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#065F46",
  },
  trustPillPending: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  trustPillPendingText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#64748B",
  },

  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  viewDetailsBtn: {
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
  viewDetailsBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  mintBtn: {
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
  mintBtnText: {
    color: "#065F46",
    fontSize: 11.5,
    fontWeight: "700",
  },

  /* 5. Bottom Booster Banner */
  boostBanner: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#E6F5EE",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    minHeight: 88,
  },
  boostScenicWrap: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "60%",
    maxWidth: 620,
    height: "100%",
    overflow: "hidden",
    pointerEvents: "none",
  },
  boostScenicImg: {
    position: "absolute",
    right: 0,
    bottom: -12,
    width: 550,
    height: 185,
    ...Platform.select({
      web: {
        objectFit: "cover",
        objectPosition: "86% 75%",
      } as any,
    }),
  },
  boostScenicFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    ...Platform.select({
      web: {
        background:
          "linear-gradient(90deg, #E6F5EE 0%, #E6F5EE 15%, rgba(230, 245, 238, 0.85) 35%, rgba(230, 245, 238, 0.2) 65%, transparent 85%)",
      } as any,
      default: {
        backgroundColor: "rgba(230, 245, 238, 0.3)",
      },
    }),
  },
  boostBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 280,
    zIndex: 2,
  },
  boostIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C6F6D5",
    justifyContent: "center",
    alignItems: "center",
  },
  boostTextCol: {
    flex: 1,
  },
  boostTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  boostSubtitle: {
    fontSize: 12.5,
    color: "#475569",
    marginTop: 2,
    lineHeight: 16,
    fontWeight: "500",
  },
  boostActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#059669",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 9999,
    zIndex: 2,
    ...Platform.select({
      web: {
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(5, 150, 105, 0.08)",
      } as any,
    }),
  },
  boostActionBtnText: {
    color: "#059669",
    fontSize: 13,
    fontWeight: "700",
  },

  /* States */
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
    gap: 10,
  },
  emptyHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptySubText: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 300,
  },
});
