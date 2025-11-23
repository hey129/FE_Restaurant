// app/screen/cartList.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

import AppHeader from "../../components/header/appHeader"; // Header chung

import Swipeable from "react-native-gesture-handler/Swipeable";
import { useCart } from "../context/_cartContext";
import { COLORS } from "../../constants/app";
import { EmptyCart } from "../../components/cart/emptyCart";
import { getRestaurantById, Restaurant } from "../../services/restaurantService";

export default function CartListScreen() {
  const { cart, clearCart, clearAllCarts } = useCart();
  const router = useRouter();

  const merchantIds = Object.keys(cart).filter((m) => cart[m].length > 0);

  const [merchantInfo, setMerchantInfo] = useState<
    Record<string, Restaurant | null>
  >({});

  /* ---------------- LOAD MERCHANT INFO ---------------- */
  useEffect(() => {
    merchantIds.forEach(async (id) => {
      if (!merchantInfo[id]) {
        const info = await getRestaurantById(id);
        setMerchantInfo((prev) => ({ ...prev, [id]: info }));
      }
    });
  }, [merchantIds, merchantInfo]);

  /* ---------------- SWIPE RIGHT DELETE ---------------- */
  const renderRightActions = (merchantId: string) => (
    <TouchableOpacity
      style={styles.swipeDelete}
      onPress={() => clearCart(merchantId)}
    >
      <Text style={styles.swipeDeleteText}>Xóa</Text>
    </TouchableOpacity>
  );

  /* ---------------- ITEM RENDER ---------------- */
  const renderMerchant = ({ item: merchantId }: { item: string }) => {
    const items = cart[merchantId];
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    const merchant = merchantInfo[merchantId];
    const merchantName = merchant?.restaurant_name || "Đang tải...";
    const firstItem = items[0];

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(merchantId)}
        overshootRight={false}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/screen/cartDetail",
              params: { merchantId },
            })
          }
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{merchantName}</Text>
            <Text style={styles.subtitle}>{totalQty} món</Text>
          </View>

          <Image source={{ uri: firstItem.img }} style={styles.image} />
        </TouchableOpacity>
      </Swipeable>
    );
  };

  /* ---------------- RENDER SCREEN ---------------- */
  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <AppHeader title="Giỏ hàng của tôi" onBack={() => router.back()} />

      {/* CONTENT */}
      <View style={styles.content}>
        {merchantIds.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <EmptyCart />
          </View>
        ) : (
          <>
            <FlatList
              data={merchantIds}
              keyExtractor={(m) => m}
              renderItem={renderMerchant}
              contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: 50, // tránh sát đáy
              }}
            />

            {/* CLEAR ALL BUTTON */}
            <View style={styles.clearAllContainer}>
              <TouchableOpacity
                style={styles.clearAllBtn}
                onPress={clearAllCarts}
              >
                <Text style={styles.clearAllText}>Xóa tất cả</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  card: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text.primary,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 4,
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginLeft: 12,
  },

  swipeDelete: {
    width: 90,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    marginBottom: 16,
  },

  swipeDeleteText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
  },

  clearAllContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20, // giữ nút cao lên
  },

  clearAllBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 24,
  },

  clearAllText: {
    color: COLORS.text.primary,
    fontWeight: "800",
    fontSize: 16,
  },

  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
