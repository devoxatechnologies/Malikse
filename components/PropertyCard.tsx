import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Property } from "../src/types/property.types";
import { AppTheme } from "../constants/theme";

interface PropertyCardProps {
  property: Property | any;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80",
];

export default function PropertyCard({ property, onSave, isSaved }: PropertyCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/property/${property.id || property._id}`);
  };

  const rawPrice = Number(property.price) || 0;
  const formattedPrice = rawPrice >= 10000000 
    ? `₹${(rawPrice / 10000000).toFixed(2)} Cr` 
    : rawPrice >= 100000 
    ? `₹${(rawPrice / 100000).toFixed(2)} Lakh` 
    : `₹${rawPrice.toLocaleString("en-IN")}`;

  const imageUri = property.media?.photos?.[0] || property.image || FALLBACK_IMAGES[0];
  const isVerified = property.status === "verified" || property.verified === true;
  const locationStr = typeof property.location === "string" 
    ? property.location 
    : `${property.location?.district || "Patna"}, ${property.location?.state || "Bihar"}`;
  
  const areaStr = property.sellableArea 
    ? `${property.sellableArea} sq.ft` 
    : property.totalArea 
    ? `${property.totalArea} sq.ft` 
    : property.area || "2,400 sq.ft";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Property Image Header */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        <View style={styles.imageOverlay} />

        {/* Verification Status Badge */}
        <View style={[styles.statusBadge, isVerified ? styles.verifiedBadge : styles.pendingBadge]}>
          <MaterialIcons
            name={isVerified ? "verified" : "hourglass-top"}
            size={14}
            color={AppTheme.colors.white}
          />
          <Text style={styles.statusBadgeText}>
            {isVerified ? "Verified Owner" : "In Verification"}
          </Text>
        </View>

        {/* Property Type Chip */}
        <View style={styles.typeChip}>
          <Text style={styles.typeChipText}>
            {(property.type || "Land").toUpperCase()}
          </Text>
        </View>

        {/* Save Heart Button */}
        {onSave && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => onSave(property.id || property._id)}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name="heart"
              solid={isSaved}
              size={16}
              color={isSaved ? AppTheme.colors.danger : AppTheme.colors.white}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Property Details Body */}
      <View style={styles.body}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {property.title || `${(property.type || "Land").toUpperCase()} in ${locationStr}`}
        </Text>

        {/* Location & Area Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons name="location-on" size={16} color={AppTheme.colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>{locationStr}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <MaterialIcons name="straighten" size={16} color={AppTheme.colors.textMuted} />
            <Text style={styles.metaText}>{areaStr}</Text>
          </View>
        </View>

        {/* 4-Pillar Verification Trust Signals */}
        <View style={styles.trustSignals}>
          <View style={[styles.trustPill, styles.trustPillActive]}>
            <MaterialIcons name="fingerprint" size={12} color={AppTheme.colors.badgeIdentity} />
            <Text style={[styles.trustPillText, { color: AppTheme.colors.badgeIdentity }]}>ID KYC</Text>
          </View>
          <View style={[styles.trustPill, styles.trustPillActive]}>
            <MaterialIcons name="description" size={12} color={AppTheme.colors.badgeDocument} />
            <Text style={[styles.trustPillText, { color: AppTheme.colors.badgeDocument }]}>Registry</Text>
          </View>
          <View style={[styles.trustPill, styles.trustPillActive]}>
            <MaterialIcons name="location-pin" size={12} color={AppTheme.colors.badgeSite} />
            <Text style={[styles.trustPillText, { color: AppTheme.colors.badgeSite }]}>GPS Visit</Text>
          </View>
          <View style={[styles.trustPill, isVerified ? styles.trustPillActive : styles.trustPillMuted]}>
            <MaterialIcons name="gavel" size={12} color={isVerified ? AppTheme.colors.badgeLawyer : AppTheme.colors.textMuted} />
            <Text style={[styles.trustPillText, { color: isVerified ? AppTheme.colors.badgeLawyer : AppTheme.colors.textMuted }]}>Legal</Text>
          </View>
        </View>

        {/* Price & Action Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>{formattedPrice}</Text>
          </View>

          <View style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>View Details</Text>
            <MaterialIcons name="arrow-forward" size={16} color={AppTheme.colors.white} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.lg,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    overflow: "hidden",
    ...AppTheme.shadows.card,
  },
  imageContainer: {
    height: 180,
    width: "100%",
    position: "relative",
    backgroundColor: AppTheme.colors.divider,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: AppTheme.radius.full,
    gap: 4,
  },
  verifiedBadge: {
    backgroundColor: AppTheme.colors.primary,
  },
  pendingBadge: {
    backgroundColor: AppTheme.colors.warning,
  },
  statusBadgeText: {
    color: AppTheme.colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  typeChip: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.sm,
  },
  typeChipText: {
    color: AppTheme.colors.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  saveButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: AppTheme.colors.text,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  metaText: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    fontWeight: "500",
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: AppTheme.colors.border,
    marginHorizontal: 10,
  },
  trustSignals: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  trustPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
  },
  trustPillActive: {
    backgroundColor: AppTheme.colors.divider,
    borderColor: AppTheme.colors.border,
  },
  trustPillMuted: {
    backgroundColor: "transparent",
    borderColor: AppTheme.colors.border,
    opacity: 0.6,
  },
  trustPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.divider,
  },
  priceLabel: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    fontWeight: "500",
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: AppTheme.colors.primaryDark,
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: AppTheme.radius.md,
    gap: 6,
  },
  viewBtnText: {
    color: AppTheme.colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
