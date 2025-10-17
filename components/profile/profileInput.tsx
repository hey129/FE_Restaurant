import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { COLORS } from "../../constants/app";

interface ProfileInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

export default function ProfileInput({ 
  label, 
  required = false, 
  disabled = false,
  helperText,
  style,
  ...props 
}: ProfileInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      {disabled ? (
        <View style={styles.disabledContainer}>
          <TextInput
            style={[styles.input, styles.disabledInput, style]}
            editable={false}
            {...props}
          />
          {helperText && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
      ) : (
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.text.light}
          {...props}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  required: {
    color: "red",
  },
  input: {
    backgroundColor: "#FFE5B4",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  disabledContainer: {
    gap: 4,
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: COLORS.text.secondary,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontStyle: "italic",
    marginLeft: 4,
  },
});
