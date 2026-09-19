import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useLanguageStore } from "../src/store/languageStore";
import { t } from "../src/i18n/translations";

export interface LatLngPoint {
  lat: number;
  lng: number;
}

interface MapParcelPickerProps {
  initialPoints?: LatLngPoint[];
  onParcelChange: (points: LatLngPoint[]) => void;
  areaSqFt?: number | string;
}

// Default plot boundary matching the user screenshot (Patna / Danapur prime plotted land)
const DEFAULT_CADASTRAL_POLYGON: LatLngPoint[] = [
  { lat: 25.6158, lng: 85.0478 },
  { lat: 25.6164, lng: 85.0494 },
  { lat: 25.6151, lng: 85.0498 },
  { lat: 25.6148, lng: 85.0491 },
  { lat: 25.6145, lng: 85.0480 },
];

export default function MapParcelPicker({
  initialPoints,
  onParcelChange,
  areaSqFt = "2,400",
}: MapParcelPickerProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { language } = useLanguageStore();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const markerLayersRef = useRef<any[]>([]);
  const centerBadgeMarkerRef = useRef<any>(null);

  // Search input state
  const [searchLocation, setSearchLocation] = useState("");
  // Current polygon points
  const [points, setPoints] = useState<LatLngPoint[]>(
    initialPoints && initialPoints.length >= 3 ? initialPoints : DEFAULT_CADASTRAL_POLYGON
  );
  // Undo & Redo History
  const [history, setHistory] = useState<LatLngPoint[][]>([]);
  const [redoHistory, setRedoHistory] = useState<LatLngPoint[][]>([]);
  // Satellite vs Map
  const [mapMode, setMapMode] = useState<"satellite" | "map">("satellite");

  // Keep parent in sync on initial mount
  useEffect(() => {
    if (points.length >= 3) {
      onParcelChange(points);
    }
  }, []);

  // Compute centroid of the polygon for badge placement
  const calculateCentroid = (pts: LatLngPoint[]) => {
    if (pts.length === 0) return { lat: 25.6152, lng: 85.0485 };
    let sumLat = 0;
    let sumLng = 0;
    pts.forEach((p) => {
      sumLat += p.lat;
      sumLng += p.lng;
    });
    return { lat: sumLat / pts.length, lng: sumLng / pts.length };
  };

  // Compute rough geodesic polygon area in sq.ft if dynamic
  const calculateAreaSqFt = (pts: LatLngPoint[]) => {
    if (pts.length < 3) return areaSqFt ? `${areaSqFt} sq.ft` : "0 sq.ft";
    // Shoelace formula with Earth radius approximation (meters -> sq.ft)
    const R = 6378137;
    let area = 0;
    if (pts.length > 2) {
      for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        const p1 = pts[i];
        const p2 = pts[j];
        const lat1 = (p1.lat * Math.PI) / 180;
        const lat2 = (p2.lat * Math.PI) / 180;
        const lon1 = (p1.lng * Math.PI) / 180;
        const lon2 = (p2.lng * Math.PI) / 180;
        area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
      }
      area = (Math.abs(area) * R * R) / 2;
    }
    const sqMeters = Math.round(area);
    const sqFt = Math.round(sqMeters * 10.7639);
    return sqFt > 100 ? `${sqFt.toLocaleString("en-IN")} ${language === "hi" ? "वर्गफ़ीट" : "sq.ft"}` : `${areaSqFt} ${language === "hi" ? "वर्गफ़ीट" : "sq.ft"}`;
  };

  // Initialize interactive Leaflet map instance
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    let isMounted = true;

    import("leaflet").then((leafletModule) => {
      const L = (leafletModule as any).default || leafletModule;
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initial center
      const centroid = calculateCentroid(points);
      const map = L.map(mapContainerRef.current, {
        center: [centroid.lat, centroid.lng],
        zoom: 17,
        zoomControl: false,
        attributionControl: false,
        maxZoom: 20,
      });
      mapInstanceRef.current = map;

      // Google Earth Satellite tiles (Hybrid with plot demarcations & roads)
      const googleTileUrl =
        mapMode === "satellite"
          ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

      const tiles = L.tileLayer(googleTileUrl, {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(map);
      tileLayerRef.current = tiles;

      // Map Click to Add New Boundary Point
      map.on("click", (e: any) => {
        const newPt: LatLngPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPoints((prev) => {
          setHistory((h) => [...h, prev]);
          setRedoHistory([]);
          const updated = [...prev, newPt];
          onParcelChange(updated);
          return updated;
        });
      });

      renderParcel(L, map, points);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer on Mode Change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
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

  // Re-render polygon & vertex markers when points or language changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((leafletModule) => {
      const L = (leafletModule as any).default || leafletModule;
      renderParcel(L, mapInstanceRef.current, points);
    });
  }, [points, language]);

  // Render Polygon, Draggable Vertex Handles, and Center Area Pill Badge
  const renderParcel = (L: any, map: any, pts: LatLngPoint[]) => {
    // Clear old polygon layer
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    // Clear old markers
    markerLayersRef.current.forEach((m) => map.removeLayer(m));
    markerLayersRef.current = [];
    // Clear old center badge
    if (centerBadgeMarkerRef.current) {
      map.removeLayer(centerBadgeMarkerRef.current);
      centerBadgeMarkerRef.current = null;
    }

    if (pts.length < 2) return;

    // Draw Polygon with Translucent Green Fill & Emerald Border
    const latLngPairs = pts.map((p) => [p.lat, p.lng]);
    const poly = L.polygon(latLngPairs, {
      color: "#10B981",
      weight: 2.5,
      fillColor: "#059669",
      fillOpacity: 0.35,
      lineJoin: "round",
    }).addTo(map);
    polygonLayerRef.current = poly;

    // Draw Draggable Vertex Handles (White circle with emerald border matching screenshot)
    const vertexIcon = L.divIcon({
      className: "parcel-vertex-icon",
      html: `<div style="
        width: 14px;
        height: 14px;
        background-color: #FFFFFF;
        border: 2.5px solid #10B981;
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.35);
        cursor: grab;
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    pts.forEach((p, idx) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: vertexIcon,
        draggable: true,
      }).addTo(map);

      // Drag vertex to update boundary
      marker.on("drag", (ev: any) => {
        const newLat = ev.latlng.lat;
        const newLng = ev.latlng.lng;
        setPoints((prev) => {
          const updated = [...prev];
          updated[idx] = { lat: newLat, lng: newLng };
          onParcelChange(updated);
          return updated;
        });
      });

      marker.on("dragstart", () => {
        setHistory((h) => [...h, pts]);
        setRedoHistory([]);
      });

      // Click to remove vertex if > 3 points
      marker.on("click", (ev: any) => {
        ev.originalEvent?.stopPropagation();
        if (pts.length > 3) {
          setHistory((h) => [...h, pts]);
          setRedoHistory([]);
          const updated = pts.filter((_, i) => i !== idx);
          setPoints(updated);
          onParcelChange(updated);
        }
      });

      markerLayersRef.current.push(marker);
    });

    // Draw Center Dark Area Pill Badge (e.g. "2,400 sq.ft")
    if (pts.length >= 3) {
      const centroid = calculateCentroid(pts);
      const areaLabel = calculateAreaSqFt(pts);
      const centerBadgeIcon = L.divIcon({
        className: "parcel-center-badge",
        html: `<div style="
          background-color: rgba(15, 23, 42, 0.85);
          color: #FFFFFF;
          padding: 5px 12px;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.2px;
          white-space: nowrap;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          pointer-events: none;
        ">${areaLabel}</div>`,
        iconSize: [80, 26],
        iconAnchor: [40, 13],
      });

      const badgeMarker = L.marker([centroid.lat, centroid.lng], {
        icon: centerBadgeIcon,
        interactive: false,
      }).addTo(map);
      centerBadgeMarkerRef.current = badgeMarker;
    }
  };

  // Undo last action
  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoHistory((r) => [...r, points]);
    setHistory((h) => h.slice(0, -1));
    setPoints(previous);
    onParcelChange(previous);
  };

  // Redo last undone action
  const handleRedo = () => {
    if (redoHistory.length === 0) return;
    const next = redoHistory[redoHistory.length - 1];
    setHistory((h) => [...h, points]);
    setRedoHistory((r) => r.slice(0, -1));
    setPoints(next);
    onParcelChange(next);
  };

  // Clear all points
  const handleClear = () => {
    setHistory((h) => [...h, points]);
    setRedoHistory([]);
    setPoints([]);
    onParcelChange([]);
  };

  // Zoom In / Out
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // Crosshair - Center to plot
  const handleCenterToPlot = () => {
    if (mapInstanceRef.current && points.length > 0) {
      const centroid = calculateCentroid(points);
      mapInstanceRef.current.flyTo([centroid.lat, centroid.lng], 17, { duration: 1 });
    }
  };

  // Search Location Dispatcher (Patna, Danapur, Bihta, Bailey Road etc.)
  const handleSearchSubmit = () => {
    if (!mapInstanceRef.current || !searchLocation.trim()) return;
    const query = searchLocation.toLowerCase().trim();

    const KNOWN_PLACES: Record<string, [number, number]> = {
      patna: [25.5941, 85.1376],
      danapur: [25.6152, 85.0485],
      bihta: [25.5684, 84.8582],
      "bailey road": [25.6127, 85.0456],
      kankarbagh: [25.5941, 85.155],
      hajipur: [25.6858, 85.214],
      naubatpur: [25.5342, 84.9741],
    };

    let targetCoord: [number, number] | null = null;
    for (const key of Object.keys(KNOWN_PLACES)) {
      if (query.includes(key)) {
        targetCoord = KNOWN_PLACES[key];
        break;
      }
    }

    if (!targetCoord) {
      targetCoord = [25.6152, 85.0485]; // Default prime Danapur plot
    }

    mapInstanceRef.current.flyTo(targetCoord, 17, { duration: 1.2 });
  };

  return (
    <View style={styles.workspaceContainer}>
      {/* ================= LEFT / MAIN: MAP CANVASES WITH OVERLAYS ================= */}
      <View style={styles.mapCanvasCard}>
        {/* Leaflet DOM Node */}
        {Platform.OS === "web" ? (
          <div
            ref={mapContainerRef as any}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "#17221A",
              borderRadius: 14,
            }}
          />
        ) : (
          <View style={styles.fallbackBox}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={{ marginTop: 12, color: "#64748B" }}>Loading Interactive Map...</Text>
          </View>
        )}

        {/* OVERLAY: Top-Left Search Location Bar */}
        <View style={styles.mapSearchBox}>
          <MaterialIcons name="search" size={18} color="#065F46" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.mapSearchInput}
            placeholder={
              t(language, "search_map_location") || "Search location (village, landmark, or area)"
            }
            placeholderTextColor="#94A3B8"
            value={searchLocation}
            onChangeText={setSearchLocation}
            onSubmitEditing={handleSearchSubmit}
          />
          <TouchableOpacity onPress={handleSearchSubmit} activeOpacity={0.7} style={{ padding: 4 }}>
            <MaterialIcons name="place" size={18} color="#059669" />
          </TouchableOpacity>
        </View>

        {/* OVERLAY: Top-Right Drawing Tools Bar (Undo, Redo, Delete) */}
        <View style={styles.mapDrawingToolbar}>
          <TouchableOpacity
            style={[styles.toolBtn, history.length === 0 && styles.toolBtnDisabled]}
            onPress={handleUndo}
            disabled={history.length === 0}
            activeOpacity={0.7}
            accessibilityLabel="Undo"
          >
            <FontAwesome5
              name="undo-alt"
              size={14}
              color={history.length === 0 ? "#94A3B8" : "#065F46"}
            />
          </TouchableOpacity>

          <View style={styles.toolDivider} />

          <TouchableOpacity
            style={[styles.toolBtn, redoHistory.length === 0 && styles.toolBtnDisabled]}
            onPress={handleRedo}
            disabled={redoHistory.length === 0}
            activeOpacity={0.7}
            accessibilityLabel="Redo"
          >
            <FontAwesome5
              name="redo-alt"
              size={14}
              color={redoHistory.length === 0 ? "#94A3B8" : "#065F46"}
            />
          </TouchableOpacity>

          <View style={styles.toolDivider} />

          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleClear}
            activeOpacity={0.7}
            accessibilityLabel="Clear Boundary"
          >
            <FontAwesome5 name="trash-alt" size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* OVERLAY: Middle-Left Navigation Controls (Zoom, Crosshair, Layers) */}
        <View style={styles.mapLeftControls}>
          <View style={styles.zoomPill}>
            <TouchableOpacity style={styles.navIconBtn} onPress={handleZoomIn} activeOpacity={0.7}>
              <MaterialIcons name="add" size={18} color="#065F46" />
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity style={styles.navIconBtn} onPress={handleZoomOut} activeOpacity={0.7}>
              <MaterialIcons name="remove" size={18} color="#065F46" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.standaloneIconBtn}
            onPress={handleCenterToPlot}
            activeOpacity={0.7}
          >
            <MaterialIcons name="my-location" size={17} color="#065F46" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.standaloneIconBtn}
            onPress={() => setMapMode((m) => (m === "satellite" ? "map" : "satellite"))}
            activeOpacity={0.7}
          >
            <MaterialIcons name="layers" size={17} color="#065F46" />
          </TouchableOpacity>
        </View>

        {/* OVERLAY: Bottom-Left Mode Switcher Pill (Satellite ⌵) */}
        <TouchableOpacity
          style={styles.satelliteModePill}
          onPress={() => setMapMode((m) => (m === "satellite" ? "map" : "satellite"))}
          activeOpacity={0.8}
        >
          <View style={styles.satelliteThumbBox}>
            <MaterialIcons name="satellite-alt" size={14} color="#065F46" />
          </View>
          <Text style={styles.satelliteModeText}>
            {mapMode === "satellite"
              ? t(language, "map_btn_satellite") || "Satellite"
              : t(language, "map_btn_map") || "Map"}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={16} color="#065F46" />
        </TouchableOpacity>

        {/* OVERLAY: Bottom-Right Scale Indicator Bar */}
        <View style={styles.scaleIndicator}>
          <Text style={styles.scaleText}>50 m</Text>
          <View style={styles.scaleLine} />
        </View>
      </View>

      {/* ================= RIGHT: CLEAN MINIMAL SIDEBAR ================= */}
      <View style={styles.sidebarCol}>
        {/* Card 1: How to Draw */}
        <View style={styles.sidebarCard}>
          <View style={styles.sidebarTitleRow}>
            <MaterialIcons name="place" size={18} color="#059669" style={{ marginRight: 6 }} />
            <Text style={styles.sidebarHeading}>{t(language, "how_to_draw") || "How to Draw"}</Text>
          </View>

          <View style={styles.stepsList}>
            {/* Step 1 */}
            <View style={styles.instructionStep}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                {t(language, "draw_step_1") || "Tap on the map to add boundary points"}
              </Text>
            </View>

            {/* Step 2 */}
            <View style={styles.instructionStep}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                {t(language, "draw_step_2") || "Continue tapping to complete the outline"}
              </Text>
            </View>

            {/* Step 3 */}
            <View style={styles.instructionStep}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                {t(language, "draw_step_3") || "Drag points to adjust if needed"}
              </Text>
            </View>

            {/* Step 4 */}
            <View style={styles.instructionStep}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                {t(language, "draw_step_4") || "Make sure the boundary covers your exact land area"}
              </Text>
            </View>

            {/* Step 5 */}
            <View style={styles.instructionStep}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>5</Text>
              </View>
              <Text style={styles.instructionText}>
                {t(language, "draw_step_5") || "Close the shape by clicking on the first point"}
              </Text>
            </View>
          </View>
        </View>

        {/* Card 2: Need Help? */}
        <View style={[styles.sidebarCard, styles.needHelpCard]}>
          <View style={styles.sidebarTitleRow}>
            <MaterialIcons name="help-outline" size={17} color="#059669" style={{ marginRight: 6 }} />
            <Text style={styles.sidebarHeading}>{t(language, "need_help") || "Need Help?"}</Text>
          </View>
          <Text style={styles.needHelpDesc}>
            {t(language, "need_help_desc") ||
              "Make sure you are at the correct location and zoom in for better accuracy."}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  workspaceContainer: {
    width: "100%",
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: 20,
    alignItems: "stretch",
  },

  /* Left / Main Map Canvas */
  mapCanvasCard: {
    flex: 1,
    minHeight: 480,
    height: 480,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#18231C",
  },
  fallbackBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 480,
    backgroundColor: "#F8FAFC",
  },

  /* Overlay: Top-Left Location Search Bar */
  mapSearchBox: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    width: 320,
    maxWidth: "75%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    zIndex: 1000,
  },
  mapSearchInput: {
    flex: 1,
    fontSize: 12.5,
    color: "#0F172A",
    fontWeight: "500",
    outlineStyle: "none" as any,
  },

  /* Overlay: Top-Right Drawing Tools Bar (Undo, Redo, Delete) */
  mapDrawingToolbar: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    zIndex: 1000,
  },
  toolBtn: {
    width: 34,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 7,
  },
  toolBtnDisabled: {
    opacity: 0.45,
  },
  toolDivider: {
    width: 1,
    height: 18,
    backgroundColor: "#E2E8F0",
  },

  /* Overlay: Middle-Left Navigation Controls (Zoom, Crosshair, Layers) */
  mapLeftControls: {
    position: "absolute",
    top: 68,
    left: 14,
    gap: 8,
    zIndex: 1000,
  },
  zoomPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: "hidden",
  },
  navIconBtn: {
    width: 34,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  standaloneIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  /* Overlay: Bottom-Left Mode Switcher Pill (Satellite ⌵) */
  satelliteModePill: {
    position: "absolute",
    bottom: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    zIndex: 1000,
  },
  satelliteThumbBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E6F4EA",
    justifyContent: "center",
    alignItems: "center",
  },
  satelliteModeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#065F46",
  },

  /* Overlay: Bottom-Right Scale Indicator Bar */
  scaleIndicator: {
    position: "absolute",
    bottom: 14,
    right: 14,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    zIndex: 1000,
  },
  scaleText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  scaleLine: {
    width: 40,
    height: 2,
    backgroundColor: "#0F172A",
  },

  /* ================= RIGHT: SIDEBAR ================= */
  sidebarCol: {
    width: Platform.OS === "web" ? 300 : "100%",
    gap: 14,
  },
  sidebarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  sidebarTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sidebarHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  stepsList: {
    gap: 12,
  },
  instructionStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E6F4EA",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  stepNumText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#065F46",
  },
  instructionText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    lineHeight: 16,
    fontWeight: "500",
  },
  needHelpCard: {
    backgroundColor: "#FAFAFA",
  },
  needHelpDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
});
