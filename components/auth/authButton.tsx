import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { COLORS } from "../../constants/app";

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export default function AuthButton({ 
  title, 
  loading = false, 
  variant = "primary",
  disabled,
  style,
  ...props 
}: AuthButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "secondary" && styles.buttonSecondary,
        (loading || disabled) && styles.buttonDisabled,
        style,
      ]}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "primary" ? COLORS.white : COLORS.accent} />
      ) : (
        <Text style={[
          styles.buttonText,
          variant === "secondary" && styles.buttonTextSecondary,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  buttonTextSecondary: {
    color: COLORS.accent,
  },
});
