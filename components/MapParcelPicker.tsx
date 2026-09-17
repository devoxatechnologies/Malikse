import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface MapParcelPickerProps {
  onParcelChange: (points: { lat: number; lng: number }[]) => void;
}

export default function MapParcelPicker({ onParcelChange }: MapParcelPickerProps) {
  const [MapComponents, setMapComponents] = useState<any>(null);
  const [points, setPoints] = useState<{ lat: number; lng: number }[]>([]);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      import("react-leaflet")
        .then((ReactLeaflet) => setMapComponents(ReactLeaflet))
        .catch((e) => console.error("Failed to load map components", e));
    }
  }, []);

  const handleMapClick = (e: any) => {
    const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
    const newPoints = [...points, newPoint];
    setPoints(newPoints);
    onParcelChange(newPoints);
  };

  const handleUndo = () => {
    const newPoints = points.slice(0, -1);
    setPoints(newPoints);
    onParcelChange(newPoints);
  };

  const handleClear = () => {
    setPoints([]);
    onParcelChange([]);
  };

  if (Platform.OS !== "web" || !MapComponents) {
    return (
      <View style={[styles.container, styles.fallback]}>
        <ActivityIndicator size="large" color="#2A85FF" />
        <Text style={{ marginTop: 16, color: "#666" }}>Loading Map...</Text>
      </View>
    );
  }

  const { MapContainer, TileLayer, Marker, Polygon, useMapEvents } = MapComponents;

  // Custom component to handle map clicks
  const MapEvents = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.instruction}>Tap on the map to draw your property boundary.</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleUndo} style={styles.btn} disabled={points.length === 0}>
            <FontAwesome5 name="undo" size={14} color={points.length === 0 ? "#CCC" : "#2A85FF"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} style={styles.btn} disabled={points.length === 0}>
            <FontAwesome5 name="trash" size={14} color={points.length === 0 ? "#CCC" : "#FF3B30"} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.mapWrapper}>
        <MapContainer
          center={[25.5941, 85.1376]} // Default Patna
          zoom={13}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; OSM'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents />
          
          {points.map((p, idx) => (
            <Marker key={idx} position={[p.lat, p.lng]} />
          ))}

          {points.length > 2 && (
            <Polygon positions={points.map(p => [p.lat, p.lng])} color="#2A85FF" fillColor="#2A85FF" fillOpacity={0.4} />
          )}
          {points.length === 2 && (
            <Polygon positions={points.map(p => [p.lat, p.lng])} color="#2A85FF" />
          )}
        </MapContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 350,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 16
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#DDD",
  },
  instruction: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
  },
  btn: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
  },
  mapWrapper: {
    flex: 1,
  },
  fallback: {
    justifyContent: "center",
    alignItems: "center",
  },
});
