import { StyleSheet } from "react-native";
import { COLORS } from "./app";

export const sharedStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 80,
  },
  backText: {
    fontSize: 14,
    color: COLORS.text.primary,
    textDecorationLine: "underline",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
    flex: 1,
  },

  // Section
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text.primary,
  },

  // Input
  input: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  inputError: {
    borderColor: "#FF3B30",
    borderWidth: 2,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  // Address
  addressBox: {
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },

  // Info Box (generic)
  infoBox: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 14,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.accent,
  },

  // Buttons
  primaryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  // Footer
  footer: {
    backgroundColor: COLORS.white,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },

  // Total row
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.accent,
  },
});
