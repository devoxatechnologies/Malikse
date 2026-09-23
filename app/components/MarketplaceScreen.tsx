import React, { useCallback, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Action, Field, ui, WorkflowScreen } from "./WorkflowUI";
import { propertyService } from "../src/services/propertyService";
import type { Property, PropertyType } from "../src/types/property.types";

export default function MarketplaceScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PropertyType | undefined>();
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({});
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError("");
    propertyService.searchProperties(filters).then(data => { if (active) setProperties(data); }).catch(() => { if (active) { setProperties([]); setError("Could not load properties. Please retry."); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters]));
  const search = () => {
    if ((min && (!Number.isFinite(Number(min)) || Number(min) < 0)) || (max && (!Number.isFinite(Number(max)) || Number(max) < 0)) || (min && max && Number(min) > Number(max))) { setError("Enter a valid price range."); return; }
    setFilters({ location: query.trim() || undefined, type, budgetMin: min ? Number(min) : undefined, budgetMax: max ? Number(max) : undefined });
  };
  return <WorkflowScreen title="Verified properties">
    <Text style={ui.muted}>Properties approved by both an Advisor and a Verifier. Verification is not a guarantee of legal title.</Text>
    <View style={ui.card}>
      <Field label="Location or title" value={query} onChangeText={setQuery} />
      <View style={ui.row}>{([undefined, "land", "flat", "house", "shop", "office"] as const).map(value => <Action key={value || "all"} title={value || "All types"} secondary={type !== value} onPress={() => setType(value)} />)}</View>
      <Field label="Minimum price (₹)" value={min} onChangeText={setMin} numeric />
      <Field label="Maximum price (₹)" value={max} onChangeText={setMax} numeric />
      <Action title="Search / refresh" onPress={search} />
    </View>
    {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
    {loading ? <ActivityIndicator color="#047857" /> : !error && properties.length === 0 ? <Text style={ui.text}>No verified properties match your search yet.</Text> : null}
    {!loading && properties.map(property => <View key={property._id || property.id} style={ui.card}>
      {property.media?.photos?.[0] ? <Image source={{ uri: property.media.photos[0] }} style={{ width: "100%", height: 180, borderRadius: 8 }} /> : <Text style={ui.muted}>No property photo uploaded</Text>}
      <Text style={ui.heading}>{property.title || `${property.type} in ${property.location.district}`}</Text>
      <Text style={ui.text}>{property.location.district}, {property.location.state} · {property.sellableArea} sq.ft</Text>
      <Text style={ui.heading}>₹{property.price.toLocaleString("en-IN")}</Text>
      <Text style={ui.muted}>Advisor approved · Verifier approved</Text>
      <Action title="View property" onPress={() => router.push(`/property/${property._id || property.id}`)} />
    </View>)}
  </WorkflowScreen>;
}
