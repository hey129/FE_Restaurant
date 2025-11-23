import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS, PRICING } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";

interface CartItem {
  readonly id: string | number;
  readonly name: string;
  readonly price: number;
  readonly quantity: number;
  readonly img: string;
}

interface OrderSummaryProps {
  readonly cart: CartItem[];
  readonly subtotal: number;
  readonly total: number;
}

export default function OrderSummary({
  cart,
  subtotal,
  total,
}: OrderSummaryProps) {
  return (
    <>
      {/* Tóm tắt đơn */}
      <View style={sharedStyles.section}>
        <View style={sharedStyles.sectionHeader}>
          <Text style={sharedStyles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <Text style={styles.badge}>{cart.length} món</Text>
        </View>

        {cart.map((item) => (
          <View key={item.id} style={styles.row}>
            <Image source={{ uri: item.img }} style={styles.image} />

            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.qty}>x{item.quantity}</Text>
            </View>

            <Text style={styles.price}>
              {(item.price * item.quantity).toLocaleString("vi-VN")} VND
            </Text>
          </View>
        ))}
      </View>

      {/* Chi tiết đơn */}
      <View style={sharedStyles.section}>
        <Text style={sharedStyles.sectionTitle}>Chi tiết đơn hàng</Text>

        <Row
          label="Tạm tính"
          value={`${subtotal.toLocaleString("vi-VN")} VND`}
        />
        <Row
          label="Thuế và phí"
          value={`${PRICING.TAX.toLocaleString("vi-VN")} VND`}
        />
        <Row
          label="Phí giao hàng"
          value={`${PRICING.DELIVERY.toLocaleString("vi-VN")} VND`}
        />

        <View style={styles.totalRow}>
          <Text style={sharedStyles.totalLabel}>Tổng cộng</Text>
          <Text style={sharedStyles.totalValue}>
            {total.toLocaleString("vi-VN")} VND
          </Text>
        </View>
      </View>
    </>
  );
}

const Row = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) => (
  <View style={styles.priceRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

// Styles
const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.primary + "20",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: COLORS.background,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  qty: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  value: {
    fontWeight: "700",
    fontSize: 14,
    color: COLORS.text.primary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
