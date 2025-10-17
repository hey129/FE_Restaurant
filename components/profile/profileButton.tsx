import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { COLORS } from "../../constants/app";

interface ProfileButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "outline";
  icon?: string;
}

export default function ProfileButton({ 
  title, 
  loading = false,
  variant = "primary",
  icon,
  disabled,
  style,
  ...props 
}: ProfileButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "outline" && styles.buttonOutline,
        (loading || disabled) && styles.buttonDisabled,
        style,
      ]}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "primary" ? COLORS.white : COLORS.accent} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[
            styles.buttonText,
            variant === "outline" && styles.buttonTextOutline,
          ]}>
            {title}
          </Text>
        </>
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
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  buttonOutline: {
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
  buttonTextOutline: {
    color: COLORS.accent,
  },
  icon: {
    fontSize: 18,
  },
});
