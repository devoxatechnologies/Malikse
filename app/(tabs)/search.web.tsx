import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import { useAuthStore } from "../../src/store/authStore";

// Exact uploaded landscape background and high quality land plot imagery
const heroBgImg = require("../../assets/marketplace_hero_bg.png");
const aerialPlotImg = require("../../assets/plot_patna_aerial.jpg");
const fieldPlotImg = require("../../assets/plot_danapur_field.jpg");

export default function SearchScreenWeb() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { authState } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mapMode, setMapMode] = useState<"map" | "satellite">("map");
  const [selectedPin, setSelectedPin] = useState<string>("patna");
  const [savedProperties, setSavedProperties] = useState<Record<string, boolean>>({});

  // Inject Google Fonts for the script text & sleek modern typography on web
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const linkId = "google-fonts-malikse";
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
        document.head.appendChild(link);
      }
    }
  }, []);

  const toggleSave = (id: string) => {
    setSavedProperties((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: "all", label: "All Properties", icon: "grid-view" },
    { id: "plots", label: "Plots & Land", icon: "terrain" },
    { id: "flats", label: "Flats & Houses", icon: "apartment" },
    { id: "commercial", label: "Commercial", icon: "storefront" },
    { id: "agricultural", label: "Agricultural", icon: "eco" },
    { id: "patna_region", label: "Patna Region", icon: "location-on" },
  ];

  // Map pins corresponding to the reference image
  const mapPins = [
    { id: "dighwara", name: "Dighwara", x: "16%", y: "24%" },
    { id: "sonepur", name: "Sonepur", x: "46%", y: "26%" },
    { id: "hajipur", name: "Hajipur", x: "71%", y: "28%" },
    { id: "danapur", name: "Danapur", x: "25%", y: "48%" },
    { id: "bihta", name: "Bihta", x: "13%", y: "60%" },
    { id: "patna", name: "Patna", x: "46%", y: "52%", isCentral: true },
    { id: "phulwari", name: "Phulwari", x: "32%", y: "67%" },
    { id: "fatuha", name: "Fatuha", x: "78%", y: "55%" },
  ];

  return (
    <View style={styles.pageContainer}>
      {/* Top Header Navbar */}
      <AppHeader
        showBack={false}
        showLanguageToggle={true}
        showNavLinks={true}
        showPostPropertyBtn={true}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HERO SECTION WITH EXACT UPLOADED BACKGROUND ================= */}
        <View style={styles.heroSection}>
          <Image
            source={heroBgImg}
            style={styles.heroBackgroundImage}
            resizeMode="cover"
          />

          <View style={styles.heroInnerContainer}>
            {/* Top Row: Title, Trust Badges, Cursive script & Verified Parcels card */}
            <View style={styles.heroTopRow}>
              {/* Left Column: Heading & Trust Badges */}
              <View style={styles.heroTitlesBlock}>
                <Text style={styles.heroMainTitle}>Find Genuine Land & Plots</Text>
                <Text style={styles.heroSubTitle}>Direct from Verified Owners</Text>

                {/* 4 Trust Badges */}
                <View style={styles.trustBadgesRow}>
                  <View style={styles.trustBadgeItem}>
                    <MaterialIcons name="verified-user" size={15} color="#059669" />
                    <Text style={styles.trustBadgeText}>100% Jamabandi & Registry Checked</Text>
                  </View>

                  <View style={styles.trustBadgeItem}>
                    <MaterialIcons name="gps-fixed" size={15} color="#059669" />
                    <Text style={styles.trustBadgeText}>GPS Verified Locations</Text>
                  </View>

                  <View style={styles.trustBadgeItem}>
                    <MaterialIcons name="people" size={16} color="#059669" />
                    <Text style={styles.trustBadgeText}>Zero Brokerage</Text>
                  </View>

                  <View style={styles.trustBadgeItem}>
                    <MaterialIcons name="description" size={15} color="#059669" />
                    <Text style={styles.trustBadgeText}>Direct Owner Contact</Text>
                  </View>
                </View>
              </View>

              {/* Right Column: Handwritten Script + Floating Stat Card */}
              <View style={styles.heroRightCorner}>
                <Text style={styles.cursiveHeroScript}>
                  Real Land{"\n"}Real Opportunities
                </Text>

                <TouchableOpacity
                  style={styles.floatingStatCard}
                  onPress={() => router.push("/search")}
                  activeOpacity={0.85}
                >
                  <View style={styles.statIconCircle}>
                    <MaterialIcons name="check" size={17} color="#FFFFFF" />
                  </View>
                  <View style={styles.statTextCol}>
                    <Text style={styles.statNumber}>1,400+</Text>
                    <Text style={styles.statLabel}>Verified Parcels</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ================= COMPOSITE ELEVATED SEARCH BAR (STRADDLES SECTION LINE) ================= */}
            <View style={styles.searchBarWrapper}>
              <View style={styles.searchBarCard}>
                {/* Location Selector Pill */}
                <TouchableOpacity style={styles.locationSelector} activeOpacity={0.8}>
                  <MaterialIcons name="place" size={18} color="#059669" />
                  <Text style={styles.locationSelectorText}>Patna, Bihar</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={18} color="#64748B" />
                </TouchableOpacity>

                <View style={styles.searchBarDivider} />

                {/* Search Query Input */}
                <View style={styles.searchInputContainer}>
                  <MaterialIcons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by location, landmark, plot ID..."
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

                {/* Search Button */}
                <TouchableOpacity
                  style={styles.searchActionBtn}
                  onPress={() => {}}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="search" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.searchActionBtnText}>Search</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ================= LOWER BODY: CATEGORIES & EQUAL CONTAINER CARDS ================= */}
        <View style={styles.lowerBodyContainer}>
          {/* Category Filter Toolbar */}
          <View style={styles.filterToolbar}>
            {/* Left category pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryPillsScroll}
            >
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={cat.icon as any}
                      size={15}
                      color={isActive ? "#065F46" : "#475569"}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Right Filter Actions: Sort By & Filters */}
            <View style={styles.rightFilterActions}>
              <TouchableOpacity style={styles.filterActionPill} activeOpacity={0.8}>
                <MaterialIcons name="swap-vert" size={17} color="#475569" style={{ marginRight: 4 }} />
                <Text style={styles.filterActionText}>Sort by</Text>
                <MaterialIcons name="keyboard-arrow-down" size={17} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.filterActionPill} activeOpacity={0.8}>
                <MaterialIcons name="tune" size={16} color="#475569" style={{ marginRight: 5 }} />
                <Text style={styles.filterActionText}>Filters</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= MAIN SPLIT SECTION: SIDE-BY-SIDE WITH SAME CONTAINER SIZE ================= */}
          <View style={styles.sideBySideGrid}>
            {/* ---------------- LEFT CONTAINER: PATNA VECTOR MAP CARD ---------------- */}
            <View style={styles.equalCard}>
              <View style={styles.mapCanvas}>
                {/* Ganga River Path */}
                <View style={styles.gangaRiverShape}>
                  <Text style={styles.riverLabel}>Ganga River</Text>
                </View>

                {/* Road Network Lines */}
                <View style={styles.roadAtalPath} />
                <View style={styles.roadDanapurPatna} />
                <View style={styles.roadNorthBridge} />
                <View style={styles.roadBihtaDanapur} />
                <View style={styles.roadPatnaFatuha} />

                {/* Labeled Areas on Map */}
                <Text style={[styles.mapPlaceLabel, { left: "11%", top: "17%" }]}>Dighwara</Text>
                <Text style={[styles.mapPlaceLabel, { left: "44%", top: "20%" }]}>Sonepur</Text>
                <Text style={[styles.mapPlaceLabel, { left: "69%", top: "22%", fontWeight: "700" }]}>Hajipur</Text>
                <Text style={[styles.mapPlaceLabel, { left: "21%", top: "42%" }]}>Danapur</Text>
                <Text style={[styles.mapPlaceLabel, { left: "9%", top: "54%" }]}>Bihta</Text>
                <Text style={[styles.mapPlaceLabel, styles.centralPatnaLabel, { left: "42%", top: "45%" }]}>Patna</Text>
                <Text style={[styles.mapPlaceLabel, { left: "29%", top: "62%" }]}>Phulwari</Text>
                <Text style={[styles.mapPlaceLabel, { left: "60%", top: "47%" }]}>Atal Path</Text>
                <View style={[styles.airportBadge, { left: "35%", top: "54%" }]}>
                  <MaterialIcons name="flight" size={11} color="#0284C7" />
                  <Text style={styles.airportText}>Patna{"\n"}Airport</Text>
                </View>
                <Text style={[styles.mapPlaceLabel, { left: "57%", top: "60%" }]}>Sampatchak</Text>
                <Text style={[styles.mapPlaceLabel, { left: "77%", top: "51%" }]}>Fatuha</Text>

                {/* Pins Rendered Across Bihar */}
                {mapPins.map((pin) => {
                  const isSelected = selectedPin === pin.id;
                  return (
                    <TouchableOpacity
                      key={pin.id}
                      style={[styles.pinWrapper, { left: pin.x as any, top: pin.y as any }]}
                      onPress={() => setSelectedPin(pin.id)}
                      activeOpacity={0.8}
                    >
                      {/* Tooltip on Central Patna Pin */}
                      {pin.isCentral && (
                        <View style={styles.centralTooltipContainer}>
                          <View style={styles.centralTooltipBubble}>
                            <Text style={styles.centralTooltipText}>
                              Explore Properties{"\n"}in this Area
                            </Text>
                          </View>
                          <View style={styles.centralTooltipBeak} />
                        </View>
                      )}

                      {/* Teardrop Forest Green Pin */}
                      <View style={[styles.pinHead, isSelected && styles.pinHeadSelected]}>
                        <View style={styles.pinCenterDot} />
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* OVERLAY: Top-Left Location Selector */}
                <View style={styles.mapTopLeftPill}>
                  <MaterialIcons name="place" size={15} color="#059669" />
                  <Text style={styles.mapTopLeftText}>Patna, Bihar</Text>
                  <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                    <Text style={styles.mapChangeLink}>Change</Text>
                  </TouchableOpacity>
                </View>

                {/* OVERLAY: Top-Right Zoom & Crosshair Controls */}
                <View style={styles.mapTopRightControls}>
                  <View style={styles.zoomPill}>
                    <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.7}>
                      <MaterialIcons name="add" size={18} color="#475569" />
                    </TouchableOpacity>
                    <View style={styles.zoomDivider} />
                    <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.7}>
                      <MaterialIcons name="remove" size={18} color="#475569" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.crosshairBtn} activeOpacity={0.7}>
                    <MaterialIcons name="my-location" size={18} color="#475569" />
                  </TouchableOpacity>
                </View>

                {/* OVERLAY: Bottom-Left Map / Satellite Toggle */}
                <View style={styles.mapBottomLeftToggle}>
                  <TouchableOpacity
                    style={[styles.modeToggleBtn, mapMode === "map" && styles.modeToggleActive]}
                    onPress={() => setMapMode("map")}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modeToggleText, mapMode === "map" && styles.modeToggleTextActive]}>
                      Map
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeToggleBtn, mapMode === "satellite" && styles.modeToggleActive]}
                    onPress={() => setMapMode("satellite")}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modeToggleText, mapMode === "satellite" && styles.modeToggleTextActive]}>
                      Satellite
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* OVERLAY: Bottom-Right Showing Properties Card */}
                <View style={styles.mapBottomRightPill}>
                  <MaterialIcons name="bar-chart" size={18} color="#059669" style={{ marginRight: 6 }} />
                  <Text style={styles.mapBottomRightText}>
                    Showing <Text style={{ fontWeight: "800", color: "#0F172A" }}>1,240+</Text> properties{"\n"}in Patna Region
                  </Text>
                </View>
              </View>
            </View>

            {/* ---------------- RIGHT CONTAINER: AVAILABLE LISTINGS PANEL (SAME SIZE) ---------------- */}
            <View style={[styles.equalCard, styles.listingsCard]}>
              {/* Panel Header */}
              <View style={styles.listingsHeader}>
                <View style={styles.listingsHeaderTopRow}>
                  <Text style={styles.listingsTitle}>Available Listings (1,240+)</Text>
                  <TouchableOpacity
                    style={styles.viewAllBtn}
                    onPress={() => router.push("/search")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                    <MaterialIcons name="arrow-forward" size={15} color="#059669" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.listingsSubtitle}>
                  Direct from verified owners &bull; No middlemen &bull; 100% secure
                </Text>
              </View>

              {/* List of Cards */}
              <View style={styles.listingsContainer}>
                {/* ============ LISTING CARD 1 (Featured) ============ */}
                <View style={styles.propertyRowCard}>
                  {/* Left Media Column */}
                  <View style={styles.cardImageCol}>
                    <Image
                      source={aerialPlotImg}
                      style={styles.propertyThumbImage}
                      resizeMode="cover"
                    />

                    {/* Top-Left Featured Crown Badge */}
                    <View style={styles.featuredBadge}>
                      <FontAwesome5 name="crown" size={10} color="#B45309" style={{ marginRight: 4 }} />
                      <Text style={styles.featuredBadgeText}>Featured</Text>
                    </View>

                    {/* Top-Right Favorite Heart Button */}
                    <TouchableOpacity
                      style={styles.favCircleBtn}
                      onPress={() => toggleSave("prop_patna_1")}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name={savedProperties["prop_patna_1"] ? "favorite" : "favorite-border"}
                        size={16}
                        color={savedProperties["prop_patna_1"] ? "#EF4444" : "#FFFFFF"}
                      />
                    </TouchableOpacity>

                    {/* Bottom-Left Image Count (1/8) */}
                    <View style={styles.imageCountBadge}>
                      <MaterialIcons name="photo-camera" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.imageCountText}>1 / 8</Text>
                    </View>

                    {/* Bottom-Right Carousel Arrows */}
                    <View style={styles.carouselNavRow}>
                      <TouchableOpacity style={styles.carouselBtn} activeOpacity={0.7}>
                        <MaterialIcons name="chevron-left" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.carouselBtn} activeOpacity={0.7}>
                        <MaterialIcons name="chevron-right" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Right Details Column */}
                  <View style={styles.cardDetailsCol}>
                    <View>
                      <Text style={styles.cardTitle}>LAND in Patna, Bihar</Text>
                      <View style={styles.cardLocationRow}>
                        <MaterialIcons name="place" size={13} color="#64748B" style={{ marginRight: 3 }} />
                        <Text style={styles.cardLocationText}>Patna, Bihar</Text>
                      </View>

                      {/* Trust & Spec Chips */}
                      <View style={styles.chipsRow}>
                        <View style={styles.chipNeutral}>
                          <MaterialIcons name="grid-on" size={12} color="#475569" style={{ marginRight: 3 }} />
                          <Text style={styles.chipNeutralText}>2400 sq.ft</Text>
                        </View>

                        <View style={styles.chipKyc}>
                          <MaterialIcons name="verified" size={12} color="#059669" style={{ marginRight: 3 }} />
                          <Text style={styles.chipKycText}>KYC Verified</Text>
                        </View>

                        <View style={styles.chipRegistry}>
                          <MaterialIcons name="receipt-long" size={12} color="#2563EB" style={{ marginRight: 3 }} />
                          <Text style={styles.chipRegistryText}>Registry</Text>
                        </View>

                        <View style={styles.chipGps}>
                          <MaterialIcons name="location-searching" size={12} color="#7C3AED" style={{ marginRight: 3 }} />
                          <Text style={styles.chipGpsText}>GPS Visit</Text>
                        </View>
                      </View>
                    </View>

                    {/* Bottom Price & View Details Button */}
                    <View style={styles.cardPriceRow}>
                      <Text style={styles.priceAmount}>₹60.00 Lakh</Text>
                      <TouchableOpacity
                        style={styles.viewDetailsBtn}
                        onPress={() => router.push("/property/prop_1")}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.viewDetailsBtnText}>View Details</Text>
                        <MaterialIcons name="arrow-forward" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* ============ LISTING CARD 2 (Residential Plot near Danapur) ============ */}
                <View style={styles.propertyRowCard}>
                  {/* Left Media Column */}
                  <View style={styles.cardImageCol}>
                    <Image
                      source={fieldPlotImg}
                      style={styles.propertyThumbImage}
                      resizeMode="cover"
                    />

                    {/* Top-Right Favorite Heart Button */}
                    <TouchableOpacity
                      style={styles.favCircleBtn}
                      onPress={() => toggleSave("prop_danapur_2")}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name={savedProperties["prop_danapur_2"] ? "favorite" : "favorite-border"}
                        size={16}
                        color={savedProperties["prop_danapur_2"] ? "#EF4444" : "#FFFFFF"}
                      />
                    </TouchableOpacity>

                    {/* Bottom-Left Image Count (1/5) */}
                    <View style={styles.imageCountBadge}>
                      <MaterialIcons name="photo-camera" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.imageCountText}>1 / 5</Text>
                    </View>

                    {/* Bottom-Right Carousel Arrows */}
                    <View style={styles.carouselNavRow}>
                      <TouchableOpacity style={styles.carouselBtn} activeOpacity={0.7}>
                        <MaterialIcons name="chevron-left" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.carouselBtn} activeOpacity={0.7}>
                        <MaterialIcons name="chevron-right" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Right Details Column */}
                  <View style={styles.cardDetailsCol}>
                    <View>
                      <Text style={styles.cardTitle}>Residential Plot near Danapur</Text>
                      <View style={styles.cardLocationRow}>
                        <MaterialIcons name="place" size={13} color="#64748B" style={{ marginRight: 3 }} />
                        <Text style={styles.cardLocationText}>Danapur, Patna</Text>
                      </View>

                      {/* Trust & Spec Chips */}
                      <View style={styles.chipsRow}>
                        <View style={styles.chipNeutral}>
                          <MaterialIcons name="grid-on" size={12} color="#475569" style={{ marginRight: 3 }} />
                          <Text style={styles.chipNeutralText}>1200 sq.ft</Text>
                        </View>

                        <View style={styles.chipKyc}>
                          <MaterialIcons name="verified" size={12} color="#059669" style={{ marginRight: 3 }} />
                          <Text style={styles.chipKycText}>KYC Verified</Text>
                        </View>

                        <View style={styles.chipRegistry}>
                          <MaterialIcons name="receipt-long" size={12} color="#2563EB" style={{ marginRight: 3 }} />
                          <Text style={styles.chipRegistryText}>Registry</Text>
                        </View>

                        <View style={styles.chipGps}>
                          <MaterialIcons name="location-searching" size={12} color="#7C3AED" style={{ marginRight: 3 }} />
                          <Text style={styles.chipGpsText}>GPS Visit</Text>
                        </View>
                      </View>
                    </View>

                    {/* Bottom Price & View Details Button */}
                    <View style={styles.cardPriceRow}>
                      <Text style={styles.priceAmount}>₹42.00 Lakh</Text>
                      <TouchableOpacity
                        style={styles.viewDetailsBtn}
                        onPress={() => router.push("/property/prop_2")}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.viewDetailsBtnText}>View Details</Text>
                        <MaterialIcons name="arrow-forward" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#F4F7F6",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* ================= HERO SECTION WITH EXACT BACKGROUND ================= */
  heroSection: {
    width: "100%",
    position: "relative",
    paddingTop: 32,
    paddingBottom: 42, // Gives room for half the search bar to overlap the bottom edge
    backgroundColor: "#E2ECE9",
  },
  heroBackgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroInnerContainer: {
    maxWidth: 1320,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
    zIndex: 2,
    position: "relative",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  heroTitlesBlock: {
    flex: 1,
  },
  heroMainTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  heroSubTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 4,
    marginBottom: 14,
  },
  trustBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  trustBadgeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  trustBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
  },

  /* Right Corner: Cursive script + Stat Card */
  heroRightCorner: {
    alignItems: "flex-end",
    gap: 10,
    marginLeft: 20,
  },
  cursiveHeroScript: {
    fontFamily: Platform.OS === "web" ? "Caveat, 'Segoe Script', cursive" : "System",
    fontSize: 22,
    fontWeight: "700",
    color: "#166534",
    fontStyle: "italic",
    textAlign: "right",
    lineHeight: 24,
    transform: [{ rotate: "-4deg" }],
  },
  floatingStatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  statTextCol: {
    alignItems: "flex-start",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 18,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },

  /* ================= SEARCH BAR STRADDLING SECTION LINE ================= */
  searchBarWrapper: {
    position: "relative",
    marginBottom: -70, // Exactly places the search bar right on the section line!
    zIndex: 20,
  },
  searchBarCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 6,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  locationSelectorText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  searchBarDivider: {
    width: 1,
    height: 26,
    backgroundColor: "#E2E8F0",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: "#0F172A",
    fontWeight: "500",
    outlineStyle: "none" as any,
  },
  searchActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#056B4D",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    shadowColor: "#056B4D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
  },
  searchActionBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
  },

  /* ================= LOWER BODY CONTAINER ================= */
  lowerBodyContainer: {
    maxWidth: 1320,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 46, // Clear the overlapping search bar nicely
  },

  /* Category Filter Toolbar */
  filterToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  categoryPillsScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryPillActive: {
    backgroundColor: "#D1FAE5",
    borderColor: "#A7F3D0",
  },
  categoryPillText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#475569",
  },
  categoryPillTextActive: {
    color: "#065F46",
    fontWeight: "800",
  },
  rightFilterActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterActionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterActionText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#475569",
  },

  /* ================= SIDE-BY-SIDE EQUAL CONTAINER CARDS ================= */
  sideBySideGrid: {
    width: "100%",
    flexDirection: "row",
    gap: 20,
    alignItems: "stretch", // Ensures both map and listings cards stretch to the exact same height
  },
  equalCard: {
    flex: 1, // Same container width!
    height: 560, // Same container height!
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  /* ---------------- LEFT: PATNA VECTOR MAP ---------------- */
  mapCanvas: {
    width: "100%",
    height: "100%",
    position: "relative",
    backgroundColor: "#EFF5EE",
  },
  gangaRiverShape: {
    position: "absolute",
    top: "22%",
    left: "-10%",
    right: "-10%",
    height: 56,
    backgroundColor: "#BAE6FD",
    transform: [{ rotate: "-6deg" }],
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#93C5FD",
  },
  riverLabel: {
    color: "#0369A1",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    opacity: 0.85,
  },
  roadAtalPath: {
    position: "absolute",
    top: "38%",
    left: "20%",
    width: "55%",
    height: 4,
    backgroundColor: "#FCD34D",
    transform: [{ rotate: "8deg" }],
    borderRadius: 2,
  },
  roadDanapurPatna: {
    position: "absolute",
    top: "48%",
    left: "24%",
    width: "35%",
    height: 3,
    backgroundColor: "#CBD5E1",
    transform: [{ rotate: "-4deg" }],
  },
  roadNorthBridge: {
    position: "absolute",
    top: "16%",
    left: "48%",
    width: 4,
    height: "45%",
    backgroundColor: "#FDBA74",
  },
  roadBihtaDanapur: {
    position: "absolute",
    top: "53%",
    left: "12%",
    width: "25%",
    height: 3,
    backgroundColor: "#CBD5E1",
    transform: [{ rotate: "-15deg" }],
  },
  roadPatnaFatuha: {
    position: "absolute",
    top: "52%",
    left: "46%",
    width: "36%",
    height: 3,
    backgroundColor: "#CBD5E1",
    transform: [{ rotate: "12deg" }],
  },
  mapPlaceLabel: {
    position: "absolute",
    fontSize: 11.5,
    fontWeight: "600",
    color: "#1E293B",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  centralPatnaLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    backgroundColor: "transparent",
  },
  airportBadge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  airportText: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#0369A1",
    lineHeight: 10,
  },
  pinWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  pinHead: {
    width: 22,
    height: 28,
    borderRadius: 11,
    backgroundColor: "#064E3B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  pinHeadSelected: {
    backgroundColor: "#059669",
    transform: [{ scale: 1.15 }],
  },
  pinCenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  centralTooltipContainer: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
    minWidth: 140,
    zIndex: 20,
  },
  centralTooltipBubble: {
    backgroundColor: "#064E3B",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  centralTooltipText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 13,
  },
  centralTooltipBeak: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#064E3B",
  },
  mapTopLeftPill: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  mapTopLeftText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  mapChangeLink: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#059669",
    marginLeft: 4,
  },
  mapTopRightControls: {
    position: "absolute",
    top: 14,
    right: 14,
    alignItems: "center",
    gap: 8,
  },
  zoomPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  zoomBtn: {
    width: 32,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  crosshairBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  mapBottomLeftToggle: {
    position: "absolute",
    bottom: 14,
    left: 14,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  modeToggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  modeToggleActive: {
    backgroundColor: "#0B4D3C",
  },
  modeToggleText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#475569",
  },
  modeToggleTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  mapBottomRightPill: {
    position: "absolute",
    bottom: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  mapBottomRightText: {
    fontSize: 10.5,
    color: "#475569",
    lineHeight: 13,
  },

  /* ---------------- RIGHT: AVAILABLE LISTINGS PANEL (SAME CONTAINER SIZE) ---------------- */
  listingsCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    justifyContent: "flex-start",
  },
  listingsHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 14,
  },
  listingsHeaderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listingsTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
  listingsSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 4,
  },
  listingsContainer: {
    marginTop: 14,
    gap: 16,
  },

  /* Property Horizontal Row Card */
  propertyRowCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardImageCol: {
    width: 210,
    height: 145,
    position: "relative",
    backgroundColor: "#E2E8F0",
  },
  propertyThumbImage: {
    width: "100%",
    height: "100%",
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#92400E",
  },
  favCircleBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCountBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  imageCountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  carouselNavRow: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    gap: 4,
  },
  carouselBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Card Right Details */
  cardDetailsCol: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 20,
  },
  cardLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  cardLocationText: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "500",
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 8,
  },
  chipNeutral: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipNeutralText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#475569",
  },
  chipKyc: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  chipKycText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#059669",
  },
  chipRegistry: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  chipRegistryText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#2563EB",
  },
  chipGps: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF5FF",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  chipGpsText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#7C3AED",
  },

  /* Price & CTA */
  cardPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  priceAmount: {
    fontSize: 19,
    fontWeight: "900",
    color: "#065F46",
    letterSpacing: -0.3,
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B4D3C",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 4,
    shadowColor: "#0B4D3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  viewDetailsBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
