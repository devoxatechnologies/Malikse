import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { propertyService } from "../../src/services/propertyService";
import type { Property } from "../../src/types/property.types";
import PropertyCard from "../../components/PropertyCard";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";
import { useListingFilterStore } from "../../src/store/listingFilterStore";
import { FontAwesome5 } from "@expo/vector-icons";

export default function SearchScreenWeb() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const filters = useListingFilterStore();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, [filters.verifiedOnly, filters.type, filters.location]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyService.searchProperties({
        verifiedOnly: filters.verifiedOnly,
        type: filters.propertyType || undefined,
        location: filters.location || undefined
      });
      setProperties(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Filter Bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <FontAwesome5 name="search" size={16} color="#999" />
          <Text style={styles.searchText}>{filters.location || t(language, "search_placeholder")}</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => {/* Open filter modal */}}>
          <FontAwesome5 name="sliders-h" size={16} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Main Content: Split map and list */}
      <View style={styles.content}>
        {/* Map View (Left/Top) */}
        <View style={styles.mapContainer}>
          {!MapComponents ? (
             <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <ActivityIndicator size="large" color="#2A85FF" />
             </View>
          ) : (
            <MapComponents.MapContainer
              center={[25.5941, 85.1376]} // Default Patna
              zoom={11}
              style={{ width: "100%", height: "100%" }}
            >
              <MapComponents.TileLayer
                attribution='&copy; OSM'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {properties.map((prop) => (
                <MapComponents.Marker key={prop.id} position={[prop.location.lat, prop.location.lng]}>
                  <MapComponents.Popup>
                    <Text style={{ fontWeight: "bold" }}>{prop.type.toUpperCase()}</Text>
                    <Text>₹{prop.price}</Text>
                    <Text>{prop.location.district}</Text>
                    <TouchableOpacity onPress={() => router.push(`/property/${prop.id}`)}>
                      <Text style={{ color: "#2A85FF", marginTop: 4 }}>View Details</Text>
                    </TouchableOpacity>
                  </MapComponents.Popup>
                </MapComponents.Marker>
              ))}
            </MapComponents.MapContainer>
          )}
        </View>

        {/* List View (Right/Bottom) */}
        <View style={styles.listContainer}>
          {loading ? (
            <Text style={styles.msg}>{t(language, "loading")}</Text>
          ) : properties.length === 0 ? (
            <Text style={styles.msg}>{t(language, "search_no_results")}</Text>
          ) : (
            <View style={{ padding: 16 }}>
              {properties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  filterBar: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#EAEAEA",
    paddingTop: 48, // Safe area for notch
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  searchText: { marginLeft: 8, color: "#666" },
  filterBtn: {
    padding: 12,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    flexDirection: "row", // Side-by-side on web desktop
  },
  mapContainer: { flex: 1, backgroundColor: "#E6E6E6" },
  listContainer: { flex: 1, overflow: "scroll" },
  msg: { textAlign: "center", marginTop: 40, color: "#666" }
});
