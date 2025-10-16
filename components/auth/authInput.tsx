import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { COLORS } from "../../constants/app";

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function AuthInput({ label, error, style, ...props }: AuthInputProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style, error && styles.inputError]}
        placeholderTextColor={COLORS.text.light}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFE5B4",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginTop: 4,
    marginLeft: 4,
  },
});
