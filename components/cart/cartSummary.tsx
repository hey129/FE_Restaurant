import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PRICING } from "../../constants/app";

// Component
export function CartSummary({
  subtotal,
  showDelivery = true,
  showCheckoutButton = true,
  onCheckout,
}: {
  readonly subtotal: number;
  readonly showDelivery?: boolean;
  readonly showCheckoutButton?: boolean;
  readonly onCheckout?: () => void;
}) {
  const tax = PRICING.TAX;
  const delivery = showDelivery ? PRICING.DELIVERY : 0;
  const total = subtotal + tax + delivery;

  return (
    <View style={styles.container}>
      <Row label="Tạm tính" value={`${subtotal.toLocaleString("vi-VN")} VND`} />
      <Row label="Thuế & phí" value={`${tax.toLocaleString("vi-VN")} VND`} />
      {showDelivery && (
        <Row label="Phí giao hàng" value={`${delivery.toLocaleString("vi-VN")} VND`} />
      )}

      <View style={styles.divider} />

      <Row label="Tổng cộng" value={`${total.toLocaleString("vi-VN")} VND`} bold />

      {showCheckoutButton && (
        <TouchableOpacity style={styles.btn} onPress={onCheckout}>
          <Text style={styles.btnText}>Thanh toán</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Row item
const Row = ({
  label,
  value,
  bold,
}: {
  readonly label: string;
  readonly value: string;
  readonly bold?: boolean;
}) => (
  <View style={styles.row}>
    <Text style={[styles.label, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.value, bold && styles.bold]}>{value}</Text>
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowColor: "#000",
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    fontSize: 15,
    color: "#391713",
  },

  value: {
    fontSize: 15,
    color: "#E95322",
    fontWeight: "600",
  },

  bold: {
    fontWeight: "800",
    fontSize: 17,
    color: "#391713",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 10,
  },

  btn: {
    marginTop: 14,
    backgroundColor: "#F5CB58",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#391713",
  },
});
