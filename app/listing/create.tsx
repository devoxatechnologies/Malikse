import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { propertyService } from "../../src/services/propertyService";
import { documentService } from "../../src/services/documentService";
import { useAuthStore } from "../../src/store/authStore";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import MapParcelPicker from "../../components/MapParcelPicker";
import AppHeader from "../../components/AppHeader";
import { AppTheme } from "../../constants/theme";

const DOC_TYPES = ["Registry", "Mutation", "LPC/Jamabandi", "Map", "Rent Receipt", "Owner ID Proof"] as const;
type DocType = typeof DOC_TYPES[number];

interface PickedDoc {
  asset: any;
  docType: DocType;
}

export default function CreateListingScreen() {
  const router = useRouter();
  const { authState, user, accessToken } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<string>("land");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [state, setState] = useState("Bihar");
  const [district, setDistrict] = useState("Patna");
  const [khata, setKhata] = useState("");
  const [khesra, setKhesra] = useState("");
  
  // Map State
  const [parcelPoints, setParcelPoints] = useState<{ lat: number; lng: number }[]>([]);

  // Docs State
  const [documents, setDocuments] = useState<PickedDoc[]>([]);

  const handleBackNavigation = () => {
    if (step > 1 && !propertyId) {
      setStep(step - 1);
    } else {
      router.replace("/my-properties");
    }
  };

  const handleNextToMap = () => {
    if (!price || !totalArea || !state || !district) {
      Alert.alert("Required Fields", "Please fill in Price, Total Area, State, and District before proceeding.");
      return;
    }
    setStep(2);
  };

  const handleCreateProperty = async () => {
    if (authState !== "AUTHENTICATED" || !accessToken) {
      const msg = "Please sign in as a Property Owner to register and publish your property.";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Sign In Required", msg);
      }
      router.push("/login");
      return;
    }

    if (parcelPoints.length < 3) {
      if (Platform.OS === "web") {
        alert("Please draw a polygon boundary with at least 3 points on the map");
      } else {
        Alert.alert("Boundary Required", "Please tap on the map to plot at least 3 points for the property parcel.");
      }
      return;
    }

    setLoading(true);
    try {
      const prop = await propertyService.createProperty({
        type,
        title: title || `${type.toUpperCase()} in ${district}, ${state}`,
        price: Number(price),
        totalArea: Number(totalArea),
        sellableArea: Number(totalArea),
        khata: khata || undefined,
        khesra: khesra || undefined,
        location: {
          state,
          district,
          lat: parcelPoints[0].lat,
          lng: parcelPoints[0].lng,
          polygon: parcelPoints
        }
      });
      setPropertyId(prop.id);
      setStep(3);
    } catch (e: any) {
      if (e.response?.status === 401) {
        const msg = "Your session has expired or you are not signed in. Please sign in as a Property Owner to continue.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Sign In Required", msg);
        router.push("/login");
        return;
      }
      const msg = e.response?.data?.message || "Failed to create property listing";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocuments([...documents, { asset: result.assets[0], docType: "Registry" }]);
      }
    } catch (e) {
      console.log("Error picking document", e);
    }
  };

  const updateDocType = (idx: number, docType: DocType) => {
    setDocuments(docs => docs.map((d, i) => i === idx ? { ...d, docType } : d));
  };

  const removeDoc = (idx: number) => {
    setDocuments(docs => docs.filter((_, i) => i !== idx));
  };

  const handleUploadAndFinish = async () => {
    if (!propertyId) {
      router.replace("/my-properties");
      return;
    }
    setLoading(true);
    try {
      for (const { asset, docType } of documents) {
        let fileObj: any;
        if (Platform.OS === "web") {
          const res = await fetch(asset.uri);
          const blob = await res.blob();
          fileObj = new File([blob], asset.name || "document", { type: asset.mimeType });
        } else {
          fileObj = {
            uri: asset.uri,
            name: asset.name || "document",
            type: asset.mimeType || "application/octet-stream"
          };
        }
        await documentService.uploadDocument(propertyId, docType, fileObj, asset.name);
      }

      if (Platform.OS === "web") {
        alert("Listing and documents submitted! MalikSe Advisor will review shortly.");
        router.replace("/my-properties");
      } else {
        Alert.alert("Success", "Listing submitted! MalikSe Advisor will review shortly.", [
          { text: "View Listings", onPress: () => router.replace("/my-properties") }
        ]);
      }
    } catch (e: any) {
      if (e.response?.status === 401) {
        const msg = "Your session has expired. Please sign in as a Property Owner to continue.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Sign In Required", msg);
        router.push("/login");
        return;
      }
      const msg = e.response?.data?.message || "Failed to upload documents";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Universal Top Header with Back Navigation */}
      <AppHeader
        title="Post Property Listing"
        subtitle={`Step ${step} of 3 • ${step === 1 ? "Property Details" : step === 2 ? "Boundary Map" : "Document Vault"}`}
        showBack={true}
        onBackPress={handleBackNavigation}
        fallbackRoute="/my-properties"
      />

      {/* Progress Bar Indicator */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Unauthenticated Landowner Notice */}
          {authState !== "AUTHENTICATED" && (
            <View style={styles.authNoticeBanner}>
              <View style={styles.authNoticeLeft}>
                <MaterialIcons name="lock" size={20} color="#D97706" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.authNoticeTitle}>Landowner Sign-In Required</Text>
                  <Text style={styles.authNoticeSub}>
                    You must sign in as a registered Property Owner to register parcel boundaries & publish listings on MalikSe.
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.authNoticeBtn} 
                onPress={() => router.push("/login")}
                activeOpacity={0.8}
              >
                <Text style={styles.authNoticeBtnText}>Sign In Now &rarr;</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 1: Details & Pricing */}
          {step === 1 && (
            <View style={styles.card}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>1</Text></View>
                <View>
                  <Text style={styles.cardTitle}>Basic Property Information</Text>
                  <Text style={styles.cardSub}>Enter your land or property specifications</Text>
                </View>
              </View>

              {/* Property Type Selector */}
              <Text style={styles.fieldLabel}>Property Type *</Text>
              <View style={styles.typeRow}>
                {[
                  { key: "land", label: "Plot / Land", icon: "terrain" },
                  { key: "house", label: "House / Villa", icon: "home" },
                  { key: "flat", label: "Apartment / Flat", icon: "apartment" },
                ].map(item => (
                  <TouchableOpacity 
                    key={item.key} 
                    style={[styles.typeBtn, type === item.key && styles.typeBtnActive]}
                    onPress={() => setType(item.key)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={item.icon as any}
                      size={20}
                      color={type === item.key ? AppTheme.colors.primaryDark : AppTheme.colors.textMuted}
                    />
                    <Text style={[styles.typeTxt, type === item.key && styles.typeTxtActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Listing Title */}
              <Text style={styles.fieldLabel}>Listing Title (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2400 sq.ft Commercial Plot on Bailey Road"
                placeholderTextColor={AppTheme.colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              {/* Location Fields */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>State *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    value={state}
                    onChangeText={setState}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>District *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="District"
                    value={district}
                    onChangeText={setDistrict}
                  />
                </View>
              </View>

              {/* Pricing & Area */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Expected Price (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5000000"
                    placeholderTextColor={AppTheme.colors.textMuted}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Total Area (sq.ft) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2400"
                    placeholderTextColor={AppTheme.colors.textMuted}
                    value={totalArea}
                    onChangeText={setTotalArea}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Govt Survey Identifiers */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Khata No. (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 104"
                    value={khata}
                    onChangeText={setKhata}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Khesra / Plot No. (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 582"
                    value={khesra}
                    onChangeText={setKhesra}
                  />
                </View>
              </View>

              {/* Next Step Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleNextToMap}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnTxt}>Next: Plot Boundary on Map</Text>
                <MaterialIcons name="arrow-forward" size={18} color={AppTheme.colors.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Boundary Map */}
          {step === 2 && (
            <View style={styles.card}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>2</Text></View>
                <View>
                  <Text style={styles.cardTitle}>Draw Property Boundaries</Text>
                  <Text style={styles.cardSub}>Tap points on the map to define the exact parcel outline</Text>
                </View>
              </View>

              <View style={styles.mapWrap}>
                <MapParcelPicker onParcelChange={setParcelPoints} />
              </View>

              <View style={styles.navRow}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => setStep(1)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="arrow-back" size={18} color={AppTheme.colors.text} />
                  <Text style={styles.secondaryBtnTxt}>Previous Step</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1.5, marginTop: 0 }]}
                  onPress={handleCreateProperty}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnTxt}>Save & Next</Text>
                      <MaterialIcons name="arrow-forward" size={18} color={AppTheme.colors.white} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: Document Vault */}
          {step === 3 && (
            <View style={styles.card}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>3</Text></View>
                <View>
                  <Text style={styles.cardTitle}>Document Vault & Verification</Text>
                  <Text style={styles.cardSub}>Attach ownership documents for advisor speed verification</Text>
                </View>
              </View>

              {/* Upload Dropzone */}
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={handlePickDocument}
                activeOpacity={0.8}
              >
                <View style={styles.uploadIconWrap}>
                  <MaterialIcons name="cloud-upload" size={32} color={AppTheme.colors.primary} />
                </View>
                <Text style={styles.uploadTitle}>Choose Documents</Text>
                <Text style={styles.uploadSub}>PDF, JPG, or PNG (Registry, Mutation, Jamabandi)</Text>
              </TouchableOpacity>

              {/* Uploaded Documents List */}
              {documents.map(({ asset, docType }, idx) => (
                <View key={idx} style={styles.docItem}>
                  <View style={styles.docHeader}>
                    <MaterialIcons name="insert-drive-file" size={20} color={AppTheme.colors.primary} />
                    <Text style={styles.docName} numberOfLines={1}>{asset.name}</Text>
                    <TouchableOpacity onPress={() => removeDoc(idx)} style={styles.removeBtn}>
                      <MaterialIcons name="delete-outline" size={20} color={AppTheme.colors.danger} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.docTypeLabel}>Document Category:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                    {DOC_TYPES.map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.typeChip, docType === t && styles.typeChipActive]}
                        onPress={() => updateDocType(idx, t)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.typeChipTxt, docType === t && styles.typeChipTxtActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))}

              <View style={styles.navRow}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => setStep(2)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="arrow-back" size={18} color={AppTheme.colors.text} />
                  <Text style={styles.secondaryBtnTxt}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1.5, marginTop: 0 }]}
                  onPress={handleUploadAndFinish}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnTxt}>Finish & Submit Listing</Text>
                      <MaterialIcons name="check" size={18} color={AppTheme.colors.white} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  progressTrack: {
    height: 4,
    backgroundColor: AppTheme.colors.border,
    width: "100%",
  },
  progressBar: {
    height: "100%",
    backgroundColor: AppTheme.colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  container: {
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    ...AppTheme.shadows.card,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.divider,
  },
  stepNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: AppTheme.colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: AppTheme.colors.text,
  },
  cardSub: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: AppTheme.colors.text,
    marginBottom: 6,
    marginTop: 12,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.md,
    alignItems: "center",
    backgroundColor: AppTheme.colors.background,
    gap: 4,
  },
  typeBtnActive: {
    backgroundColor: AppTheme.colors.primaryLight,
    borderColor: AppTheme.colors.primary,
  },
  typeTxt: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    fontWeight: "600",
  },
  typeTxtActive: {
    color: AppTheme.colors.primaryDark,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "web" ? 12 : 10,
    fontSize: 14,
    color: AppTheme.colors.text,
    marginBottom: 8,
    outlineStyle: "none" as any,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: AppTheme.radius.md,
    marginTop: 20,
    ...AppTheme.shadows.soft,
  },
  primaryBtnTxt: {
    color: AppTheme.colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: AppTheme.colors.divider,
    paddingVertical: 14,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  secondaryBtnTxt: {
    color: AppTheme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  navRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  mapWrap: {
    borderRadius: AppTheme.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginVertical: 12,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: AppTheme.colors.primary,
    borderStyle: "dashed",
    borderRadius: AppTheme.radius.lg,
    padding: 24,
    alignItems: "center",
    backgroundColor: AppTheme.colors.primaryLight,
    marginVertical: 12,
  },
  uploadIconWrap: {
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: AppTheme.colors.primaryDark,
  },
  uploadSub: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    marginTop: 4,
  },
  docItem: {
    padding: 14,
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.radius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  docHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  docName: {
    marginLeft: 8,
    fontSize: 14,
    color: AppTheme.colors.text,
    fontWeight: "600",
    flex: 1,
  },
  removeBtn: {
    padding: 4,
  },
  docTypeLabel: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    marginBottom: 6,
    fontWeight: "600",
  },
  typeScroll: {
    flexDirection: "row",
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: AppTheme.radius.full,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.card,
    marginRight: 6,
  },
  typeChipActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  typeChipTxt: {
    fontSize: 11,
    color: AppTheme.colors.textSecondary,
    fontWeight: "600",
  },
  typeChipTxtActive: {
    color: AppTheme.colors.white,
  },
  authNoticeBanner: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  authNoticeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 260,
  },
  authNoticeTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#92400E",
  },
  authNoticeSub: {
    fontSize: 12,
    color: "#B45309",
    marginTop: 2,
    lineHeight: 18,
  },
  authNoticeBtn: {
    backgroundColor: "#059669",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  authNoticeBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
