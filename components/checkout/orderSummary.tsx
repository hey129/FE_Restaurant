import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS, PRICING } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  img: string;
}

interface OrderSummaryProps {
  cart: CartItem[];
  subtotal: number;
  total: number;
}

export default function OrderSummary({ cart, subtotal, total }: OrderSummaryProps) {
  return (
    <>
      <View style={sharedStyles.section}>
        <View style={sharedStyles.sectionHeader}>
          <Text style={sharedStyles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <Text style={styles.badge}>{cart.length} món</Text>
        </View>

        {cart.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Image source={{ uri: item.img }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>{item.price.toFixed(3)}</Text>
          </View>
        ))}
      </View>

      <View style={sharedStyles.section}>
        <Text style={sharedStyles.sectionTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tạm tính</Text>
          <Text style={styles.priceValue}>{subtotal.toFixed(3)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Thuế và phí</Text>
          <Text style={styles.priceValue}>{PRICING.TAX.toFixed(3)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Phí giao hàng</Text>
          <Text style={styles.priceValue}>{PRICING.DELIVERY.toFixed(3)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={sharedStyles.totalLabel}>Tổng cộng</Text>
          <Text style={sharedStyles.totalValue}>{total.toFixed(3)} VND</Text>
        </View>
      </View>
    </>
  );
}

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
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
});
