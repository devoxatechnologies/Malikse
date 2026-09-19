import React, { useState, useEffect, useRef } from "react";
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
  // Default to Google Earth Satellite mode as requested
  const [mapMode, setMapMode] = useState<"map" | "satellite">("satellite");
  const [selectedPin, setSelectedPin] = useState<string>("patna_plot_1");
  const [savedProperties, setSavedProperties] = useState<Record<string, boolean>>({});

  // Leaflet & Google Earth instance refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const plotLayersRef = useRef<any[]>([]);

  // Inject Google Fonts and Leaflet CSS
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      // Google Fonts
      const fontId = "google-fonts-malikse";
      if (!document.getElementById(fontId)) {
        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
        document.head.appendChild(link);
      }

      // Leaflet CSS for smooth Google Earth tile rendering
      const leafletCssId = "leaflet-css-malikse";
      if (!document.getElementById(leafletCssId)) {
        const link = document.createElement("link");
        link.id = leafletCssId;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
    }
  }, []);

  // Initialize interactive Google Earth Map via Leaflet
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    let isMounted = true;

    import("leaflet").then((leafletModule) => {
      const L = (leafletModule as any).default || leafletModule;
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered at real plotted parcels in Patna / Danapur
      const map = L.map(mapContainerRef.current, {
        center: [25.6145, 85.0485], // Prime plotted land area
        zoom: 15, // Optimal zoom to see real physical plots, boundaries, and fields
        zoomControl: false,
        attributionControl: false,
        maxZoom: 20,
      });
      mapInstanceRef.current = map;

      // Google Earth Satellite Tile Layer (Hybrid with photorealistic satellite imagery & roads)
      const googleTileUrl =
        mapMode === "satellite"
          ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

      const tiles = L.tileLayer(googleTileUrl, {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(map);
      tileLayerRef.current = tiles;

      // ================= REAL PLOT CADASTRAL BOUNDARIES (Google Earth Polygons) =================
      plotLayersRef.current = [];

      // Plot 1: 2,400 sq.ft Land in Patna (Verified Boundary Box)
      const plot1Polygon = L.polygon(
        [
          [25.6158, 85.0468],
          [25.6166, 85.0492],
          [25.6148, 85.0501],
          [25.6140, 85.0477],
        ],
        {
          color: "#10B981",
          weight: 2.5,
          fillColor: "#10B981",
          fillOpacity: 0.28,
          dashArray: "4, 4",
        }
      ).addTo(map);

      plot1Polygon.bindTooltip(
        "<div style='font-family: sans-serif; font-size: 11px; font-weight: 700; color: #064E3B;'>Plot #1: 2400 sq.ft (KYC Checked)</div>",
        { permanent: false, direction: "top" }
      );
      plotLayersRef.current.push(plot1Polygon);

      // Plot 2: 1,200 sq.ft Residential Plot near Danapur
      const plot2Polygon = L.polygon(
        [
          [25.6190, 85.0380],
          [25.6198, 85.0400],
          [25.6186, 85.0407],
          [25.6178, 85.0387],
        ],
        {
          color: "#059669",
          weight: 2.5,
          fillColor: "#059669",
          fillOpacity: 0.28,
          dashArray: "4, 4",
        }
      ).addTo(map);

      plot2Polygon.bindTooltip(
        "<div style='font-family: sans-serif; font-size: 11px; font-weight: 700; color: #064E3B;'>Plot #2: 1200 sq.ft (Registry Verified)</div>",
        { permanent: false, direction: "top" }
      );
      plotLayersRef.current.push(plot2Polygon);

      // ================= SPECIFIC LAND & PLOT MARKERS =================
      const plotLocations = [
        {
          id: "patna_plot_1",
          title: "LAND in Patna, Bihar",
          price: "₹60.00 Lakh",
          area: "2400 sq.ft",
          lat: 25.6152,
          lng: 85.0485,
          isCentral: true,
        },
        {
          id: "danapur_plot_2",
          title: "Residential Plot near Danapur",
          price: "₹42.00 Lakh",
          area: "1200 sq.ft",
          lat: 25.6188,
          lng: 85.0394,
          isCentral: false,
        },
        {
          id: "bihta_plot_3",
          title: "Commercial Land near Bihta Airport",
          price: "₹85.00 Lakh",
          area: "3600 sq.ft",
          lat: 25.5684,
          lng: 84.8582,
          isCentral: false,
        },
        {
          id: "hajipur_plot_4",
          title: "Highway Plotted Parcel Hajipur",
          price: "₹35.00 Lakh",
          area: "1800 sq.ft",
          lat: 25.6858,
          lng: 85.2146,
          isCentral: false,
        },
      ];

      plotLocations.forEach((loc) => {
        const pinHtml = `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
            ${
              loc.isCentral
                ? `<div style="background-color: #064E3B; color: #FFFFFF; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); text-align: center; white-space: nowrap; margin-bottom: 6px; position: relative;">
                    Explore Properties<br/>in this Area
                    <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #064E3B;"></div>
                  </div>`
                : ""
            }
            <div style="width: 24px; height: 30px; border-radius: 12px; background-color: #064E3B; border: 2px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;">
              <div style="width: 7px; height: 7px; border-radius: 3.5px; background-color: #10B981;"></div>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: "malikse-google-earth-marker",
          html: pinHtml,
          iconSize: [0, 0],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);
        marker.on("click", () => {
          setSelectedPin(loc.id);
          map.flyTo([loc.lat, loc.lng], 16, { duration: 1.2 });
        });
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Dynamically update Google Earth tile mode (Hybrid Satellite <-> Roadmap)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    import("leaflet").then((leafletModule) => {
      const L = (leafletModule as any).default || leafletModule;
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const googleTileUrl =
        mapMode === "satellite"
          ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

      tileLayerRef.current = L.tileLayer(googleTileUrl, {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(mapInstanceRef.current);
    });
  }, [mapMode]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetLocation = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([25.6145, 85.0485], 15, { duration: 1.2 });
    }
  };

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
            {/* ---------------- LEFT CONTAINER: REAL GOOGLE EARTH AERIAL INTERFACE ---------------- */}
            <View style={styles.equalCard}>
              <View style={styles.googleEarthWrapper}>
                {/* HTML Div mount point for Google Earth satellite instance */}
                {Platform.OS === "web" ? (
                  <div
                    ref={mapContainerRef as any}
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      backgroundColor: "#18231C",
                    }}
                  />
                ) : null}

                {/* OVERLAY: Top-Left Location Selector */}
                <View style={styles.mapTopLeftPill}>
                  <MaterialIcons name="place" size={15} color="#059669" />
                  <Text style={styles.mapTopLeftText}>Patna, Bihar</Text>
                  <TouchableOpacity onPress={handleResetLocation} activeOpacity={0.7}>
                    <Text style={styles.mapChangeLink}>Change</Text>
                  </TouchableOpacity>
                </View>

                {/* OVERLAY: Top-Right Zoom & Crosshair Controls */}
                <View style={styles.mapTopRightControls}>
                  <View style={styles.zoomPill}>
                    <TouchableOpacity
                      style={styles.zoomBtn}
                      onPress={handleZoomIn}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="add" size={18} color="#1E293B" />
                    </TouchableOpacity>
                    <View style={styles.zoomDivider} />
                    <TouchableOpacity
                      style={styles.zoomBtn}
                      onPress={handleZoomOut}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="remove" size={18} color="#1E293B" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.crosshairBtn}
                    onPress={handleResetLocation}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="my-location" size={18} color="#1E293B" />
                  </TouchableOpacity>
                </View>

                {/* OVERLAY: Bottom-Left Map / Satellite Toggle (Satellite active by default) */}
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

                {/* OVERLAY: Bottom-Right Real Land Parcel Stat Card */}
                <View style={styles.mapBottomRightPill}>
                  <MaterialIcons name="satellite-alt" size={18} color="#059669" style={{ marginRight: 7 }} />
                  <Text style={styles.mapBottomRightText}>
                    Google Earth Live Imagery{"\n"}
                    <Text style={{ fontWeight: "800", color: "#0F172A" }}>Demarcated Land Parcels</Text>
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
                        onPress={() => {
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.flyTo([25.6152, 85.0485], 16, { duration: 1.2 });
                          }
                        }}
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
                        onPress={() => {
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.flyTo([25.6188, 85.0394], 16, { duration: 1.2 });
                          }
                        }}
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
    paddingBottom: 42,
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
    marginBottom: -70,
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
    paddingTop: 46,
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
    alignItems: "stretch",
  },
  equalCard: {
    flex: 1,
    height: 560,
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

  /* ---------------- LEFT: REAL GOOGLE EARTH AERIAL INTERFACE ---------------- */
  googleEarthWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
    backgroundColor: "#18231C",
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
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1000,
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
    zIndex: 1000,
  },
  zoomPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
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
    shadowOpacity: 0.2,
    shadowRadius: 5,
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
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1000,
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
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1000,
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
