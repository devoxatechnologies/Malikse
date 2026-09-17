import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform, ActivityIndicator } from "react-native";
import type { Property } from "../src/types/property.types";

interface MiniMapPreviewProps {
  property: Property;
}

export default function MiniMapPreview({ property }: MiniMapPreviewProps) {
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      import("react-leaflet")
        .then((ReactLeaflet) => {
          setMapComponents(ReactLeaflet);
        })
        .catch((e) => console.error("Failed to load map components", e));
    }
  }, []);

  if (Platform.OS !== "web" || !MapComponents) {
    // For native, use a placeholder or @rnmapbox/maps if installed
    // Or if web map is still loading
    return (
      <View style={[styles.container, styles.fallback]}>
        <ActivityIndicator size="small" color="#2A85FF" />
      </View>
    );
  }

  const { MapContainer, TileLayer, Marker } = MapComponents;
  const { lat, lng } = property.location;
  if (!lat || !lng) return <View style={[styles.container, styles.fallback]} />;

  return (
    <View style={styles.container}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        touchZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 120,
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    overflow: "hidden",
  },
  fallback: {
    justifyContent: "center",
    alignItems: "center",
  },
});
