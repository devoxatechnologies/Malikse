import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import type { UserRole } from "../src/types/auth.types";
import { actorId, Listing, statusLabels, workflowService } from "../src/services/workflowService";
import { Action, ui, WorkflowScreen } from "./WorkflowUI";
import { dashboardRoutes } from "../src/utils/accountRoutes";

export default function PropertyQueueScreen({ role }: { role: UserRole }) {
  const router = useRouter();
  const { user, authState, hydrated } = useAuthStore();
  const [properties, setProperties] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    if (user?.role !== role || authState !== "AUTHENTICATED") return;
    setLoading(true); setError("");
    workflowService.queue(role).then(data => { if (active) setProperties(data); }).catch((cause) => { if (active) { setProperties([]); setError(cause.response?.data?.message || "Could not load properties"); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  // Refresh on account changes and explicit reloads, even when the role is unchanged.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, authState, role, revision]));
  if (!hydrated) return <ActivityIndicator />;
  if (!user || authState !== "AUTHENTICATED") return <Redirect href="/login" />;
  if (user.role !== role) return <Redirect href={dashboardRoutes[user.role]} />;
  const claim = async (id: string) => {
    setBusy(true); setError("");
    try { await workflowService.claim(id); router.push({ pathname: "/verification/[id]", params: { id } }); }
    catch (cause: any) { setError(cause.response?.data?.message || "Could not claim property"); setRevision(value => value + 1); }
    finally { setBusy(false); }
  };
  const filtered = properties.filter(property => filter === "all" || property.status === filter);
  return <WorkflowScreen title={role === "user" ? "My listings" : role === "admin" ? "Property verification tracking" : `${role === "advisor" ? "Advisor" : "Verifier"} review queue`}>
    <View style={ui.row}>
      <Action title="My dashboard" secondary onPress={() => router.push(dashboardRoutes[role])} />
      <Action title="Refresh" secondary onPress={() => setRevision(value => value + 1)} />
      {role === "user" && <Action title="List a property" onPress={() => router.push(user.demoKycComplete ? "/listing/create" : "/kyc")} />}
    </View>
    <Text style={ui.muted}>Draft → Advisor review → Verifier review → Published. Corrections return to the seller and restart review after resubmission.</Text>
    <View style={ui.row}>{["all", "draft", "pending", "advisor_verified", "correction_required", "rejected", "verified"].filter(status => role === "user" || role === "admin" || status !== "draft").map(status => <Action key={status} title={status === "all" ? "All" : statusLabels[status]} secondary={status !== filter} onPress={() => setFilter(status)} />)}</View>
    {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
    {loading ? <ActivityIndicator color="#047857" /> : !error && filtered.length === 0 ? <Text style={ui.text}>No properties in this queue.</Text> : null}
    {!loading && filtered.map(property => {
      const assigned = actorId(role === "advisor" ? property.assignedAdvisorId : property.assignedVerifierId);
      const unassigned = ["advisor", "verifier"].includes(role) && !assigned;
      return <View key={property._id} style={ui.card}>
        <Text style={ui.heading}>{property.title || `${property.type} in ${property.location.district}`}</Text>
        <Text style={ui.text}>{statusLabels[property.status] || property.status}</Text>
        <Text style={ui.muted}>{property.location.district}, {property.location.state} · ₹{property.price.toLocaleString("en-IN")}</Text>
        {property.rejectionReason && <Text style={ui.error}>{property.rejectionReason}</Text>}
        {unassigned ? <Action title="Claim review" disabled={busy} onPress={() => claim(property._id)} /> : <Action title={role === "user" || role === "admin" ? "Details and history" : "Open review"} onPress={() => router.push({ pathname: "/verification/[id]", params: { id: property._id } })} />}
        {role === "user" && ["draft", "correction_required"].includes(property.status) && <Action title={property.status === "draft" ? "Continue listing" : "Correct and resubmit"} secondary onPress={() => router.push({ pathname: "/listing/create", params: { id: property._id } })} />}
      </View>;
    })}
  </WorkflowScreen>;
}
