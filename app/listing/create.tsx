import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { propertyService } from "../../src/services/propertyService";
import { documentService } from "../../src/services/documentService";
import { FontAwesome5 } from "@expo/vector-icons";
import MapParcelPicker from "../../components/MapParcelPicker";

const DOC_TYPES = ["Registry", "Mutation", "LPC/Jamabandi", "Map", "Rent Receipt", "Owner ID Proof"] as const;
type DocType = typeof DOC_TYPES[number];

interface PickedDoc {
  asset: any;
  docType: DocType;
}

export default function CreateListingScreen() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<string>("land");
  const [price, setPrice] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  
  // Map State
  const [parcelPoints, setParcelPoints] = useState<{ lat: number; lng: number }[]>([]);

  // Docs State
  const [documents, setDocuments] = useState<PickedDoc[]>([]);

  const handleNextToMap = () => {
    if (!price || !totalArea || !state || !district) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    setStep(2);
  };

  const handleCreateProperty = async () => {
    if (parcelPoints.length < 3) {
      if (Platform.OS === "web") alert("Please draw a polygon with at least 3 points on the map");
      else Alert.alert("Error", "Please draw a polygon with at least 3 points on the map");
      return;
    }

    setLoading(true);
    try {
      const prop = await propertyService.createProperty({
        type,
        price: Number(price),
        totalArea: Number(totalArea),
        sellableArea: Number(totalArea),
        location: {
          state,
          district,
          lat: parcelPoints[0].lat,
          lng: parcelPoints[0].lng
        },
        parcelPoints
      });
      setPropertyId(prop._id || prop.id);
      setStep(3);
    } catch (e: any) {
      const msg = e.response?.data?.message || "Failed to create listing";
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
    if (!propertyId) return;
    setLoading(true);
    try {
      // Upload each document with its selected type
      for (const { asset, docType } of documents) {
        let fileObj: any;
        if (Platform.OS === "web") {
          // Fetch the blob on web from the object URL
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
        alert("Listing created successfully with documents!");
        router.replace("/my-properties");
      } else {
        Alert.alert("Success", "Listing created successfully with documents!", [
          { text: "OK", onPress: () => router.replace("/my-properties") }
        ]);
      }
    } catch (e: any) {
      const msg = e.response?.data?.message || "Failed to upload documents";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          if (step > 1 && !propertyId) setStep(step - 1);
          else router.back();
        }}>
          <FontAwesome5 name="arrow-left" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Listing (Step {step}/3)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 1 && (
          <View>
            <Text style={styles.label}>Property Type</Text>
            <View style={styles.typeRow}>
              {["land", "house", "flat"].map(t => (
                <TouchableOpacity 
                  key={t} 
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeTxt, type === t && styles.typeTxtActive]}>{t.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} placeholder="State" value={state} onChangeText={setState} />
            <TextInput style={styles.input} placeholder="District" value={district} onChangeText={setDistrict} />

            <Text style={styles.label}>Details</Text>
            <TextInput style={styles.input} placeholder="Price (₹)" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Total Area (sq.ft)" value={totalArea} onChangeText={setTotalArea} keyboardType="numeric" />

            <TouchableOpacity style={styles.submitBtn} onPress={handleNextToMap}>
              <Text style={styles.submitTxt}>Next: Draw on Map</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.label}>Draw Property Boundaries</Text>
            <Text style={styles.subtext}>Tap points on the map to draw the exact boundaries of your parcel.</Text>
            
            <MapParcelPicker onParcelChange={setParcelPoints} />
            
            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateProperty} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitTxt}>Save & Next</Text>}
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.label}>Upload Documents</Text>
            <Text style={styles.subtext}>Attach ownership documents for verification (Optional but recommended).</Text>

            <TouchableOpacity style={styles.uploadBtn} onPress={handlePickDocument}>
              <FontAwesome5 name="cloud-upload-alt" size={24} color="#2A85FF" />
              <Text style={styles.uploadTxt}>Select File</Text>
            </TouchableOpacity>

            {documents.map(({ asset, docType }, idx) => (
              <View key={idx} style={styles.docItem}>
                <View style={styles.docHeader}>
                  <FontAwesome5 name="file-alt" size={16} color="#666" />
                  <Text style={styles.docName} numberOfLines={1}>{asset.name}</Text>
                  <TouchableOpacity onPress={() => removeDoc(idx)} style={styles.removeBtn}>
                    <FontAwesome5 name="times" size={14} color="#FF4D4F" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.docTypeLabel}>Document Type:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                  {DOC_TYPES.map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeChip, docType === t && styles.typeChipActive]}
                      onPress={() => updateDocType(idx, t)}
                    >
                      <Text style={[styles.typeChipTxt, docType === t && styles.typeChipTxtActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}

            <TouchableOpacity style={styles.submitBtn} onPress={handleUploadAndFinish} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitTxt}>Finish & Submit</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, paddingTop: 48, borderBottomWidth: 1, borderColor: "#EAEAEA" },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111" },
  scroll: { padding: 16 },
  label: { fontSize: 16, fontWeight: "bold", color: "#111", marginBottom: 8, marginTop: 16 },
  subtext: { fontSize: 14, color: "#666", marginBottom: 16 },
  typeRow: { flexDirection: "row", marginBottom: 8 },
  typeBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: "#DDD", borderRadius: 8, alignItems: "center", marginHorizontal: 4 },
  typeBtnActive: { backgroundColor: "#E6F4FE", borderColor: "#2A85FF" },
  typeTxt: { color: "#666", fontWeight: "600" },
  typeTxtActive: { color: "#2A85FF" },
  input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 12 },
  submitBtn: { backgroundColor: "#2A85FF", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 24 },
  submitTxt: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  uploadBtn: { borderWidth: 1, borderColor: "#2A85FF", borderStyle: "dashed", borderRadius: 8, padding: 24, alignItems: "center", backgroundColor: "#F0F8FF", marginBottom: 16 },
  uploadTxt: { color: "#2A85FF", marginTop: 8, fontWeight: "bold" },
  docItem: { padding: 12, backgroundColor: "#F8F9FA", borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#EAEAEA" },
  docHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  docName: { marginLeft: 8, fontSize: 14, color: "#333", flex: 1 },
  removeBtn: { padding: 4 },
  docTypeLabel: { fontSize: 12, color: "#666", marginBottom: 6, fontWeight: "600" },
  typeScroll: { flexDirection: "row" },
  typeChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: "#DDD", backgroundColor: "#FFF", marginRight: 6 },
  typeChipActive: { backgroundColor: "#2A85FF", borderColor: "#2A85FF" },
  typeChipTxt: { fontSize: 11, color: "#555", fontWeight: "600" },
  typeChipTxtActive: { color: "#FFF" }
});
