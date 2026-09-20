import React, { useState, useMemo } from "react";
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
  Image,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { propertyService } from "../../src/services/propertyService";
import { documentService } from "../../src/services/documentService";
import { useAuthStore } from "../../src/store/authStore";
import { useLanguageStore } from "../../src/store/languageStore";
import { t } from "../../src/i18n/translations";
import MapParcelPicker from "../../components/MapParcelPicker";
import AppHeader from "../../components/AppHeader";

const heroScenicImg = require("../../assets/messages_hero_scenic.jpg");

const DOC_TYPES = [
  "Registry (केवाला)",
  "Mutation (दाखिल-खारिज)",
  "LPC / Jamabandi",
  "Map (नक्शा)",
  "Rent Receipt (लगान रसीद)",
  "Owner ID Proof",
] as const;
type DocType = typeof DOC_TYPES[number];

interface PickedDoc {
  asset: any;
  docType: DocType;
}

const BIHAR_DISTRICTS = [
  "Patna",
  "Danapur",
  "Bihta",
  "Gaya",
  "Muzaffarpur",
  "Bhagalpur",
  "Darbhanga",
  "Begusarai",
  "Purnia",
  "Arrah",
  "Vaishali",
  "Nalanda",
];

function formatIndianCurrencyWords(numStr: string): string {
  const n = parseInt(numStr.replace(/[^0-9]/g, ""), 10);
  if (isNaN(n) || n <= 0) return "";
  if (n >= 10000000) {
    const cr = (n / 10000000).toFixed(2);
    return `₹ ${cr.replace(/\.00$/, "")} Crore`;
  }
  if (n >= 100000) {
    const lk = (n / 100000).toFixed(2);
    return `₹ ${lk.replace(/\.00$/, "")} Lakh`;
  }
  if (n >= 1000) {
    return `₹ ${n.toLocaleString("en-IN")}`;
  }
  return `₹ ${n}`;
}

function getBiharLandUnits(sqftStr: string) {
  const sqft = parseFloat(sqftStr.replace(/[^0-9.]/g, ""));
  if (isNaN(sqft) || sqft <= 0) return null;
  const kattha = (sqft / 1361.25).toFixed(2);
  const dhur = (sqft / 68.06).toFixed(1);
  const bigha = (sqft / 27225).toFixed(2);
  return { kattha, dhur, bigha };
}

export default function CreateListingMobileScreen() {
  const router = useRouter();
  const { authState, user, accessToken } = useAuthStore();
  const { language } = useLanguageStore();
  const { width } = useWindowDimensions();

  // Current Step (1: Details, 2: Boundary Map, 3: Document Vault)
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<string>("land");
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("4500000");
  const [totalArea, setTotalArea] = useState<string>("2400");
  const [state, setState] = useState<string>("Bihar");
  const [district, setDistrict] = useState<string>("Patna");
  const [locality, setLocality] = useState<string>("Danapur Cantt / Saguna More");
  const [khata, setKhata] = useState<string>("104");
  const [khesra, setKhesra] = useState<string>("582");
  const [thanaNo, setThanaNo] = useState<string>("72");
  const [jamabandi, setJamabandi] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Map Polygon State
  const [parcelPoints, setParcelPoints] = useState<{ lat: number; lng: number }[]>([]);

  // Docs State
  const [documents, setDocuments] = useState<PickedDoc[]>([]);
  const [ownerConsentChecked, setOwnerConsentChecked] = useState<boolean>(true);

  // Computed helper values
  const currencyWords = useMemo(() => formatIndianCurrencyWords(price), [price]);
  const landUnits = useMemo(() => getBiharLandUnits(totalArea), [totalArea]);

  const handleBackNavigation = () => {
    if (step > 1 && !propertyId) {
      setStep(step - 1);
    } else {
      router.replace("/my-properties");
    }
  };

  const handleNextToMap = () => {
    if (!price || !totalArea || !state || !district) {
      Alert.alert(
        "Required Fields",
        "Please fill in Price, Total Area, State, and District before proceeding to the map."
      );
      return;
    }
    setStep(2);
  };

  const handleCreateProperty = async () => {
    if (authState !== "AUTHENTICATED" || !accessToken) {
      const msg =
        "Please sign in as a Property Owner to publish your property on the live server.";
      if (Platform.OS === "web") {
        const proceed = confirm(
          `${msg}\n\nDo you want to proceed to Step 3 in preview mode?`
        );
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
      Alert.alert(
        "Boundary Required",
        "Please tap on the map to plot at least 3 points for the property parcel boundary."
      );
      return;
    }

    setLoading(true);
    try {
      const prop = await propertyService.createProperty({
        type,
        title: title || `${type.toUpperCase()} in ${locality || district}, ${state}`,
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
          polygon: parcelPoints,
        },
      });
      setPropertyId(prop.id);
      setStep(3);
    } catch (e: any) {
      if (e.response?.status === 401) {
        const msg =
          "Your session has expired. Proceeding to Step 3 in preview mode.";
        Alert.alert("Notice", msg);
        setStep(3);
        return;
      }
      const msg =
        e.response?.data?.message ||
        "Failed to create property listing. Advancing in preview mode.";
      Alert.alert("Notice", msg);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocuments([
          ...documents,
          { asset: result.assets[0], docType: "Registry (केवाला)" },
        ]);
      }
    } catch (e) {
      console.log("Error picking document", e);
    }
  };

  const updateDocType = (idx: number, docType: DocType) => {
    setDocuments((docs) =>
      docs.map((d, i) => (i === idx ? { ...d, docType } : d))
    );
  };

  const removeDoc = (idx: number) => {
    setDocuments((docs) => docs.filter((_, i) => i !== idx));
  };

  const handleUploadAndFinish = async () => {
    if (!propertyId) {
      Alert.alert(
        "Listing Ready",
        "Listing details saved! Sign in to verify with MalikSe advisor.",
        [{ text: "View Listings", onPress: () => router.replace("/my-properties") }]
      );
      return;
    }

    setLoading(true);
    try {
      for (const { asset, docType } of documents) {
        const fileObj = {
          uri: asset.uri,
          name: asset.name || "document",
          type: asset.mimeType || "application/octet-stream",
        };
        await documentService.uploadDocument(
          propertyId,
          docType.split(" ")[0],
          fileObj as any,
          asset.name
        );
      }

      Alert.alert(
        "Listing Submitted! 🎉",
        "Your property has been submitted for GPS verification. A MalikSe Advisor will review documents shortly.",
        [
          {
            text: "Go to My Properties",
            onPress: () => router.replace("/my-properties"),
          },
        ]
      );
    } catch (e: any) {
      if (e.response?.status === 401) {
        Alert.alert(
          "Sign In Required",
          "Your session has expired. Please sign in as a Property Owner."
        );
        router.push("/login");
        return;
      }
      const msg = e.response?.data?.message || "Failed to upload documents";
      Alert.alert("Notice", msg, [
        {
          text: "Continue Anyway",
          onPress: () => router.replace("/my-properties"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* 1. Universal Top Header */}
      <AppHeader
        title={language === "hi" ? "संपत्ति पोस्ट करें" : "Post Property Listing"}
        subtitle={
          step === 1
            ? language === "hi"
              ? "चरण 1 • विवरण एवं कीमत"
              : "Step 1 of 3 • Property Details"
            : step === 2
            ? language === "hi"
              ? "चरण 2 • जीपीएस सीमा नक्शा"
              : "Step 2 of 3 • Boundary Map"
            : language === "hi"
            ? "चरण 3 • दस्तावेज़ सत्यापन"
            : "Step 3 of 3 • Document Vault"
        }
        showBack={true}
        onBackPress={handleBackNavigation}
        fallbackRoute="/my-properties"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ================= 2. HERO BANNER CONTAINER ================= */}
        <View style={styles.heroCardContainer}>
          {/* Scenic Background Image */}
          <Image
            source={heroScenicImg}
            style={styles.heroBackgroundImage}
            resizeMode="cover"
          />

          {/* Deep Forest Gradient Overlay */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="postHeroGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#022c22" stopOpacity="0.75" />
                  <Stop offset="55%" stopColor="#064e3b" stopOpacity="0.82" />
                  <Stop offset="100%" stopColor="#065f46" stopOpacity="0.94" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#postHeroGradient)" />
            </Svg>
          </View>

          {/* Content inside Hero Card */}
          <View style={styles.heroContentWrap}>
            {/* Top Row: Mini Tag & Top Right Plus Icon */}
            <View style={styles.heroTopRow}>
              <View style={styles.heroMiniTag}>
                <MaterialIcons name="verified" size={13} color="#A7F3D0" />
                <Text style={styles.heroMiniTagText}>
                  {language === "hi" ? "मालिकसे सत्यापित लिस्टिंग" : "MalikSe Verified Listing"}
                </Text>
              </View>

              {/* Floating Elevated Circular Plus Badge */}
              <View style={styles.heroPlusBadge}>
                <MaterialIcons name="add-business" size={20} color="#064E3B" />
              </View>
            </View>

            {/* Main Hero Titles */}
            <View style={styles.heroTitles}>
              <Text style={styles.heroMainTitle}>
                {language === "hi" ? "ज़मीन या मकान पोस्ट करें" : "List Your Land or Property"}
              </Text>
              <Text style={styles.heroSubTitle}>
                {language === "hi"
                  ? "बिहार भर के सत्यापित खरीदारों तक 0% ब्रोकरेज के साथ पहुंचें"
                  : "Reach verified buyers across Bihar with zero brokerage hassle"}
              </Text>
            </View>

            {/* Trust Badges Pill Bar */}
            <View style={styles.heroTrustPill}>
              <View style={styles.heroTrustItem}>
                <MaterialIcons name="gps-fixed" size={13} color="#10B981" />
                <Text style={styles.heroTrustText}>
                  {language === "hi" ? "जीपीएस सीमा" : "GPS Boundary"}
                </Text>
              </View>
              <View style={styles.heroTrustDot} />
              <View style={styles.heroTrustItem}>
                <MaterialIcons name="verified-user" size={13} color="#10B981" />
                <Text style={styles.heroTrustText}>
                  {language === "hi" ? "सरकारी खाता-खेसरा" : "Govt Records"}
                </Text>
              </View>
              <View style={styles.heroTrustDot} />
              <View style={styles.heroTrustItem}>
                <MaterialIcons name="lock" size={13} color="#10B981" />
                <Text style={styles.heroTrustText}>
                  {language === "hi" ? "सुरक्षित वॉल्ट" : "Secure Vault"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================= 3. MOBILE 3-STEPPER INDICATOR ================= */}
        <View style={styles.stepperContainer}>
          {/* Step 1: Details */}
          <TouchableOpacity
            style={[styles.stepperPill, step === 1 && styles.stepperPillActive]}
            onPress={() => setStep(1)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.stepperNumber,
                step === 1
                  ? styles.stepperNumberActive
                  : step > 1
                  ? styles.stepperNumberCompleted
                  : styles.stepperNumberInactive,
              ]}
            >
              {step > 1 ? (
                <MaterialIcons name="check" size={14} color="#059669" />
              ) : (
                <Text
                  style={[
                    styles.stepperNumberText,
                    step === 1 && styles.stepperNumberTextActive,
                  ]}
                >
                  1
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepperLabel,
                step === 1 && styles.stepperLabelActive,
              ]}
            >
              {language === "hi" ? "विवरण" : "Details"}
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.stepperConnector,
              step > 1 && styles.stepperConnectorActive,
            ]}
          />

          {/* Step 2: Boundary Map */}
          <TouchableOpacity
            style={[styles.stepperPill, step === 2 && styles.stepperPillActive]}
            onPress={() => setStep(2)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.stepperNumber,
                step === 2
                  ? styles.stepperNumberActive
                  : step > 2
                  ? styles.stepperNumberCompleted
                  : styles.stepperNumberInactive,
              ]}
            >
              {step > 2 ? (
                <MaterialIcons name="check" size={14} color="#059669" />
              ) : (
                <Text
                  style={[
                    styles.stepperNumberText,
                    step === 2 && styles.stepperNumberTextActive,
                  ]}
                >
                  2
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepperLabel,
                step === 2 && styles.stepperLabelActive,
              ]}
            >
              {language === "hi" ? "सीमा नक्शा" : "Boundary"}
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.stepperConnector,
              step > 2 && styles.stepperConnectorActive,
            ]}
          />

          {/* Step 3: Document Vault */}
          <TouchableOpacity
            style={[styles.stepperPill, step === 3 && styles.stepperPillActive]}
            onPress={() => setStep(3)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.stepperNumber,
                step === 3
                  ? styles.stepperNumberActive
                  : styles.stepperNumberInactive,
              ]}
            >
              <Text
                style={[
                  styles.stepperNumberText,
                  step === 3 && styles.stepperNumberTextActive,
                ]}
              >
                3
              </Text>
            </View>
            <Text
              style={[
                styles.stepperLabel,
                step === 3 && styles.stepperLabelActive,
              ]}
            >
              {language === "hi" ? "कागज़ात" : "Docs Vault"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Unauthenticated Landowner Notice */}
        {authState !== "AUTHENTICATED" && (
          <View style={styles.authNoticeCard}>
            <MaterialIcons name="lock-outline" size={20} color="#D97706" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.authNoticeTitle}>
                {language === "hi" ? "भू-स्वामी लॉगिन सूचना" : "Landowner Sign-In Notice"}
              </Text>
              <Text style={styles.authNoticeSub}>
                {language === "hi"
                  ? "आप प्रीव्यू मोड में हैं। साइन-इन करके सीधे सत्यापित खरीदारों को बेचें।"
                  : "Previewing in guest mode. Sign in to publish directly to verified buyers."}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.authNoticeBtn}
              onPress={() => router.push("/login")}
              activeOpacity={0.8}
            >
              <Text style={styles.authNoticeBtnText}>
                {language === "hi" ? "साइन इन" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STEP 1: PROPERTY DETAILS & PRICING ================= */}
        {step === 1 && (
          <View style={styles.formCard}>
            {/* Section Header */}
            <View style={styles.formSectionHeader}>
              <View style={styles.formSectionIconWrap}>
                <MaterialIcons name="tune" size={18} color="#059669" />
              </View>
              <View>
                <Text style={styles.formSectionTitle}>
                  {language === "hi" ? "संपत्ति की प्राथमिक जानकारी" : "Property Specifications"}
                </Text>
                <Text style={styles.formSectionSubtitle}>
                  {language === "hi"
                    ? "प्रकार, आकार, कीमत और स्थान दर्ज करें"
                    : "Enter type, dimensions, pricing & location"}
                </Text>
              </View>
            </View>

            {/* Property Type Grid (4 Visual Cards) */}
            <Text style={styles.inputLabel}>
              {language === "hi" ? "संपत्ति का प्रकार *" : "Property Category *"}
            </Text>
            <View style={styles.categoryGrid}>
              {[
                {
                  id: "land",
                  title: language === "hi" ? "प्लॉट / ज़मीन" : "Plot / Land",
                  icon: "terrain",
                  sub: "Residential or Agro",
                },
                {
                  id: "house",
                  title: language === "hi" ? "मकान / विला" : "House / Villa",
                  icon: "home",
                  sub: "Independent Home",
                },
                {
                  id: "flat",
                  title: language === "hi" ? "फ़्लैट / अपार्टमेंट" : "Flat / Apartment",
                  icon: "apartment",
                  sub: "Multi-story Unit",
                },
                {
                  id: "commercial",
                  title: language === "hi" ? "व्यावसायिक ज़मीन" : "Commercial",
                  icon: "business",
                  sub: "Shop / Godown / Land",
                },
              ].map((item) => {
                const isSelected = type === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.categoryCardItem,
                      isSelected && styles.categoryCardItemActive,
                    ]}
                    onPress={() => setType(item.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.categoryCardIconBox,
                        isSelected && styles.categoryCardIconBoxActive,
                      ]}
                    >
                      <MaterialIcons
                        name={item.icon as any}
                        size={22}
                        color={isSelected ? "#059669" : "#64748B"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryCardTitle,
                        isSelected && styles.categoryCardTitleActive,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.categoryCardSub}>{item.sub}</Text>
                    {isSelected && (
                      <View style={styles.categoryCheckBadge}>
                        <MaterialIcons name="check" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Listing Title */}
            <Text style={styles.inputLabel}>
              {language === "hi" ? "लिस्टिंग शीर्षक (वैकल्पिक)" : "Listing Title (Optional)"}
            </Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="title" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInputWithIcon}
                placeholder={
                  language === "hi"
                    ? "उदा: 2400 वर्गफ़ीट कॉमर्शियल प्लॉट, बेली रोड"
                    : "e.g. 2400 sq.ft Prime Plot on Bailey Road"
                }
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Expected Price Card with Live Words */}
            <View style={styles.pricingCard}>
              <View style={styles.pricingHeaderRow}>
                <Text style={styles.inputLabelNoMargin}>
                  {language === "hi" ? "अपेक्षित मूल्य (Expected Price) *" : "Expected Price (₹) *"}
                </Text>
                {currencyWords ? (
                  <View style={styles.currencyWordsChip}>
                    <Text style={styles.currencyWordsText}>{currencyWords}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.priceInputWrap}>
                <Text style={styles.currencyRupeePrefix}>₹</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="e.g. 4500000"
                  placeholderTextColor="#94A3B8"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.priceHelpText}>
                {language === "hi"
                  ? "सीधे खरीदारों से बातचीत होगी, कोई बिचौलिया शुल्क नहीं"
                  : "Direct buyer inquiries with zero intermediary brokerage"}
              </Text>
            </View>

            {/* Total Area with Bihar Land Units Converter */}
            <View style={styles.areaCard}>
              <Text style={styles.inputLabelNoMargin}>
                {language === "hi" ? "कुल क्षेत्रफल (Total Area in sq.ft) *" : "Total Area (sq.ft) *"}
              </Text>
              <View style={styles.inputWrap}>
                <MaterialIcons name="square-foot" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInputWithIcon}
                  placeholder="e.g. 2400"
                  placeholderTextColor="#94A3B8"
                  value={totalArea}
                  onChangeText={setTotalArea}
                  keyboardType="numeric"
                />
                <Text style={styles.inputSuffix}>sq.ft</Text>
              </View>

              {/* Bihar Land Measurement Conversion Pill */}
              {landUnits && (
                <View style={styles.biharUnitsBar}>
                  <View style={styles.biharUnitItem}>
                    <Text style={styles.biharUnitValue}>{landUnits.kattha}</Text>
                    <Text style={styles.biharUnitLabel}>कट्ठा (Kattha)</Text>
                  </View>
                  <View style={styles.biharUnitDivider} />
                  <View style={styles.biharUnitItem}>
                    <Text style={styles.biharUnitValue}>{landUnits.dhur}</Text>
                    <Text style={styles.biharUnitLabel}>धुर (Dhur)</Text>
                  </View>
                  <View style={styles.biharUnitDivider} />
                  <View style={styles.biharUnitItem}>
                    <Text style={styles.biharUnitValue}>{landUnits.bigha}</Text>
                    <Text style={styles.biharUnitLabel}>बीघा (Bigha)</Text>
                  </View>
                </View>
              )}

              {/* Quick Area Preset Buttons */}
              <View style={styles.quickAreaRow}>
                <Text style={styles.quickAreaLabel}>Quick Pick:</Text>
                {[
                  { label: "1 Kattha (1361 sq.ft)", val: "1361" },
                  { label: "2 Kattha (2722 sq.ft)", val: "2722" },
                  { label: "5 Kattha (6806 sq.ft)", val: "6806" },
                ].map((preset) => (
                  <TouchableOpacity
                    key={preset.val}
                    style={styles.quickAreaChip}
                    onPress={() => setTotalArea(preset.val)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickAreaChipText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location & District Selector */}
            <Text style={styles.inputLabel}>
              {language === "hi" ? "ज़िला (District) *" : "District in Bihar *"}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.districtScrollContainer}
            >
              {BIHAR_DISTRICTS.map((d) => {
                const isSelected = district === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.districtChip,
                      isSelected && styles.districtChipActive,
                    ]}
                    onPress={() => setDistrict(d)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.districtChipText,
                        isSelected && styles.districtChipTextActive,
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Locality / Landmark */}
            <Text style={styles.inputLabel}>
              {language === "hi" ? "स्थान / मोहल्ला / लैंडमार्क *" : "Locality / Landmark *"}
            </Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="place" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInputWithIcon}
                placeholder="e.g. Danapur Cantt, Near Railway Station"
                placeholderTextColor="#94A3B8"
                value={locality}
                onChangeText={setLocality}
              />
            </View>

            {/* Bihar Govt Revenue & Survey Identifiers (दखल-कब्ज़ा व कागज़ात) */}
            <View style={styles.govtRecordsCard}>
              <View style={styles.govtRecordsHeader}>
                <View style={styles.govtRecordsBadge}>
                  <MaterialIcons name="security" size={16} color="#059669" />
                  <Text style={styles.govtRecordsBadgeText}>
                    {language === "hi" ? "सरकारी भू-अभिलेख" : "Bihar Land Registry"}
                  </Text>
                </View>
                <Text style={styles.govtRecordsSub}>
                  {language === "hi"
                    ? "खाता व खेसरा नंबर डालने से लिस्टिंग 3x तेज़ी से सत्यापित होती है"
                    : "Adding Khata/Khesra speeds up advisor verification by 3x"}
                </Text>
              </View>

              <View style={styles.twoColRow}>
                <View style={styles.colHalf}>
                  <Text style={styles.smallInputLabel}>
                    {language === "hi" ? "खाता संख्या (Khata No.)" : "Khata No."}
                  </Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="e.g. 104"
                    placeholderTextColor="#94A3B8"
                    value={khata}
                    onChangeText={setKhata}
                  />
                </View>
                <View style={styles.colHalf}>
                  <Text style={styles.smallInputLabel}>
                    {language === "hi" ? "खेसरा संख्या (Khesra No.)" : "Khesra / Plot No."}
                  </Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="e.g. 582"
                    placeholderTextColor="#94A3B8"
                    value={khesra}
                    onChangeText={setKhesra}
                  />
                </View>
              </View>

              <View style={styles.twoColRow}>
                <View style={styles.colHalf}>
                  <Text style={styles.smallInputLabel}>
                    {language === "hi" ? "थाना संख्या (Thana No.)" : "Thana No."}
                  </Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="e.g. 72"
                    placeholderTextColor="#94A3B8"
                    value={thanaNo}
                    onChangeText={setThanaNo}
                  />
                </View>
                <View style={styles.colHalf}>
                  <Text style={styles.smallInputLabel}>
                    {language === "hi" ? "जमाबंदी संख्या (Jamabandi)" : "Jamabandi No."}
                  </Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="Optional"
                    placeholderTextColor="#94A3B8"
                    value={jamabandi}
                    onChangeText={setJamabandi}
                  />
                </View>
              </View>
            </View>

            {/* Description / Highlights */}
            <Text style={styles.inputLabel}>
              {language === "hi" ? "संपत्ति का विवरण (विवरण जोड़ें)" : "Property Description (Optional)"}
            </Text>
            <TextInput
              style={styles.textAreaInput}
              placeholder={
                language === "hi"
                  ? "सड़क की चौड़ाई, आस-पास की सुविधाएं, पानी-बिजली कनेक्टिविटी..."
                  : "Road width (e.g. 30 ft road), water/electricity, nearby amenities..."
              }
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={3}
            />

            {/* Step 1 Submit Button */}
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleNextToMap}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionText}>
                {language === "hi"
                  ? "अगला: नक्शे पर सीमा बनाएं"
                  : "Next: Plot Boundary on Map"}
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STEP 2: BOUNDARY MAP MARKING ================= */}
        {step === 2 && (
          <View style={styles.formCard}>
            {/* Section Header with Tip */}
            <View style={styles.formSectionHeader}>
              <View style={styles.formSectionIconWrap}>
                <MaterialIcons name="map" size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formSectionTitle}>
                  {language === "hi" ? "ज़मीन की जीपीएस बाउंड्री बनाएं" : "Mark Property Boundary"}
                </Text>
                <Text style={styles.formSectionSubtitle}>
                  {language === "hi"
                    ? "नक्शे पर प्लॉट के कोनों पर टैप करके सीमा निर्धारित करें"
                    : "Tap corners on map to define polygon perimeter"}
                </Text>
              </View>
            </View>

            {/* Instructions Guide Pill */}
            <View style={styles.mapTipBanner}>
              <MaterialIcons name="info" size={18} color="#059669" />
              <Text style={styles.mapTipText}>
                {language === "hi"
                  ? "कम से कम 3 बिंदु (Points) जोड़कर भू-खंड पूरा करें। जीपीएस बाउंड्री से खरीदारों का विश्वास 10 गुना बढ़ता है।"
                  : "Plot at least 3 points around property perimeter. GPS parcels receive 10x higher buyer engagement."}
              </Text>
            </View>

            {/* Map Parcel Component */}
            <View style={styles.mobileMapBox}>
              <MapParcelPicker
                initialPoints={parcelPoints}
                onParcelChange={setParcelPoints}
                areaSqFt={totalArea || "2,400"}
              />
            </View>

            {/* Parcel Points Counter Pill */}
            <View style={styles.parcelStatusRow}>
              <View style={styles.parcelCountPill}>
                <MaterialIcons
                  name={parcelPoints.length >= 3 ? "check-circle" : "radio-button-unchecked"}
                  size={16}
                  color={parcelPoints.length >= 3 ? "#059669" : "#D97706"}
                />
                <Text style={styles.parcelCountText}>
                  {parcelPoints.length} {language === "hi" ? "बिंदु चिह्नित" : "Points Marked"}
                  {parcelPoints.length >= 3 ? " • Ready" : " (Min 3 needed)"}
                </Text>
              </View>

              {parcelPoints.length > 0 && (
                <TouchableOpacity
                  style={styles.clearMapBtn}
                  onPress={() => setParcelPoints([])}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="refresh" size={15} color="#DC2626" />
                  <Text style={styles.clearMapBtnText}>
                    {language === "hi" ? "रीसेट करें" : "Clear Points"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Step 2 Bottom Navigation Buttons */}
            <View style={styles.twoBtnRow}>
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => setStep(1)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={18} color="#065F46" />
                <Text style={styles.secondaryActionText}>
                  {language === "hi" ? "पिछला चरण" : "Back"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryActionButtonFlex}
                onPress={handleCreateProperty}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryActionText}>
                      {language === "hi" ? "सहेजें और अगला" : "Save & Next"}
                    </Text>
                    <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= STEP 3: DOCUMENT VAULT & VERIFICATION ================= */}
        {step === 3 && (
          <View style={styles.formCard}>
            {/* Section Header */}
            <View style={styles.formSectionHeader}>
              <View style={styles.formSectionIconWrap}>
                <MaterialIcons name="verified-user" size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formSectionTitle}>
                  {language === "hi" ? "दस्तावेज़ वॉल्ट (कागज़ात सत्यापन)" : "Document Vault & Verification"}
                </Text>
                <Text style={styles.formSectionSubtitle}>
                  {language === "hi"
                    ? "स्वामित्व प्रमाण पत्र अपलोड करके 'ब्लू टिक' बैज पाएं"
                    : "Attach legal land papers to earn MalikSe Verified Badge"}
                </Text>
              </View>
            </View>

            {/* Recommended Document Categories Chips */}
            <Text style={styles.inputLabel}>
              {language === "hi" ? "मान्य दस्तावेज़ प्रकार:" : "Accepted Document Categories:"}
            </Text>
            <View style={styles.docTypesWrap}>
              {DOC_TYPES.map((dt) => (
                <View key={dt} style={styles.docTypeBadge}>
                  <MaterialIcons name="check" size={13} color="#059669" />
                  <Text style={styles.docTypeBadgeText}>{dt}</Text>
                </View>
              ))}
            </View>

            {/* Big Touch-Friendly Upload Dropzone */}
            <TouchableOpacity
              style={styles.mobileUploadDropzone}
              onPress={handlePickDocument}
              activeOpacity={0.8}
            >
              <View style={styles.mobileUploadIconCircle}>
                <MaterialIcons name="cloud-upload" size={28} color="#059669" />
              </View>
              <Text style={styles.mobileUploadTitle}>
                {language === "hi" ? "दस्तावेज़ चुनें या फ़ोटो खींचें" : "Upload Land Documents"}
              </Text>
              <Text style={styles.mobileUploadSubtitle}>
                {language === "hi"
                  ? "PDF, JPG या PNG (केवाला, दाखिल-खारिज, रसीद)"
                  : "PDF, JPG or PNG (Registry, Mutation, LPC, Map)"}
              </Text>
              <View style={styles.mobileUploadBtnTag}>
                <MaterialIcons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.mobileUploadBtnTagText}>
                  {language === "hi" ? "फ़ाइल जोड़ें" : "Browse Files"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Uploaded Documents List */}
            {documents.length > 0 && (
              <View style={styles.uploadedDocsList}>
                <Text style={styles.uploadedDocsHeading}>
                  {language === "hi"
                    ? `अपलोड किए गए दस्तावेज़ (${documents.length})`
                    : `Attached Documents (${documents.length})`}
                </Text>

                {documents.map(({ asset, docType }, idx) => (
                  <View key={idx} style={styles.docCardItem}>
                    <View style={styles.docCardHeader}>
                      <View style={styles.docFileIconBox}>
                        <MaterialIcons name="description" size={20} color="#059669" />
                      </View>
                      <View style={{ flex: 1, marginHorizontal: 8 }}>
                        <Text style={styles.docFileName} numberOfLines={1}>
                          {asset.name || `Document_${idx + 1}`}
                        </Text>
                        <Text style={styles.docFileSize}>
                          {asset.size ? `${(asset.size / 1024).toFixed(0)} KB` : "File Ready"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeDoc(idx)}
                        style={styles.docDeleteBtn}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    {/* Category Selector Chips */}
                    <Text style={styles.docCategorySelectLabel}>
                      {language === "hi" ? "श्रेणी चुनें:" : "Select Category:"}
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.docCategoryChipsRow}
                    >
                      {DOC_TYPES.map((dt) => {
                        const isChipActive = docType === dt;
                        return (
                          <TouchableOpacity
                            key={dt}
                            style={[
                              styles.docCategoryChip,
                              isChipActive && styles.docCategoryChipActive,
                            ]}
                            onPress={() => updateDocType(idx, dt)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.docCategoryChipText,
                                isChipActive && styles.docCategoryChipTextActive,
                              ]}
                            >
                              {dt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                ))}
              </View>
            )}

            {/* Owner Consent Declaration */}
            <TouchableOpacity
              style={styles.declarationWrap}
              onPress={() => setOwnerConsentChecked(!ownerConsentChecked)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={ownerConsentChecked ? "check-box" : "check-box-outline-blank"}
                size={22}
                color={ownerConsentChecked ? "#059669" : "#94A3B8"}
              />
              <Text style={styles.declarationText}>
                {language === "hi"
                  ? "मैं प्रमाणित करता/करती हूँ कि मैं इस संपत्ति का वैध मालिक अथवा अधिकृत प्रतिनिधि हूँ और दी गई जानकारी पूर्णतः सही है।"
                  : "I declare that I am the legal owner / authorized representative of this property and the provided details are accurate."}
              </Text>
            </TouchableOpacity>

            {/* Security Guarantee Box */}
            <View style={styles.securityBox}>
              <MaterialIcons name="lock" size={16} color="#059669" />
              <Text style={styles.securityBoxText}>
                {language === "hi"
                  ? "आपके दस्तावेज़ 256-bit एन्क्रिप्शन के साथ मलिकसे सुरक्षित वॉल्ट में संग्रहीत हैं।"
                  : "Your documents are securely encrypted in MalikSe Protected Vault."}
              </Text>
            </View>

            {/* Step 3 Action Buttons */}
            <View style={styles.twoBtnRow}>
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => setStep(2)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={18} color="#065F46" />
                <Text style={styles.secondaryActionText}>
                  {language === "hi" ? "पिछला चरण" : "Back"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.primaryActionButtonFlex,
                  !ownerConsentChecked && { opacity: 0.6 },
                ]}
                onPress={handleUploadAndFinish}
                disabled={loading || !ownerConsentChecked}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryActionText}>
                      {language === "hi" ? "लिस्टिंग प्रकाशित करें" : "Publish Listing"}
                    </Text>
                    <MaterialIcons name="check" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 60,
  },

  /* ================= HERO BANNER CONTAINER ================= */
  heroCardContainer: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#064E3B",
    elevation: 4,
    shadowColor: "#064E3B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  heroBackgroundImage: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
    opacity: 0.4,
  },
  heroContentWrap: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  heroMiniTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(6, 78, 59, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(167, 243, 208, 0.4)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
    gap: 5,
  },
  heroMiniTagText: {
    fontSize: 11,
    color: "#A7F3D0",
    fontWeight: "700",
  },
  heroPlusBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroTitles: {
    marginBottom: 14,
  },
  heroMainTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  heroSubTitle: {
    fontSize: 12.5,
    color: "#D1FAE5",
    marginTop: 4,
    lineHeight: 17,
  },
  heroTrustPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(2, 44, 34, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(167, 243, 208, 0.3)",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 8,
    alignSelf: "flex-start",
  },
  heroTrustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroTrustText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ECFDF5",
  },
  heroTrustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#A7F3D0",
  },

  /* ================= 3-STEPPER INDICATOR ================= */
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  stepperPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  stepperPillActive: {
    backgroundColor: "#ECFDF5",
  },
  stepperNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperNumberActive: {
    backgroundColor: "#059669",
  },
  stepperNumberCompleted: {
    backgroundColor: "#E6F4EA",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  stepperNumberInactive: {
    backgroundColor: "#F1F5F9",
  },
  stepperNumberText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#64748B",
  },
  stepperNumberTextActive: {
    color: "#FFFFFF",
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  stepperLabelActive: {
    color: "#065F46",
    fontWeight: "800",
  },
  stepperConnector: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 4,
  },
  stepperConnectorActive: {
    backgroundColor: "#059669",
  },

  /* Unauthenticated Banner */
  authNoticeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  authNoticeTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#92400E",
  },
  authNoticeSub: {
    fontSize: 11,
    color: "#B45309",
    marginTop: 2,
    lineHeight: 15,
  },
  authNoticeBtn: {
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  authNoticeBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  /* Form Main Card */
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  formSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  formSectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    justifyContent: "center",
    alignItems: "center",
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  formSectionSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },

  /* Inputs & Labels */
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    marginTop: 10,
  },
  inputLabelNoMargin: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInputWithIcon: {
    flex: 1,
    fontSize: 13.5,
    color: "#0F172A",
    paddingVertical: 10,
  },
  inputSuffix: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 6,
  },
  textAreaInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#0F172A",
    textAlignVertical: "top",
    minHeight: 72,
    marginBottom: 14,
  },

  /* Category Grid (4 Cards) */
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  categoryCardItem: {
    width: "48.5%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    position: "relative",
  },
  categoryCardItemActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#059669",
  },
  categoryCardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryCardIconBoxActive: {
    backgroundColor: "#D1FAE5",
    borderColor: "#A7F3D0",
  },
  categoryCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  categoryCardTitleActive: {
    color: "#065F46",
    fontWeight: "800",
  },
  categoryCardSub: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 2,
  },
  categoryCheckBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Pricing Card */
  pricingCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
  },
  pricingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 6,
  },
  currencyWordsChip: {
    backgroundColor: "#DCFCE7",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9999,
    borderWidth: 0.5,
    borderColor: "#86EFAC",
  },
  currencyWordsText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#15803D",
  },
  priceInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  currencyRupeePrefix: {
    fontSize: 20,
    fontWeight: "800",
    color: "#059669",
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    paddingVertical: 8,
  },
  priceHelpText: {
    fontSize: 11,
    color: "#166534",
    marginTop: 6,
  },

  /* Area Card */
  areaCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
  },
  biharUnitsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  biharUnitItem: {
    alignItems: "center",
  },
  biharUnitValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#065F46",
  },
  biharUnitLabel: {
    fontSize: 10.5,
    color: "#047857",
    marginTop: 2,
    fontWeight: "600",
  },
  biharUnitDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#A7F3D0",
  },
  quickAreaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  quickAreaLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  quickAreaChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  quickAreaChipText: {
    fontSize: 10.5,
    color: "#334155",
    fontWeight: "600",
  },

  /* District Scroll */
  districtScrollContainer: {
    gap: 6,
    paddingBottom: 6,
  },
  districtChip: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  districtChipActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  districtChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  districtChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* Bihar Govt Records Card */
  govtRecordsCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
  },
  govtRecordsHeader: {
    marginBottom: 10,
  },
  govtRecordsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ECFDF5",
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#A7F3D0",
  },
  govtRecordsBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#065F46",
  },
  govtRecordsSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 15,
  },
  twoColRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  colHalf: {
    flex: 1,
  },
  smallInputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
  smallInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12.5,
    color: "#0F172A",
  },

  /* Action Buttons */
  primaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 14,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryActionText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* Step 2 Map Specific Styles */
  mapTipBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginBottom: 12,
  },
  mapTipText: {
    fontSize: 11.5,
    color: "#065F46",
    flex: 1,
    lineHeight: 16,
    fontWeight: "600",
  },
  mobileMapBox: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    marginBottom: 12,
  },
  parcelStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  parcelCountPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9999,
    gap: 6,
  },
  parcelCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  clearMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  clearMapBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
  twoBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    gap: 6,
  },
  secondaryActionText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#334155",
  },
  primaryActionButtonFlex: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    gap: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },

  /* Step 3 Document Vault Specific Styles */
  docTypesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  docTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    gap: 4,
  },
  docTypeBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#065F46",
  },
  mobileUploadDropzone: {
    borderWidth: 2,
    borderColor: "#059669",
    borderStyle: "dashed",
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    marginVertical: 8,
  },
  mobileUploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  mobileUploadTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#065F46",
  },
  mobileUploadSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  mobileUploadBtnTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 9999,
    gap: 5,
    marginTop: 12,
  },
  mobileUploadBtnTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Uploaded Documents */
  uploadedDocsList: {
    marginTop: 14,
    marginBottom: 6,
  },
  uploadedDocsHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  docCardItem: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  docCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  docFileIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  docFileName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  docFileSize: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  docDeleteBtn: {
    padding: 6,
  },
  docCategorySelectLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    marginTop: 8,
    marginBottom: 4,
  },
  docCategoryChipsRow: {
    gap: 6,
  },
  docCategoryChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  docCategoryChipActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  docCategoryChipText: {
    fontSize: 10.5,
    color: "#475569",
    fontWeight: "600",
  },
  docCategoryChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* Declaration & Security */
  declarationWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 12,
    padding: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  declarationText: {
    flex: 1,
    fontSize: 11,
    color: "#334155",
    lineHeight: 16,
  },
  securityBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginVertical: 12,
  },
  securityBoxText: {
    fontSize: 11,
    color: "#065F46",
    flex: 1,
    lineHeight: 15,
  },
});
