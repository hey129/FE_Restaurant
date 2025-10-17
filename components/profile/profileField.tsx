import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/app";

interface ProfileFieldProps {
  label: string;
  value?: string | null;
  placeholder?: string;
}

export default function ProfileField({ label, value, placeholder = "Not set" }: ProfileFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  valueContainer: {
    backgroundColor: "#FFE5B4",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  value: {
    fontSize: 15,
    color: COLORS.text.primary,
  },
  placeholder: {
    color: COLORS.text.light,
    fontStyle: "italic",
  },
});
