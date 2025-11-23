// app/screen/cartDetail.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";

import AppHeader from "../../components/header/appHeader";
import { useCart } from "../context/_cartContext";
import { CartItem } from "../../components/cart/cartItem";
import { CartSummary } from "../../components/cart/cartSummary";
import { COLORS } from "../../constants/app";
import { getRestaurantById, Restaurant } from "../../services/restaurantService";

export default function CartDetail() {
  const router = useRouter();
  const { merchantId } = useLocalSearchParams<{ merchantId: string }>();
  const { cart, changeQuantity, removeFromCart } = useCart();

  const safeMerchantId = merchantId ?? ""; // <-- Fix SonarLint (loại bỏ !)

  const items = cart[safeMerchantId] || [];

  const [merchant, setMerchant] = useState<Restaurant | null>(null);

  useEffect(() => {
    if (safeMerchantId) getRestaurantById(safeMerchantId).then(setMerchant);
  }, [safeMerchantId]);

  const merchantName = merchant?.restaurant_name || "Đang tải...";
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <View style={styles.screen}>

      {/* HEADER */}
      <AppHeader
        title={`Giỏ hàng – ${merchantName}`}
        onBack={() => router.back()}
      />

      {/* CONTENT */}
      <View style={styles.content}>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <CartItem
              item={item}
              onQuantityChange={(delta) =>
                changeQuantity(safeMerchantId, item.id, delta)
              }
              onRemove={() => removeFromCart(safeMerchantId, item.id)}
            />
          )}
        />

        <View style={{ marginTop: 20 }}>
          <CartSummary
            subtotal={subtotal}
            showDelivery
            showCheckoutButton
            onCheckout={() =>
              router.push({
                pathname: "/screen/checkout",
                params: { merchantId: safeMerchantId },
              })
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.primary },

  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
