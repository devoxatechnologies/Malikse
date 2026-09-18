import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import PropertyCard from "../../components/PropertyCard";
import { AppTheme } from "../../constants/theme";

const DUMMY_SAVED = [
  { 
    id: "prop_1", 
    title: "Prime Commercial Plot on Main Bailey Road", 
    price: 8500000, 
    location: { district: "Danapur, Patna", state: "Bihar" }, 
    sellableArea: 2400,
    type: "land",
    status: "verified",
    badges: { identityVerified: true, documentsChecked: true, siteVisited: true, lawyerReviewed: true },
    media: { photos: ["https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80"] } 
  },
  { 
    id: "prop_2", 
    title: "Residential Land for Modern Villa", 
    price: 3200000, 
    location: { district: "Bihta, Patna", state: "Bihar" }, 
    sellableArea: 1500,
    type: "land",
    status: "verified",
    badges: { identityVerified: true, documentsChecked: true, siteVisited: true, lawyerReviewed: true },
    media: { photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"] } 
  }
];

export default function SavedScreen() {
  const router = useRouter();
  const [saved, setSaved] = useState(DUMMY_SAVED);

  const handleRemove = (id: string) => {
    setSaved(saved.filter(item => item.id !== id));
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Saved Properties"
        subtitle={`${saved.length} shortlisted plots`}
        showBack={true}
        fallbackRoute="/search"
      />

      <View style={styles.container}>
        <FlatList
          data={saved}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onSave={handleRemove}
              isSaved={true}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <FontAwesome5 name="heart-broken" size={36} color={AppTheme.colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No saved properties</Text>
              <Text style={styles.emptySub}>When you explore properties, tap the heart icon to shortlist your favorites here.</Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => router.replace("/search")}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreBtnTxt}>Explore Verified Properties</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  container: { maxWidth: 720, width: "100%", alignSelf: "center", flex: 1 },
  listPadding: { padding: 16, paddingBottom: 40 },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 80, padding: 24 },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppTheme.colors.divider,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: AppTheme.colors.text },
  emptySub: { fontSize: 13, color: AppTheme.colors.textMuted, textAlign: "center", marginTop: 6, maxWidth: 300 },
  exploreBtn: {
    marginTop: 20,
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: AppTheme.radius.md,
    ...AppTheme.shadows.soft,
  },
  exploreBtnTxt: { color: AppTheme.colors.white, fontWeight: "700", fontSize: 14 },
});
