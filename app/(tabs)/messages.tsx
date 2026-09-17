import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <FontAwesome5 name="comments" size={64} color="#CCC" />
      <Text style={styles.text}>Messages</Text>
      <Text style={styles.subtext}>Chat functionality is coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F9FA" },
  text: { fontSize: 24, fontWeight: "bold", color: "#333", marginTop: 24 },
  subtext: { fontSize: 14, color: "#666", marginTop: 8 },
});
