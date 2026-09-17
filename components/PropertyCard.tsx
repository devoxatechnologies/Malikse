import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Property } from "../src/types/property.types";
import { t } from "../src/i18n/translations";
import { useLanguageStore } from "../src/store/languageStore";

interface PropertyCardProps {
  property: Property;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export default function PropertyCard({ property, onSave, isSaved }: PropertyCardProps) {
  const router = useRouter();
  const { language } = useLanguageStore();

  const handlePress = () => {
    router.push(`/property/${property.id}`);
  };

  const formattedPrice = property.price >= 10000000 
    ? `₹${(property.price / 10000000).toFixed(2)} Cr` 
    : property.price >= 100000 
    ? `₹${(property.price / 100000).toFixed(2)} L` 
    : `₹${property.price.toLocaleString("en-IN")}`;

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {property.media?.photos?.[0] ? (
          <Image source={{ uri: property.media.photos[0] }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <FontAwesome5 name="home" size={40} color="#CCC" />
          </View>
        )}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{property.status === "verified" ? "Verified" : "Pending"}</Text>
        </View>
        {onSave && (
          <TouchableOpacity style={styles.saveButton} onPress={() => onSave(property.id)}>
            <FontAwesome5 name="heart" solid={isSaved} size={20} color={isSaved ? "#FF3B30" : "#FFF"} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text style={styles.price}>{formattedPrice}</Text>
          <Text style={styles.type}>{property.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.location}>
          <FontAwesome5 name="map-marker-alt" size={12} color="#666" /> {property.location.district}, {property.location.state}
        </Text>
        <Text style={styles.area}>
          {property.sellableArea} sq.ft / {property.totalArea} sq.ft total
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  imageContainer: {
    height: 160,
    width: "100%",
    backgroundColor: "#F8F8F8",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  saveButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 20,
  },
  details: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  type: {
    fontSize: 12,
    color: "#2A85FF",
    fontWeight: "bold",
    backgroundColor: "#E6F4FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  area: {
    fontSize: 14,
    color: "#444",
  },
});
