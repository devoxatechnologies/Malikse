import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import { AppTheme } from "../../constants/theme";

const CONVERSATIONS = [
  {
    id: "c1",
    name: "Ramesh Kumar (Verified Owner)",
    property: "Plot on Main Bailey Road, Patna",
    lastMsg: "I have shared the latest circle office mutation receipt.",
    time: "10:30 AM",
    unread: true,
    verified: true,
  },
  {
    id: "c2",
    name: "Amit Singh (MalikSe Advisor)",
    property: "Site Inspection Task #402",
    lastMsg: "GPS geo-boundary survey report has been uploaded.",
    time: "Yesterday",
    unread: false,
    verified: true,
  },
  {
    id: "c3",
    name: "Suresh Prasad (Buyer)",
    property: "Residential Land in Bihta",
    lastMsg: "Token offer of ₹30 Lakh submitted for owner review.",
    time: "16 Sep",
    unread: false,
    verified: true,
  }
];

export default function MessagesScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Direct Messages"
        subtitle="Consent-gated secure conversations"
        showBack={true}
        fallbackRoute="/search"
      />

      {/* Trust Notice Banner */}
      <View style={styles.banner}>
        <MaterialIcons name="security" size={18} color={AppTheme.colors.primaryDark} />
        <Text style={styles.bannerText}>
          Contact details are protected by OTP consent to prevent spam & brokers.
        </Text>
      </View>

      <View style={styles.container}>
        <FlatList
          data={CONVERSATIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatCard} activeOpacity={0.8}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarTxt}>{item.name.charAt(0)}</Text>
                {item.verified && (
                  <View style={styles.verifiedDot}>
                    <MaterialIcons name="verified" size={12} color={AppTheme.colors.white} />
                  </View>
                )}
              </View>

              <View style={styles.chatInfo}>
                <View style={styles.chatHeaderRow}>
                  <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.chatTime}>{item.time}</Text>
                </View>

                <Text style={styles.chatProperty} numberOfLines={1}>
                  <MaterialIcons name="place" size={12} color={AppTheme.colors.primary} /> {item.property}
                </Text>

                <Text style={[styles.chatLastMsg, item.unread && styles.chatLastMsgUnread]} numberOfLines={1}>
                  {item.lastMsg}
                </Text>
              </View>

              {item.unread && <View style={styles.unreadBadge} />}
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  container: { maxWidth: 680, width: "100%", alignSelf: "center", flex: 1 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: AppTheme.colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  bannerText: {
    fontSize: 12,
    color: AppTheme.colors.primaryDark,
    fontWeight: "600",
    flex: 1,
  },
  listPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppTheme.colors.cardBorder,
    ...AppTheme.shadows.soft,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    position: "relative",
  },
  avatarTxt: {
    fontSize: 20,
    fontWeight: "800",
    color: AppTheme.colors.white,
  },
  verifiedDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: AppTheme.colors.success,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  chatInfo: {
    flex: 1,
  },
  chatHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  chatName: {
    fontSize: 15,
    fontWeight: "700",
    color: AppTheme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    fontWeight: "500",
  },
  chatProperty: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  chatLastMsg: {
    fontSize: 13,
    color: AppTheme.colors.textMuted,
  },
  chatLastMsgUnread: {
    color: AppTheme.colors.text,
    fontWeight: "700",
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppTheme.colors.primary,
    marginLeft: 8,
  },
});
