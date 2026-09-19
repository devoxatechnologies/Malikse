import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import { useLanguageStore } from "../src/store/languageStore";
import { t } from "../src/i18n/translations";

interface CorridorInsight {
  id: string;
  name: { en: string; hi: string };
  category: "patna" | "bihta" | "ringroad" | "rajgir";
  avgRateSqFt: number;
  avgRateKattha: string;
  govtMvrSqFt: number;
  growthYoY: string;
  isTopPerformer?: boolean;
  catalyst: { en: string; hi: string };
}

const CORRIDOR_DATA: CorridorInsight[] = [
  {
    id: "bihta",
    name: {
      en: "Bihta Mega Growth Corridor",
      hi: "बिहटा मेगा ग्रोथ गलियारा",
    },
    category: "bihta",
    avgRateSqFt: 1750,
    avgRateKattha: "₹23.8 L",
    govtMvrSqFt: 1100,
    growthYoY: "+24.8%",
    isTopPerformer: true,
    catalyst: {
      en: "Bihta Civil Airport, IIT Patna, Mega IT & Industrial Growth Hub",
      hi: "बिहटा एयरपोर्ट, IIT पटना, मेगा IT व औद्योगिक विकास केंद्र",
    },
  },
  {
    id: "bailey",
    name: {
      en: "Bailey Road & Danapur",
      hi: "बेली रोड एवं दानापुर",
    },
    category: "patna",
    avgRateSqFt: 2150,
    avgRateKattha: "₹29.2 L",
    govtMvrSqFt: 1450,
    growthYoY: "+14.2%",
    catalyst: {
      en: "Patna Metro Corridor 1 & Danapur Railway Junction expansion",
      hi: "पटना मेट्रो कॉरिडोर 1 एवं दानापुर रेलवे जंक्शन का विस्तार",
    },
  },
  {
    id: "ringroad",
    name: {
      en: "Patna Outer Ring Road",
      hi: "पटना आउटर रिंग रोड",
    },
    category: "ringroad",
    avgRateSqFt: 1480,
    avgRateKattha: "₹20.1 L",
    govtMvrSqFt: 950,
    growthYoY: "+18.5%",
    catalyst: {
      en: "6-Lane Ring Road Expressway & New South Bihar Logistics Hub",
      hi: "6-लेन रिंग रोड एक्सप्रेसवे एवं दक्षिण बिहार लॉजिस्टिक्स केंद्र",
    },
  },
  {
    id: "khagaul",
    name: {
      en: "Khagaul - Phulwari Sharif Link",
      hi: "खगौल - फुलवारी शरीफ लिंक",
    },
    category: "patna",
    avgRateSqFt: 1620,
    avgRateKattha: "₹22.0 L",
    govtMvrSqFt: 1200,
    growthYoY: "+11.8%",
    catalyst: {
      en: "Proximity to AIIMS Patna & Commercial Khagaul Road expansion",
      hi: "AIIMS पटना की निकटता एवं खगौल रोड का चौड़ीकरण",
    },
  },
  {
    id: "rajgir",
    name: {
      en: "Rajgir - Nalanda Tourism Belt",
      hi: "राजगीर - नालंदा पर्यटन क्षेत्र",
    },
    category: "rajgir",
    avgRateSqFt: 1150,
    avgRateKattha: "₹15.6 L",
    govtMvrSqFt: 750,
    growthYoY: "+19.2%",
    catalyst: {
      en: "International Convention Centre, Film City & Glass Bridge Tourism",
      hi: "अंतर्राष्ट्रीय कन्वेंशन सेंटर, फिल्म सिटी एवं पर्यटन विकास",
    },
  },
];

export default function InsightsScreen() {
  const router = useRouter();
  const { language } = useLanguageStore();

  const [activeMainTab, setActiveMainTab] = useState<"rates" | "calculator" | "legal">("rates");
  const [corridorFilter, setCorridorFilter] = useState<"all" | "patna" | "bihta" | "ringroad" | "rajgir">("all");

  // Calculator State
  const [calcCorridorId, setCalcCorridorId] = useState<string>("bihta");
  const [calcUnit, setCalcUnit] = useState<"kattha" | "sqft">("kattha");
  const [calcAreaValue, setCalcAreaValue] = useState<string>("2");
  const [buyerGender, setBuyerGender] = useState<"male" | "female">("male");

  const filteredCorridors = CORRIDOR_DATA.filter((c) => {
    if (corridorFilter === "all") return true;
    return c.category === corridorFilter;
  });

  // Calculation logic
  const selectedCorridor = CORRIDOR_DATA.find((c) => c.id === calcCorridorId) || CORRIDOR_DATA[0];
  const numArea = parseFloat(calcAreaValue) || 0;
  const areaInSqFt = calcUnit === "kattha" ? numArea * 1361.25 : numArea;
  const estimatedMarketValue = Math.round(areaInSqFt * selectedCorridor.avgRateSqFt);
  const estimatedMvrValue = Math.round(areaInSqFt * selectedCorridor.govtMvrSqFt);
  
  // Bihar Stamp Duty: 6.0% for Male, 5.7% for Female on MVR or Transaction Value (whichever is higher)
  const stampDutyRate = buyerGender === "female" ? 0.057 : 0.06;
  const registrationFeeRate = 0.02; // 2% Registration fee in Bihar
  const baseValForTax = Math.max(estimatedMarketValue, estimatedMvrValue);
  const stampDutyAmt = Math.round(baseValForTax * stampDutyRate);
  const registrationAmt = Math.round(baseValForTax * registrationFeeRate);
  const totalGovtOutlay = stampDutyAmt + registrationAmt;
  // MalikSe 0% Brokerage Savings compared to traditional 2% broker fees
  const brokerageSaved = Math.round(estimatedMarketValue * 0.02);

  const formatRupees = (amt: number) => {
    if (!amt || amt <= 0) return "₹0";
    if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(2)} Cr`;
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(2)} L`;
    return `₹${amt.toLocaleString("en-IN")}`;
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={t(language, "insights_page_title") || "Land Market Insights"}
        subtitle={
          t(language, "insights_page_subtitle") ||
          "Bihar & Patna land price trends, government MVR rates & legal diligence guide"
        }
        showBack={true}
        fallbackRoute="/search"
        showLanguageToggle={true}
        showPostPropertyBtn={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Compact Centered Container (maxWidth: 740, matching other core pages) */}
        <View style={styles.container}>
          {/* ================= 1. KEY MARKET PULSE METRICS ================= */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>₹1,850</Text>
              <Text style={styles.metricUnit}>/ sq.ft</Text>
              <Text style={styles.metricLabel}>{t(language, "insights_stat_avg_rate") || "Avg Patna Rate"}</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: "#059669" }]}>+16.4%</Text>
              <Text style={styles.metricUnit}>YoY</Text>
              <Text style={styles.metricLabel}>{t(language, "insights_stat_growth") || "Annual Growth"}</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: "#D97706" }]}>100%</Text>
              <Text style={styles.metricUnit}>MVR</Text>
              <Text style={styles.metricLabel}>{t(language, "insights_stat_mvr_coverage") || "Govt Circle Rate"}</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: "#2563EB" }]}>₹1.65 L</Text>
              <Text style={styles.metricUnit}>avg</Text>
              <Text style={styles.metricLabel}>{t(language, "insights_stat_brokerage_saved") || "Brokerage Saved"}</Text>
            </View>
          </View>

          {/* ================= 2. MAIN SECTION SEGMENT PILLS ================= */}
          <View style={styles.segmentWrap}>
            <View style={styles.segmentTrack}>
              <TouchableOpacity
                style={[styles.segmentBtn, activeMainTab === "rates" && styles.segmentBtnActive]}
                onPress={() => setActiveMainTab("rates")}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="trending-up"
                  size={15}
                  color={activeMainTab === "rates" ? "#065F46" : "#64748B"}
                />
                <Text style={[styles.segmentBtnText, activeMainTab === "rates" && styles.segmentBtnTextActive]}>
                  {t(language, "insights_tab_rates") || "Price Trends"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, activeMainTab === "calculator" && styles.segmentBtnActive]}
                onPress={() => setActiveMainTab("calculator")}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="calculate"
                  size={15}
                  color={activeMainTab === "calculator" ? "#065F46" : "#64748B"}
                />
                <Text style={[styles.segmentBtnText, activeMainTab === "calculator" && styles.segmentBtnTextActive]}>
                  {t(language, "insights_tab_calc") || "Duty Calc"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, activeMainTab === "legal" && styles.segmentBtnActive]}
                onPress={() => setActiveMainTab("legal")}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="verified-user"
                  size={15}
                  color={activeMainTab === "legal" ? "#065F46" : "#64748B"}
                />
                <Text style={[styles.segmentBtnText, activeMainTab === "legal" && styles.segmentBtnTextActive]}>
                  {t(language, "insights_tab_legal") || "Legal Guide"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= 3. TAB CONTENT ================= */}
          {activeMainTab === "rates" && (
            <View style={styles.tabContentBlock}>
              {/* Corridor Category Filter Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.corridorFiltersRow}>
                <TouchableOpacity
                  style={[styles.corridorChip, corridorFilter === "all" && styles.corridorChipActive]}
                  onPress={() => setCorridorFilter("all")}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.corridorChipText, corridorFilter === "all" && styles.corridorChipTextActive]}>
                    {t(language, "insights_corridor_all") || "All Corridors"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.corridorChip, corridorFilter === "bihta" && styles.corridorChipActive]}
                  onPress={() => setCorridorFilter("bihta")}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.corridorChipText, corridorFilter === "bihta" && styles.corridorChipTextActive]}>
                    {t(language, "insights_corridor_bihta") || "Bihta Growth"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.corridorChip, corridorFilter === "patna" && styles.corridorChipActive]}
                  onPress={() => setCorridorFilter("patna")}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.corridorChipText, corridorFilter === "patna" && styles.corridorChipTextActive]}>
                    {t(language, "insights_corridor_patna") || "Patna Core"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.corridorChip, corridorFilter === "ringroad" && styles.corridorChipActive]}
                  onPress={() => setCorridorFilter("ringroad")}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.corridorChipText, corridorFilter === "ringroad" && styles.corridorChipTextActive]}>
                    {t(language, "insights_corridor_ringroad") || "Ring Road"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.corridorChip, corridorFilter === "rajgir" && styles.corridorChipActive]}
                  onPress={() => setCorridorFilter("rajgir")}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.corridorChipText, corridorFilter === "rajgir" && styles.corridorChipTextActive]}>
                    {t(language, "insights_corridor_rajgir") || "Rajgir"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Corridor Insights Cards */}
              <View style={styles.corridorList}>
                {filteredCorridors.map((item) => (
                  <View key={item.id} style={styles.corridorCard}>
                    {/* Header Row */}
                    <View style={styles.corridorHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.corridorTitle}>
                          {item.name[language === "hi" ? "hi" : "en"]}
                        </Text>
                        <Text style={styles.corridorKatthaSub}>
                          {item.avgRateKattha} / Kattha ({formatRupees(item.avgRateSqFt)}/sq.ft)
                        </Text>
                      </View>

                      {/* Growth Badge */}
                      <View style={[styles.growthPill, item.isTopPerformer && styles.growthPillTop]}>
                        <MaterialIcons
                          name="north-east"
                          size={13}
                          color={item.isTopPerformer ? "#065F46" : "#059669"}
                        />
                        <Text style={[styles.growthPillText, item.isTopPerformer && styles.growthPillTextTop]}>
                          {item.growthYoY} YoY
                        </Text>
                      </View>
                    </View>

                    {/* Benchmark Strip */}
                    <View style={styles.benchmarkStrip}>
                      <View style={styles.benchmarkItem}>
                        <Text style={styles.benchmarkLabel}>Market Benchmark</Text>
                        <Text style={styles.benchmarkVal}>₹{item.avgRateSqFt.toLocaleString("en-IN")}/sq.ft</Text>
                      </View>
                      <View style={styles.benchmarkDivider} />
                      <View style={styles.benchmarkItem}>
                        <Text style={styles.benchmarkLabel}>Govt MVR (Circle Rate)</Text>
                        <Text style={[styles.benchmarkVal, { color: "#D97706" }]}>
                          ₹{item.govtMvrSqFt.toLocaleString("en-IN")}/sq.ft
                        </Text>
                      </View>
                      <View style={styles.benchmarkDivider} />
                      <View style={styles.benchmarkItem}>
                        <Text style={styles.benchmarkLabel}>Demand Index</Text>
                        <Text style={[styles.benchmarkVal, { color: "#059669" }]}>High Demand</Text>
                      </View>
                    </View>

                    {/* Growth Catalyst */}
                    <View style={styles.catalystRow}>
                      <MaterialIcons name="bolt" size={14} color="#059669" />
                      <Text style={styles.catalystText} numberOfLines={2}>
                        {item.catalyst[language === "hi" ? "hi" : "en"]}
                      </Text>
                    </View>

                    {/* Action Button */}
                    <View style={styles.corridorActionRow}>
                      <TouchableOpacity
                        style={styles.browseCorridorBtn}
                        onPress={() => router.push("/search")}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.browseCorridorBtnText}>
                          {language === "hi" ? "इस क्षेत्र में प्लॉट देखें" : "Browse Verified Plots Here"}
                        </Text>
                        <MaterialIcons name="arrow-forward" size={14} color="#065F46" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: STAMP DUTY & VALUATION CALCULATOR */}
          {activeMainTab === "calculator" && (
            <View style={styles.tabContentBlock}>
              <View style={styles.calcCard}>
                {/* Title */}
                <Text style={styles.calcHeading}>
                  {t(language, "insights_calc_title") || "Bihar Land Valuation & Stamp Duty Estimator"}
                </Text>
                <Text style={styles.calcSubHeading}>
                  {t(language, "insights_calc_sub") ||
                    "Instant calculation based on Bihar Registration Department MVR guidelines"}
                </Text>

                {/* Corridor Selector */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    {t(language, "insights_select_corridor") || "Select Corridor / Area"}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calcCorridorScroll}>
                    {CORRIDOR_DATA.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.calcCorridorChip, calcCorridorId === c.id && styles.calcCorridorChipActive]}
                        onPress={() => setCalcCorridorId(c.id)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.calcCorridorChipText,
                            calcCorridorId === c.id && styles.calcCorridorChipTextActive,
                          ]}
                        >
                          {c.name[language === "hi" ? "hi" : "en"]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Area Input with Unit Switch */}
                <View style={styles.formGroup}>
                  <View style={styles.areaLabelRow}>
                    <Text style={styles.formLabel}>
                      {t(language, "insights_area_label") || "Land Area"}
                    </Text>
                    {/* Unit Switcher */}
                    <View style={styles.unitSwitcher}>
                      <TouchableOpacity
                        style={[styles.unitBtn, calcUnit === "kattha" && styles.unitBtnActive]}
                        onPress={() => setCalcUnit("kattha")}
                      >
                        <Text style={[styles.unitBtnText, calcUnit === "kattha" && styles.unitBtnTextActive]}>
                          {t(language, "insights_unit_kattha") || "Kattha"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.unitBtn, calcUnit === "sqft" && styles.unitBtnActive]}
                        onPress={() => setCalcUnit("sqft")}
                      >
                        <Text style={[styles.unitBtnText, calcUnit === "sqft" && styles.unitBtnTextActive]}>
                          {t(language, "insights_unit_sqft") || "Sq.Ft"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.calcInputWrap}>
                    <TextInput
                      style={styles.calcInput}
                      keyboardType="numeric"
                      value={calcAreaValue}
                      onChangeText={setCalcAreaValue}
                      placeholder="e.g. 2"
                      placeholderTextColor="#94A3B8"
                    />
                    <Text style={styles.calcInputUnit}>
                      {calcUnit === "kattha" ? "Kattha (1 Kattha = 1361.25 sq.ft)" : "sq.ft"}
                    </Text>
                  </View>
                </View>

                {/* Buyer Gender (Bihar grants Stamp Duty concession for women) */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    {language === "hi" ? "क्रेता लिंग (महिला स्टांप शुल्क छूट)" : "Buyer (Stamp Duty Concession)"}
                  </Text>
                  <View style={styles.genderRow}>
                    <TouchableOpacity
                      style={[styles.genderBtn, buyerGender === "male" && styles.genderBtnActive]}
                      onPress={() => setBuyerGender("male")}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name="person"
                        size={15}
                        color={buyerGender === "male" ? "#065F46" : "#64748B"}
                      />
                      <Text style={[styles.genderBtnText, buyerGender === "male" && styles.genderBtnTextActive]}>
                        {language === "hi" ? "पुरुष (6% स्टांप शुल्क)" : "Male (6% Stamp Duty)"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.genderBtn, buyerGender === "female" && styles.genderBtnActive]}
                      onPress={() => setBuyerGender("female")}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name="person-outline"
                        size={15}
                        color={buyerGender === "female" ? "#065F46" : "#64748B"}
                      />
                      <Text style={[styles.genderBtnText, buyerGender === "female" && styles.genderBtnTextActive]}>
                        {language === "hi" ? "महिला (5.7% छूट दर)" : "Female (5.7% Concession)"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Calculation Results Card */}
                <View style={styles.resultsBox}>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>
                      {t(language, "insights_est_market_val") || "Est. Market Value"}
                    </Text>
                    <Text style={styles.resultValBig}>{formatRupees(estimatedMarketValue)}</Text>
                  </View>

                  <View style={styles.resultDivider} />

                  <View style={styles.resultItemSmall}>
                    <Text style={styles.resultSmallLabel}>
                      {t(language, "insights_est_govt_mvr") || "Govt MVR Value"}
                    </Text>
                    <Text style={styles.resultSmallVal}>{formatRupees(estimatedMvrValue)}</Text>
                  </View>

                  <View style={styles.resultItemSmall}>
                    <Text style={styles.resultSmallLabel}>
                      {language === "hi" ? "स्टांप शुल्क" : "Stamp Duty"} ({buyerGender === "female" ? "5.7%" : "6.0%"})
                    </Text>
                    <Text style={styles.resultSmallVal}>{formatRupees(stampDutyAmt)}</Text>
                  </View>

                  <View style={styles.resultItemSmall}>
                    <Text style={styles.resultSmallLabel}>
                      {language === "hi" ? "निबंधन शुल्क (Registration Fee)" : "Registration Fee"} (2.0%)
                    </Text>
                    <Text style={styles.resultSmallVal}>{formatRupees(registrationAmt)}</Text>
                  </View>

                  <View style={styles.resultDivider} />

                  {/* Total Govt Registration Outlay */}
                  <View style={styles.resultItemSmall}>
                    <Text style={[styles.resultSmallLabel, { fontWeight: "700", color: "#0F172A" }]}>
                      {t(language, "insights_stamp_duty") || "Est. Stamp Duty & Registration"}
                    </Text>
                    <Text style={[styles.resultSmallVal, { fontWeight: "800", color: "#0F172A" }]}>
                      {formatRupees(totalGovtOutlay)}
                    </Text>
                  </View>

                  {/* 0% Brokerage Savings Highlight */}
                  <View style={styles.brokerageSavingsHighlight}>
                    <MaterialIcons name="savings" size={18} color="#059669" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.savingsTitle}>
                        {t(language, "insights_brokerage_savings") || "Brokerage Saved on MalikSe"}
                      </Text>
                      <Text style={styles.savingsSub}>
                        {language === "hi"
                          ? `पारंपरिक दलालों की 2% दलाली के मुकाबले आपकी सीधी बचत: ${formatRupees(brokerageSaved)}`
                          : `Direct 0% brokerage model saves you ${formatRupees(brokerageSaved)} vs local agents`}
                      </Text>
                    </View>
                    <Text style={styles.savingsAmt}>{formatRupees(brokerageSaved)}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* TAB 3: LEGAL DUE DILIGENCE GUIDE */}
          {activeMainTab === "legal" && (
            <View style={styles.tabContentBlock}>
              <View style={styles.legalHeader}>
                <Text style={styles.legalTitle}>
                  {t(language, "insights_legal_guide_title") || "4-Pillar Due Diligence for Bihar Land"}
                </Text>
                <Text style={styles.legalSub}>
                  {t(language, "insights_legal_guide_sub") ||
                    "Essential steps to avoid land disputes and verify clean titles in Bihar"}
                </Text>
              </View>

              <View style={styles.pillarsGrid}>
                {/* Pillar 1: Jamabandi & Mutation */}
                <View style={styles.pillarCard}>
                  <View style={styles.pillarHeader}>
                    <View style={styles.pillarNumberCircle}>
                      <Text style={styles.pillarNumber}>1</Text>
                    </View>
                    <Text style={styles.pillarCardTitle}>
                      {language === "hi" ? "जमाबंदी एवं दाखिल-खारिज" : "Jamabandi & Mutation (Dakhil-Kharij)"}
                    </Text>
                  </View>
                  <Text style={styles.pillarCardDesc}>
                    {language === "hi"
                      ? "biharbhumi.bihar.gov.in पर रजिस्टर-II में विक्रेता के नाम जमाबंदी अनिवार्य रूप से डिजिटल होनी चाहिए। चालू वित्तीय वर्ष की लगान रसीद (LPC) अद्यतन होनी आवश्यक है।"
                      : "The plot's Jamabandi in Register-II must be officially digitized on biharbhumi.bihar.gov.in in the seller's name with an up-to-date Land Possession Certificate (LPC) and current year rent receipt."}
                  </Text>
                  <View style={styles.checkBadge}>
                    <MaterialIcons name="check-circle" size={13} color="#059669" />
                    <Text style={styles.checkBadgeText}>
                      {language === "hi" ? "MalikSe पर 100% जांची जाती है" : "100% Checked on MalikSe"}
                    </Text>
                  </View>
                </View>

                {/* Pillar 2: Khatiyan & CS/RS Survey */}
                <View style={styles.pillarCard}>
                  <View style={styles.pillarHeader}>
                    <View style={styles.pillarNumberCircle}>
                      <Text style={styles.pillarNumber}>2</Text>
                    </View>
                    <Text style={styles.pillarCardTitle}>
                      {language === "hi" ? "खतियान व वंशावली मिलान" : "Khatiyan & CS/RS Survey Verification"}
                    </Text>
                  </View>
                  <Text style={styles.pillarCardDesc}>
                    {language === "hi"
                      ? "कैडस्ट्रल सर्वे (CS), रिवीजनल सर्वे (RS) और बिहार विशेष सर्वेक्षण (BSS) के नक्शे का मिलान करें ताकि पुश्तैनी हिस्सेदारी या संयुक्त पारिवारिक विवाद न रहे।"
                      : "Cross-reference Cadastral Survey (CS), Revisional Survey (RS), and current Special Survey maps against the seller's registered genealogy to eliminate co-parcenary multi-heir disputes."}
                  </Text>
                  <View style={styles.checkBadge}>
                    <MaterialIcons name="check-circle" size={13} color="#059669" />
                    <Text style={styles.checkBadgeText}>
                      {language === "hi" ? "स्वामित्व श्रृंखला सत्यापन" : "Chain of Title Verified"}
                    </Text>
                  </View>
                </View>

                {/* Pillar 3: Chauhaddi & Physical GPS */}
                <View style={styles.pillarCard}>
                  <View style={styles.pillarHeader}>
                    <View style={styles.pillarNumberCircle}>
                      <Text style={styles.pillarNumber}>3</Text>
                    </View>
                    <Text style={styles.pillarCardTitle}>
                      {language === "hi" ? "चौहद्दी व GPS स्थल सत्यापन" : "Chauhaddi & Physical GPS Demarcation"}
                    </Text>
                  </View>
                  <Text style={styles.pillarCardDesc}>
                    {language === "hi"
                      ? "दस्तावेज़ की चौहद्दी (उत्तर, दक्षिण, पूरब, पश्चिम) का ज़मीनी हक़ीक़त से मिलान करें। सड़क की वास्तविक चौड़ाई और पड़ोसी ज़मीन मालिकों की सहमति अवश्य जांचें।"
                      : "Verify that physical boundaries (North, South, East, West) match deed records on the ground with accurate road frontage and neighbouring landholder boundary confirmations."}
                  </Text>
                  <View style={styles.checkBadge}>
                    <MaterialIcons name="check-circle" size={13} color="#059669" />
                    <Text style={styles.checkBadgeText}>
                      {language === "hi" ? "GPS कोऑर्डिनेट्स से मैप्ड" : "GPS Coordinates Mapped"}
                    </Text>
                  </View>
                </View>

                {/* Pillar 4: Non-Encumbrance Certificate */}
                <View style={styles.pillarCard}>
                  <View style={styles.pillarHeader}>
                    <View style={styles.pillarNumberCircle}>
                      <Text style={styles.pillarNumber}>4</Text>
                    </View>
                    <Text style={styles.pillarCardTitle}>
                      {language === "hi" ? "गैर-भार प्रमाण पत्र (NEC)" : "Non-Encumbrance Certificate (NEC)"}
                    </Text>
                  </View>
                  <Text style={styles.pillarCardDesc}>
                    {language === "hi"
                      ? "संबंधित अवर निबंधक कार्यालय से पिछले 13 से 30 वर्षों का गैर-भार प्रमाण पत्र निकालें ताकि बैंक बंधक या न्यायालयी विवाद की पुष्टि हो सके।"
                      : "Obtain a 13-to-30-year Non-Encumbrance Certificate from the local sub-registrar office to guarantee the land is free of bank mortgages or court injunctions."}
                  </Text>
                  <View style={styles.checkBadge}>
                    <MaterialIcons name="check-circle" size={13} color="#059669" />
                    <Text style={styles.checkBadgeText}>
                      {language === "hi" ? "कानूनी सलाहकार द्वारा समीक्षित" : "Legal Search Report Assistance"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ================= 4. BOTTOM ACTION CALLOUT ================= */}
          <View style={styles.bottomBanner}>
            <View style={styles.bottomBannerContent}>
              <View style={styles.bannerIconWrap}>
                <MaterialIcons name="map" size={24} color="#059669" />
              </View>
              <View style={{ flex: 1, minWidth: 260 }}>
                <Text style={styles.bannerTitle}>
                  {t(language, "insights_banner_title") || "Looking for Genuine Plots with Verified Boundaries?"}
                </Text>
                <Text style={styles.bannerSub}>
                  {t(language, "insights_banner_sub") ||
                    "Browse 100% verified plots with Jamabandi check and direct owner contacts."}
                </Text>
              </View>
            </View>

            <View style={styles.bannerBtnGroup}>
              <TouchableOpacity
                style={styles.bannerExploreBtn}
                onPress={() => router.push("/search")}
                activeOpacity={0.85}
              >
                <Text style={styles.bannerExploreBtnText}>
                  {t(language, "insights_btn_explore") || "Explore Verified Land"}
                </Text>
                <MaterialIcons name="arrow-forward" size={15} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bannerPostBtn}
                onPress={() => router.push("/listing/create")}
                activeOpacity={0.8}
              >
                <MaterialIcons name="add" size={15} color="#065F46" />
                <Text style={styles.bannerPostBtnText}>
                  {t(language, "insights_btn_post") || "Post Land (0% Brokerage)"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Dock Navigation on Web / Bottom Bar on Mobile */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    paddingBottom: 60,
  },
  /* Compact Centered Container (maxWidth: 740, matching search & saved pages) */
  container: {
    width: "100%",
    maxWidth: 740,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* 1. Key Metrics */
  metricsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 19,
  },
  metricUnit: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    lineHeight: 12,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
    marginTop: 3,
    textAlign: "center",
  },

  /* 2. Main Section Segment Pills */
  segmentWrap: {
    marginBottom: 16,
  },
  segmentTrack: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 3,
    borderRadius: 9999,
    gap: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  segmentBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
  },
  segmentBtnTextActive: {
    color: "#065F46",
    fontWeight: "700",
  },

  tabContentBlock: {
    marginBottom: 20,
  },

  /* Corridor Filter Chips */
  corridorFiltersRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  corridorChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  corridorChipActive: {
    backgroundColor: "#E6F4EA",
    borderColor: "#A7F3D0",
  },
  corridorChipText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
  },
  corridorChipTextActive: {
    color: "#065F46",
    fontWeight: "700",
  },

  /* Corridor Cards */
  corridorList: {
    gap: 12,
  },
  corridorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  corridorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  corridorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  corridorKatthaSub: {
    fontSize: 12.5,
    color: "#059669",
    fontWeight: "700",
    marginTop: 2,
  },
  growthPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  growthPillTop: {
    backgroundColor: "#E6F4EA",
    borderColor: "#6EE7B7",
  },
  growthPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  growthPillTextTop: {
    color: "#065F46",
    fontWeight: "800",
  },

  /* Benchmark Strip */
  benchmarkStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  benchmarkItem: {
    flex: 1,
  },
  benchmarkLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  benchmarkVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 1,
  },
  benchmarkDivider: {
    width: 1,
    height: 22,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },

  catalystRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 12,
  },
  catalystText: {
    fontSize: 11.5,
    color: "#475569",
    lineHeight: 16,
    flex: 1,
  },
  corridorActionRow: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
    alignItems: "flex-end",
  },
  browseCorridorBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6F4EA",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  browseCorridorBtnText: {
    color: "#065F46",
    fontSize: 11.5,
    fontWeight: "700",
  },

  /* Calculator Styles */
  calcCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  calcHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  calcSubHeading: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 17,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  calcCorridorScroll: {
    flexDirection: "row",
  },
  calcCorridorChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  calcCorridorChipActive: {
    backgroundColor: "#E6F4EA",
    borderColor: "#A7F3D0",
  },
  calcCorridorChipText: {
    fontSize: 11.5,
    color: "#475569",
    fontWeight: "600",
  },
  calcCorridorChipTextActive: {
    color: "#065F46",
    fontWeight: "700",
  },
  areaLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  unitSwitcher: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 2,
    borderRadius: 6,
    gap: 2,
  },
  unitBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  unitBtnActive: {
    backgroundColor: "#FFFFFF",
  },
  unitBtnText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  unitBtnTextActive: {
    color: "#065F46",
    fontWeight: "700",
  },
  calcInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  calcInput: {
    flex: 1,
    height: 42,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    outlineStyle: "none" as any,
  },
  calcInputUnit: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "500",
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  genderBtnActive: {
    backgroundColor: "#E6F4EA",
    borderColor: "#A7F3D0",
  },
  genderBtnText: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "600",
  },
  genderBtnTextActive: {
    color: "#065F46",
    fontWeight: "700",
  },

  /* Results Box */
  resultsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginTop: 8,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  resultValBig: {
    fontSize: 18,
    fontWeight: "900",
    color: "#059669",
    letterSpacing: -0.5,
  },
  resultDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },
  resultItemSmall: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 3,
  },
  resultSmallLabel: {
    fontSize: 12,
    color: "#475569",
  },
  resultSmallVal: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#0F172A",
  },
  brokerageSavingsHighlight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#E6F4EA",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginTop: 10,
  },
  savingsTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#065F46",
  },
  savingsSub: {
    fontSize: 10.5,
    color: "#047857",
    marginTop: 1,
  },
  savingsAmt: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#065F46",
  },

  /* Legal Guide */
  legalHeader: {
    marginBottom: 14,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 3,
  },
  legalSub: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  pillarsGrid: {
    gap: 12,
  },
  pillarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },
  pillarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  pillarNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E6F4EA",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    justifyContent: "center",
    alignItems: "center",
  },
  pillarNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: "#065F46",
  },
  pillarCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  pillarCardDesc: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 8,
  },
  checkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  checkBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#065F46",
  },

  /* Bottom Banner */
  bottomBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    padding: 18,
    marginTop: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  bottomBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6F4EA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  bannerSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },
  bannerBtnGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  bannerExploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 9999,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  bannerExploreBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  bannerPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6F4EA",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9999,
  },
  bannerPostBtnText: {
    color: "#065F46",
    fontSize: 11.5,
    fontWeight: "700",
  },
});
