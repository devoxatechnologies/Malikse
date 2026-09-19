import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { propertyService } from "../../src/services/propertyService";
import { documentService } from "../../src/services/documentService";
import { useAuthStore } from "../../src/store/authStore";
import { useLanguageStore } from "../../src/store/languageStore";
import { t } from "../../src/i18n/translations";
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
  const { language } = useLanguageStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  
  const [step, setStep] = useState(2); // Set default to Step 2 as active boundary map
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<string>("land");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("4500000");
  const [totalArea, setTotalArea] = useState("2400");
  const [state, setState] = useState("Bihar");
  const [district, setDistrict] = useState("Patna");
  const [khata, setKhata] = useState("");
  const [khesra, setKhesra] = useState("");
  
  // Map State - default empty until user taps and plots on the map
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
      // In dev mode, if not signed in, still allow previewing Step 3 or prompt
      const msg = "Please sign in as a Property Owner to publish your property on live server.";
      if (Platform.OS === "web") {
        const proceed = confirm(`${msg}\n\nDo you want to proceed to Step 3 in preview mode?`);
        if (proceed) {
          setStep(3);
          return;
        }
      } else {
        Alert.alert("Sign In Required", msg, [
          { text: "Sign In", onPress: () => router.push("/login") },
          { text: "Preview Step 3", onPress: () => setStep(3) },
        ]);
        return;
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
        const msg = "Your session has expired or you are not signed in. Proceeding to Step 3 in preview mode.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Notice", msg);
        setStep(3);
        return;
      }
      const msg = e.response?.data?.message || "Failed to create property listing. Advancing in preview mode.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Notice", msg);
      setStep(3);
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
        title={t(language, "post_property_listing") || "Post Property Listing"}
        subtitle={
          step === 1
            ? t(language, "post_step_1_sub") || "Step 1 of 3 • Property Details"
            : step === 2
            ? t(language, "post_step_2_sub") || "Step 2 of 3 • Boundary Map"
            : t(language, "post_step_3_sub") || "Step 3 of 3 • Document Vault"
        }
        showBack={true}
        onBackPress={handleBackNavigation}
        fallbackRoute="/my-properties"
      />

      {/* Progress Bar Indicator */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.container, step === 2 && styles.containerWide]}>
          {/* Unauthenticated Landowner Notice */}
          {authState !== "AUTHENTICATED" && (
            <View style={styles.authNoticeBanner}>
              <View style={styles.authNoticeLeft}>
                <MaterialIcons name="lock" size={20} color="#D97706" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.authNoticeTitle}>Landowner Sign-In Notice</Text>
                  <Text style={styles.authNoticeSub}>
                    You can preview parcel marking and tools. Signing in lets you publish directly to verified buyers.
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.authNoticeBtn} 
                onPress={() => router.push("/login")}
                activeOpacity={0.8}
              >
                <Text style={styles.authNoticeBtnText}>Sign In &rarr;</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* MAIN CARD CONTAINER */}
          <View style={[styles.card, step === 2 && styles.cardWide]}>
            {/* Top Horizontal Stepper (Step 1, Step 2, Step 3) matching screenshot */}
            <View style={styles.stepperWrap}>
              {/* Step 1: Basic Details */}
              <TouchableOpacity
                style={styles.stepperItem}
                onPress={() => setStep(1)}
                activeOpacity={0.7}
              >
                <View
                  style={
                    step === 1
                      ? styles.stepCircleActive
                      : styles.stepCircleCompleted
                  }
                >
                  <Text
                    style={
                      step === 1
                        ? styles.stepCircleActiveText
                        : styles.stepCircleCompletedText
                    }
                  >
                    1
                  </Text>
                </View>
                <View style={styles.stepLabelWrap}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Text
                      style={
                        step === 1
                          ? styles.stepTitleActive
                          : styles.stepTitleCompleted
                      }
                    >
                      {t(language, "step_basic_details") || "Basic Details"}
                    </Text>
                    {step > 1 && (
                      <MaterialIcons name="check-circle" size={16} color="#059669" />
                    )}
                  </View>
                  {step === 1 && (
                    <Text style={styles.stepSubActive}>
                      {t(language, "post_basic_sub") || "Enter specifications"}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Separator Chevron */}
              <MaterialIcons
                name="chevron-right"
                size={20}
                color="#CBD5E1"
                style={styles.stepArrowIcon}
              />

              {/* Step 2: Boundary Map */}
              <TouchableOpacity
                style={styles.stepperItem}
                onPress={() => setStep(2)}
                activeOpacity={0.7}
              >
                <View
                  style={
                    step === 2
                      ? styles.stepCircleActive
                      : step > 2
                      ? styles.stepCircleCompleted
                      : styles.stepCircleInactive
                  }
                >
                  <Text
                    style={
                      step === 2
                        ? styles.stepCircleActiveText
                        : step > 2
                        ? styles.stepCircleCompletedText
                        : styles.stepCircleInactiveText
                    }
                  >
                    2
                  </Text>
                </View>
                <View style={styles.stepLabelWrap}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Text
                      style={
                        step === 2
                          ? styles.stepTitleActive
                          : styles.stepTitleInactive
                      }
                    >
                      {t(language, "step_boundary_map") || "Boundary Map"}
                    </Text>
                    {step > 2 && (
                      <MaterialIcons name="check-circle" size={16} color="#059669" />
                    )}
                  </View>
                  <Text
                    style={
                      step === 2 ? styles.stepSubActive : styles.stepSubInactive
                    }
                  >
                    {t(language, "step_draw_boundary") || "Draw property boundary"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Separator Chevron */}
              <MaterialIcons
                name="chevron-right"
                size={20}
                color="#CBD5E1"
                style={styles.stepArrowIcon}
              />

              {/* Step 3: Review & Publish */}
              <TouchableOpacity
                style={styles.stepperItem}
                onPress={() => setStep(3)}
                activeOpacity={0.7}
              >
                <View
                  style={
                    step === 3
                      ? styles.stepCircleActive
                      : styles.stepCircleInactive
                  }
                >
                  <Text
                    style={
                      step === 3
                        ? styles.stepCircleActiveText
                        : styles.stepCircleInactiveText
                    }
                  >
                    3
                  </Text>
                </View>
                <View style={styles.stepLabelWrap}>
                  <Text
                    style={
                      step === 3
                        ? styles.stepTitleActive
                        : styles.stepTitleInactive
                    }
                  >
                    {t(language, "step_review_publish") || "Review & Publish"}
                  </Text>
                  <Text
                    style={
                      step === 3 ? styles.stepSubActive : styles.stepSubInactive
                    }
                  >
                    {t(language, "step_verify_post") || "Verify and post"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ================= STEP 1: Basic Details & Pricing ================= */}
            {step === 1 && (
              <View>
                <Text style={styles.fieldLabel}>{t(language, "post_type_label") || "Property Type *"}</Text>
                <View style={styles.typeRow}>
                  {[
                    { key: "land", label: t(language, "post_type_land") || "Plot / Land", icon: "terrain" },
                    { key: "house", label: t(language, "post_type_house") || "House / Villa", icon: "home" },
                    { key: "flat", label: t(language, "post_type_flat") || "Apartment / Flat", icon: "apartment" },
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
                        color={type === item.key ? "#065F46" : AppTheme.colors.textMuted}
                      />
                      <Text style={[styles.typeTxt, type === item.key && styles.typeTxtActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Listing Title */}
                <Text style={styles.fieldLabel}>{t(language, "post_listing_title_label") || "Listing Title (Optional)"}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t(language, "post_listing_title_ph") || "e.g. 2400 sq.ft Commercial Plot on Bailey Road"}
                  placeholderTextColor={AppTheme.colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />

                {/* Location Fields */}
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>{t(language, "post_state_label") || "State *"}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="State"
                      value={state}
                      onChangeText={setState}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>{t(language, "post_district_label") || "District *"}</Text>
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
                    <Text style={styles.fieldLabel}>{t(language, "post_price_label") || "Expected Price (₹) *"}</Text>
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
                    <Text style={styles.fieldLabel}>{t(language, "post_area_label") || "Total Area (sq.ft) *"}</Text>
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
                    <Text style={styles.fieldLabel}>{t(language, "post_khata_label") || "Khata No. (Optional)"}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 104"
                      value={khata}
                      onChangeText={setKhata}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>{t(language, "post_khesra_label") || "Khesra / Plot No. (Optional)"}</Text>
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
                  style={[styles.btnSaveNext, { width: "100%", marginTop: 24 }]}
                  onPress={handleNextToMap}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnSaveNextText}>
                    {t(language, "post_next_map_btn") || "Next: Plot Boundary on Map"}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 2: BOUNDARY MAP (USER SCREENSHOT MATCH) ================= */}
            {step === 2 && (
              <View>
                {/* Section Title Row with Right-Hand Tip Banner */}
                <View style={styles.sectionHeaderRow}>
                  <View style={{ flex: 1, minWidth: 260 }}>
                    <Text style={styles.sectionTitle}>
                      {t(language, "boundary_title") || "Draw Property Boundary"}
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      {t(language, "boundary_sub") || "Tap points on the map to define the exact parcel outline."}
                    </Text>
                  </View>

                  {/* Light Mint Tip Box matching screenshot */}
                  <View style={styles.tipBox}>
                    <MaterialIcons name="lightbulb" size={18} color="#059669" />
                    <Text style={styles.tipBoxText}>
                      {t(language, "boundary_tip") || "Be as accurate as possible for better visibility and trusted buyers."}
                    </Text>
                  </View>
                </View>

                {/* Map and Sidebar Workspace */}
                <View style={styles.mapWrap}>
                  <MapParcelPicker
                    initialPoints={parcelPoints}
                    onParcelChange={setParcelPoints}
                    areaSqFt={totalArea || "2,400"}
                  />
                </View>

                {/* Bottom Navigation Buttons (Minimal Capsule Design) */}
                <View style={styles.bottomActionsRow}>
                  {/* Left: Previous Step (Mint Capsule Pill) */}
                  <TouchableOpacity
                    style={styles.btnPrevious}
                    onPress={() => setStep(1)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="arrow-back" size={18} color="#065F46" />
                    <Text style={styles.btnPreviousText}>
                      {t(language, "prev_step") || "Previous Step"}
                    </Text>
                  </TouchableOpacity>

                  {/* Right: Save & Next (Emerald Capsule Pill) */}
                  <TouchableOpacity
                    style={styles.btnSaveNext}
                    onPress={handleCreateProperty}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Text style={styles.btnSaveNextText}>
                          {t(language, "save_next") || "Save & Next"}
                        </Text>
                        <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ================= STEP 3: Document Vault ================= */}
            {step === 3 && (
              <View>
                <View style={styles.sectionHeaderRow}>
                  <View style={{ flex: 1, minWidth: 260 }}>
                    <Text style={styles.sectionTitle}>
                      {t(language, "post_vault_title") || "Document Vault & Verification"}
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      {t(language, "post_vault_sub") || "Attach ownership documents for advisor speed verification"}
                    </Text>
                  </View>
                </View>

                {/* Upload Dropzone */}
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={handlePickDocument}
                  activeOpacity={0.8}
                >
                  <View style={styles.uploadIconWrap}>
                    <MaterialIcons name="cloud-upload" size={32} color="#059669" />
                  </View>
                  <Text style={styles.uploadTitle}>
                    {t(language, "post_choose_docs") || "Choose Documents"}
                  </Text>
                  <Text style={styles.uploadSub}>
                    {t(language, "post_choose_docs_sub") || "PDF, JPG, or PNG (Registry, Mutation, Jamabandi)"}
                  </Text>
                </TouchableOpacity>

                {/* Uploaded Documents List */}
                {documents.map(({ asset, docType }, idx) => (
                  <View key={idx} style={styles.docItem}>
                    <View style={styles.docHeader}>
                      <MaterialIcons name="insert-drive-file" size={20} color="#059669" />
                      <Text style={styles.docName} numberOfLines={1}>{asset.name}</Text>
                      <TouchableOpacity onPress={() => removeDoc(idx)} style={styles.removeBtn}>
                        <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
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

                {/* Bottom Navigation Row */}
                <View style={styles.bottomActionsRow}>
                  <TouchableOpacity
                    style={styles.btnPrevious}
                    onPress={() => setStep(2)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="arrow-back" size={18} color="#065F46" />
                    <Text style={styles.btnPreviousText}>
                      {t(language, "prev_step") || "Previous Step"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnSaveNext}
                    onPress={handleUploadAndFinish}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Text style={styles.btnSaveNextText}>
                          {t(language, "post_finish_btn") || "Finish & Submit Listing"}
                        </Text>
                        <MaterialIcons name="check" size={18} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#059669",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  container: {
    maxWidth: 780,
    width: "100%",
    alignSelf: "center",
  },
  containerWide: {
    maxWidth: 1240,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardWide: {
    padding: Platform.OS === "web" ? 28 : 16,
  },

  /* Horizontal Stepper matching user screenshot */
  stepperWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  stepperItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepCircleActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActiveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  stepCircleCompleted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E6F4EA",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleCompletedText: {
    color: "#065F46",
    fontSize: 14,
    fontWeight: "800",
  },
  stepCircleInactive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleInactiveText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "700",
  },
  stepLabelWrap: {
    justifyContent: "center",
  },
  stepTitleActive: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  stepTitleCompleted: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  stepTitleInactive: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  stepSubActive: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  stepSubInactive: {
    fontSize: 11.5,
    color: "#94A3B8",
    marginTop: 2,
  },
  stepArrowIcon: {
    marginHorizontal: 8,
  },

  /* Section Title and Light Mint Tip Box */
  sectionHeaderRow: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    justifyContent: "space-between",
    alignItems: Platform.OS === "web" ? "center" : "flex-start",
    marginBottom: 20,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
    maxWidth: Platform.OS === "web" ? 440 : "100%",
  },
  tipBoxText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "600",
    lineHeight: 16,
    flex: 1,
  },

  /* Workspace */
  mapWrap: {
    width: "100%",
    marginBottom: 16,
  },

  /* Bottom Actions (Unified Pill Design) */
  bottomActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    gap: 16,
    flexWrap: "wrap",
  },
  btnPrevious: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F4EA",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    borderRadius: 9999,
    paddingVertical: 13,
    paddingHorizontal: 32,
    minWidth: 180,
    gap: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  btnPreviousText: {
    color: "#065F46",
    fontSize: 14,
    fontWeight: "800",
  },
  btnSaveNext: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    borderRadius: 9999,
    paddingVertical: 13,
    paddingHorizontal: 38,
    minWidth: 260,
    gap: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  btnSaveNextText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  /* Step 1 & Step 3 Inputs */
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
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
    borderColor: "#E2E8F0",
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    gap: 4,
  },
  typeBtnActive: {
    backgroundColor: "#E6F4EA",
    borderColor: "#059669",
  },
  typeTxt: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  typeTxtActive: {
    color: "#065F46",
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "web" ? 11 : 9,
    fontSize: 13.5,
    color: "#0F172A",
    marginBottom: 8,
    outlineStyle: "none" as any,
  },

  /* Document Upload in Step 3 */
  uploadBox: {
    borderWidth: 2,
    borderColor: "#059669",
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    marginVertical: 12,
  },
  uploadIconWrap: {
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#065F46",
  },
  uploadSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  docItem: {
    padding: 14,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  docHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  docName: {
    marginLeft: 8,
    fontSize: 13.5,
    color: "#0F172A",
    fontWeight: "600",
    flex: 1,
  },
  removeBtn: {
    padding: 4,
  },
  docTypeLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 6,
    fontWeight: "600",
  },
  typeScroll: {
    flexDirection: "row",
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },
  typeChipActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  typeChipTxt: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  typeChipTxtActive: {
    color: "#FFFFFF",
  },

  /* Unauthenticated Banner */
  authNoticeBanner: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 14,
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
    fontSize: 13.5,
    fontWeight: "800",
    color: "#92400E",
  },
  authNoticeSub: {
    fontSize: 12,
    color: "#B45309",
    marginTop: 2,
    lineHeight: 17,
  },
  authNoticeBtn: {
    backgroundColor: "#059669",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  authNoticeBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
