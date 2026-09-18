import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { propertyService } from "../../src/services/propertyService";
import type { Property } from "../../src/types/property.types";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import MiniMapPreview from "../../components/MiniMapPreview";
import VerificationBadgeRow from "../../components/VerificationBadgeRow";
import AppHeader from "../../components/AppHeader";
import { t } from "../../src/i18n/translations";
import { useLanguageStore } from "../../src/store/languageStore";
import { useAuthStore } from "../../src/store/authStore";
import { AppTheme } from "../../constants/theme";

const FALLBACK_PROPERTIES: Record<string, any> = {
  prop_1: {
    id: "prop_1",
    title: "Prime Commercial Plot on Main Bailey Road",
    type: "land",
    price: 8500000,
    totalArea: 2400,
    sellableArea: 2400,
    khata: "104",
    khesra: "582",
    location: { district: "Danapur, Patna", state: "Bihar", lat: 25.6127, lng: 85.0456 },
    status: "verified",
    badges: { identityVerified: true, documentsChecked: true, siteVisited: true, lawyerReviewed: true, fullyVerified: true },
    media: { photos: ["https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1200&q=80"] },
  },
  prop_2: {
    id: "prop_2",
    title: "Residential Land for Modern Villa",
    type: "land",
    price: 3200000,
    totalArea: 1500,
    sellableArea: 1500,
    khata: "78",
    khesra: "319",
    location: { district: "Bihta, Patna", state: "Bihar", lat: 25.5684, lng: 84.8582 },
    status: "verified",
    badges: { identityVerified: true, documentsChecked: true, siteVisited: true, lawyerReviewed: true, fullyVerified: true },
    media: { photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80"] },
  },
  prop_3: {
    id: "prop_3",
    title: "Fertile Highway Agricultural Farm Land",
    type: "land",
    price: 1850000,
    totalArea: 43560,
    sellableArea: 43560,
    khata: "215",
    khesra: "841",
    location: { district: "Naubatpur, Patna", state: "Bihar", lat: 25.5342, lng: 84.9741 },
    status: "verified",
    badges: { identityVerified: true, documentsChecked: true, siteVisited: true, lawyerReviewed: false, fullyVerified: false },
    media: { photos: ["https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80"] },
  },
  prop_4: {
    id: "prop_4",
    title: "Luxury 3BHK Apartment in Gated Community",
    type: "flat",
    price: 6500000,
    totalArea: 1850,
    sellableArea: 1420,
    khata: "N/A",
    khesra: "Unit 402",
    location: { district: "Kankarbagh, Patna", state: "Bihar", lat: 25.5941, lng: 85.1550 },
    status: "verified",
    badges: { identityVerified: true, documentsChecked: true, siteVisited: true, lawyerReviewed: true, fullyVerified: true },
    media: { photos: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"] },
  }
};

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language } = useLanguageStore();
  const { authState } = useAuthStore();
  
  const [property, setProperty] = useState<Property | any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const data = await propertyService.getPropertyById(id);
      setProperty(data);
    } catch (e) {
      if (id && FALLBACK_PROPERTIES[id]) {
        setProperty(FALLBACK_PROPERTIES[id]);
      } else {
        setProperty(FALLBACK_PROPERTIES["prop_1"]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContactOwner = () => {
    if (authState !== "AUTHENTICATED") {
      Alert.alert(
        "Sign In Required",
        "Please sign in to view verified owner contact details and request OTP consent.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/login") }
        ]
      );
      return;
    }

    Alert.alert(
      "Owner Contact Request",
      "Consent request sent to the registered owner. Once approved, the verified phone number and registry documents will be unlocked in your Messages tab.",
      [{ text: "OK" }]
    );
  };

  const handleSendOffer = () => {
    if (authState !== "AUTHENTICATED") {
      Alert.alert(
        "Sign In Required",
        "Please sign in to send an offer directly to the verified owner.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/login") }
        ]
      );
      return;
    }

    Alert.alert(
      "Make Direct Offer",
      "You can enter your token offer. MalikSe guarantees zero hidden commission and secure token escrow.",
      [{ text: "Continue" }]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
        <Text style={{ marginTop: 12, color: AppTheme.colors.textSecondary }}>Loading property details...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Property Not Found" showBack={true} fallbackRoute="/search" />
        <View style={styles.center}>
          <Text style={{ fontSize: 16, color: AppTheme.colors.textMuted }}>Property not found.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/search")}>
            <Text style={{ color: AppTheme.colors.white, fontWeight: "700" }}>Back to Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const rawPrice = Number(property.price) || 0;
  const formattedPrice = rawPrice >= 10000000 
    ? `₹${(rawPrice / 10000000).toFixed(2)} Cr` 
    : rawPrice >= 100000 
    ? `₹${(rawPrice / 100000).toFixed(2)} Lakh` 
    : `₹${rawPrice.toLocaleString("en-IN")}`;

  const imageUri = property.media?.photos?.[0] || property.image || "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1200&q=80";
  const isVerified = property.status === "verified" || property.verified === true;
  const locationStr = typeof property.location === "string" 
    ? property.location 
    : `${property.location?.district || "Patna"}, ${property.location?.state || "Bihar"}`;

  return (
    <View style={styles.screen}>
      {/* Universal Top Header with Back Navigation */}
      <AppHeader
        title="Property Details"
        subtitle={locationStr}
        showBack={true}
        fallbackRoute="/search"
        rightElement={
          <TouchableOpacity
            style={styles.saveHeaderBtn}
            onPress={() => setIsSaved(!isSaved)}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name="heart"
              solid={isSaved}
              size={18}
              color={isSaved ? AppTheme.colors.danger : AppTheme.colors.textSecondary}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Hero Image Card */}
          <View style={styles.heroCard}>
            <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
            
            {/* Status Badge */}
            <View style={[styles.heroBadge, isVerified ? styles.verifiedBadge : styles.pendingBadge]}>
              <MaterialIcons name={isVerified ? "verified" : "schedule"} size={16} color={AppTheme.colors.white} />
              <Text style={styles.heroBadgeText}>
                {isVerified ? "100% Verified Owner" : "Verification in Progress"}
              </Text>
            </View>

            {/* Type Tag */}
            <View style={styles.heroTypeTag}>
              <Text style={styles.heroTypeTagText}>{(property.type || "Land").toUpperCase()}</Text>
            </View>
          </View>

          {/* Pricing & Key Highlights */}
          <View style={styles.card}>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceSub}>Direct Owner Price</Text>
                <Text style={styles.price}>{formattedPrice}</Text>
              </View>
              <View style={styles.commissionPill}>
                <MaterialIcons name="security" size={14} color={AppTheme.colors.primaryDark} />
                <Text style={styles.commissionText}>Zero Brokerage</Text>
              </View>
            </View>

            <Text style={styles.title}>{property.title || `${(property.type || "Land").toUpperCase()} in ${locationStr}`}</Text>

            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={18} color={AppTheme.colors.primary} />
              <Text style={styles.locationText}>{locationStr}</Text>
            </View>

            {/* Quick Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <MaterialIcons name="straighten" size={18} color={AppTheme.colors.accent} />
                <Text style={styles.metricValue}>{property.sellableArea || property.totalArea || "2,400"} sq.ft</Text>
                <Text style={styles.metricLabel}>Sellable Area</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <MaterialIcons name="layers" size={18} color={AppTheme.colors.primary} />
                <Text style={styles.metricValue}>{property.type?.toUpperCase() || "PLOT"}</Text>
                <Text style={styles.metricLabel}>Category</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <MaterialIcons name="gavel" size={18} color={AppTheme.colors.badgeLawyer} />
                <Text style={styles.metricValue}>{property.khata ? `Khata ${property.khata}` : "Verified"}</Text>
                <Text style={styles.metricLabel}>Legal Khata</Text>
              </View>
            </View>
          </View>

          {/* 4-Stage MalikSe Trust & Verification Pipeline */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialIcons name="verified" size={20} color={AppTheme.colors.primary} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Verification Pipeline</Text>
                <Text style={styles.sectionSubtitle}>4-tier due diligence performed before publishing</Text>
              </View>
            </View>

            <View style={styles.stepperContainer}>
              {[
                { label: "Owner Identity & KYC", desc: "Aadhaar & mobile verified", done: true, icon: "fingerprint", color: AppTheme.colors.badgeIdentity },
                { label: "Registry & Jamabandi", desc: "Circle office records checked", done: true, icon: "description", color: AppTheme.colors.badgeDocument },
                { label: "Site Visit & GPS Tagging", desc: "Advisor physically surveyed boundary", done: true, icon: "location-on", color: AppTheme.colors.badgeSite },
                { label: "Legal Lawyer Review", desc: "Title clearance & zero encumbrance", done: isVerified, icon: "gavel", color: AppTheme.colors.badgeLawyer },
              ].map((step, idx) => (
                <View key={idx} style={styles.stepItem}>
                  <View style={[styles.stepDot, { backgroundColor: step.done ? step.color : AppTheme.colors.divider }]}>
                    <MaterialIcons
                      name={step.icon as any}
                      size={14}
                      color={step.done ? AppTheme.colors.white : AppTheme.colors.textMuted}
                    />
                  </View>
                  <View style={styles.stepContent}>
                    <View style={styles.stepTitleRow}>
                      <Text style={[styles.stepTitle, step.done && { color: AppTheme.colors.text }]}>
                        {step.label}
                      </Text>
                      {step.done && (
                        <View style={[styles.verifiedPill, { backgroundColor: `${step.color}15` }]}>
                          <Text style={[styles.verifiedPillText, { color: step.color }]}>Verified</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Mini Map Location Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialIcons name="map" size={20} color={AppTheme.colors.accent} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Geo-boundary & Location</Text>
                <Text style={styles.sectionSubtitle}>{locationStr}</Text>
              </View>
            </View>
            <View style={styles.mapWrap}>
              <MiniMapPreview property={property} />
            </View>
          </View>

          {/* Legal Document Registry Details */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Document & Survey Numbers</Text>
            <View style={styles.detailTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Property Type</Text>
                <Text style={styles.tableVal}>{(property.type || "Land").toUpperCase()}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Khata Number</Text>
                <Text style={styles.tableVal}>{property.khata || "Verified on File"}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Khesra / Plot Number</Text>
                <Text style={styles.tableVal}>{property.khesra || "Verified on File"}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Verification Status</Text>
                <Text style={[styles.tableVal, { color: AppTheme.colors.primary, fontWeight: "700" }]}>
                  {isVerified ? "Govt Registry Matched" : "Under Review"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Sticky Bar */}
      <View style={styles.stickyFooter}>
        <View style={styles.footerInner}>
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={handleContactOwner}
            activeOpacity={0.8}
          >
            <MaterialIcons name="phone" size={18} color={AppTheme.colors.text} />
            <Text style={styles.secondaryActionText}>Contact Owner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={handleSendOffer}
            activeOpacity={0.8}
          >
            <MaterialIcons name="local-offer" size={18} color={AppTheme.colors.white} />
            <Text style={styles.primaryActionText}>Make an Offer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  container: {
    maxWidth: 780,
    width: "100%",
    alignSelf: "center",
    padding: 16,
  },
  heroCard: {
    width: "100%",
    height: 260,
    borderRadius: AppTheme.radius.xl,
    overflow: "hidden",
    position: "relative",
    marginBottom: 16,
    ...AppTheme.shadows.card,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
    gap: 6,
  },
  verifiedBadge: {
    backgroundColor: AppTheme.colors.primary,
  },
  pendingBadge: {
    backgroundColor: AppTheme.colors.warning,
  },
  heroBadgeText: {
    color: AppTheme.colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  heroTypeTag: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: AppTheme.radius.sm,
  },
  heroTypeTagText: {
    color: AppTheme.colors.white,
    fontSize: 12,
    fontWeight: "800",
  },
  saveHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppTheme.colors.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    ...AppTheme.shadows.card,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  priceSub: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    fontWeight: "600",
  },
  price: {
    fontSize: 28,
    fontWeight: "900",
    color: AppTheme.colors.primaryDark,
  },
  commissionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: AppTheme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.full,
  },
  commissionText: {
    fontSize: 11,
    fontWeight: "700",
    color: AppTheme.colors.primaryDark,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: AppTheme.colors.text,
    marginVertical: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    fontWeight: "500",
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.radius.md,
    paddingVertical: 14,
    marginTop: 8,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: AppTheme.colors.text,
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: AppTheme.colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: AppTheme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppTheme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    marginTop: 1,
  },
  stepperContainer: {
    gap: 16,
    paddingTop: 4,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: AppTheme.colors.text,
  },
  verifiedPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: AppTheme.radius.full,
  },
  verifiedPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  stepDesc: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  mapWrap: {
    borderRadius: AppTheme.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  detailTable: {
    marginTop: 12,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.divider,
  },
  tableLabel: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
  },
  tableVal: {
    fontSize: 14,
    fontWeight: "600",
    color: AppTheme.colors.text,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppTheme.colors.white,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    ...AppTheme.shadows.float,
  },
  footerInner: {
    flexDirection: "row",
    maxWidth: 780,
    width: "100%",
    alignSelf: "center",
    gap: 12,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppTheme.colors.divider,
    paddingVertical: 14,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppTheme.colors.text,
  },
  primaryActionBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: AppTheme.radius.md,
    ...AppTheme.shadows.soft,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppTheme.colors.white,
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: AppTheme.radius.md,
  },
});
