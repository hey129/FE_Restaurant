import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CartItem as CartItemType } from "../../app/context/_cartContext";

const COLORS = {
  text: "#391713",
  sub: "#676767",
  price: "#E95322",
  border: "rgba(0,0,0,0.06)",
  qtyBorder: "#E95322",
  delete: "#E95322",
};

const SPACING = { small: 8, medium: 12, large: 16 };

// Component
export function CartItem({
  item,
  onQuantityChange,
  onRemove,
  readOnly = false,
}: {
  readonly item: CartItemType;
  readonly onQuantityChange?: (delta: number) => void;
  readonly onRemove?: () => void;
  readonly readOnly?: boolean;
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Image source={{ uri: item.img }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>
            {item.price.toLocaleString("vi-VN")} VND
          </Text>

          {readOnly ? (
            <Text style={styles.qtyReadonly}>x{item.quantity}</Text>
          ) : (
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => onQuantityChange?.(-1)}
              >
                <Text style={styles.qtyText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.qtyNumber}>{item.quantity}</Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => onQuantityChange?.(1)}
              >
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!readOnly && (
          <TouchableOpacity style={styles.deleteBtn} onPress={onRemove}>
            <AntDesign name="delete" size={20} color={COLORS.delete} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  wrapper: { paddingVertical: SPACING.medium },
  row: { flexDirection: "row", alignItems: "flex-start" },

  image: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: "#F3F3F3",
  },

  info: {
    flex: 1,
    marginLeft: SPACING.medium,
    justifyContent: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },

  price: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.price,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  qtyBtn: {
    borderWidth: 1,
    borderColor: COLORS.qtyBorder,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  qtyText: {
    fontSize: 18,
    color: COLORS.qtyBorder,
    fontWeight: "700",
  },

  qtyNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginHorizontal: 10,
  },

  qtyReadonly: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.sub,
  },

  deleteBtn: {
    padding: 6,
    marginLeft: 8,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: SPACING.medium,
  },
});
