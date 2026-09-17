import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface BadgeChipProps {
  label: string;
  active: boolean;
  icon: string;
}

export default function BadgeChip({ label, active, icon }: BadgeChipProps) {
  return (
    <View style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
      <FontAwesome5 
        name={icon} 
        size={12} 
        color={active ? "#0F5132" : "#666"} 
        style={styles.icon} 
      />
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: "#D1E7DD",
    borderColor: "#BADBCC",
  },
  chipInactive: {
    backgroundColor: "#F8F9FA",
    borderColor: "#DEE2E6",
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
  labelActive: {
    color: "#0F5132",
  },
  labelInactive: {
    color: "#666",
  },
});
