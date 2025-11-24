import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../../components/header/appHeader";
import { getMenuItems, MenuItem } from "../../services/menuService";
import { CartItem, useCart } from "../context/_cartContext";

const { width } = Dimensions.get("window");

const ACCENT = "#E95322";
const BG_LIGHT = "#F5CB58";
const MIN_QTY = 1;
const TOAST_DURATION = 1500;

/* ======================= TOAST HOOK ======================= */

function useToast() {
  const [msg, setMsg] = useState("");
  const [opacity] = useState(new Animated.Value(0));

  const showToast = (text: string) => {
    setMsg(text);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, TOAST_DURATION);
    });
  };

  return { msg, opacity, showToast };
}

/* ======================= FETCH ITEM ======================= */
async function fetchItemById(id: string) {
  const all = await getMenuItems();
  return all.find((i) => String(i.id) === id) ?? null;
}

/* ======================= MAIN COMPONENT ======================= */

export default function ProductDetail() {
  const { id, merchantId } =
    useLocalSearchParams<{ id: string; merchantId: string }>();

  const router = useRouter();
  const { addToCart } = useCart();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [qty, setQty] = useState(MIN_QTY);

  const { msg: toastMsg, opacity: toastOpacity, showToast } = useToast();

  useEffect(() => {
    if (!id) return;
    fetchItemById(id).then(setItem);
  }, [id]);

  if (!item)
    return (
      <SafeAreaView style={{ padding: 20 }}>
        <Text>Đang tải...</Text>
      </SafeAreaView>
    );

  const formattedPrice = `${item.price.toLocaleString("vi-VN")} VND`;

  /* ======================= ADD TO CART ======================= */
  const handleAddToCart = () => {
    const payload: CartItem = {
      id: Number(item.id),   // FIX QUAN TRỌNG — LUÔN LÀ NUMBER
      name: item.name,
      price: item.price,
      img: item.img,
      quantity: qty,
    };

    console.log("ADD TO CART PAYLOAD:", payload);

    addToCart(merchantId, payload, qty);
    showToast(`Đã thêm ${qty} món vào giỏ hàng`);
    setQty(MIN_QTY);
  };

  return (
    <View style={styles.screen}>
      <AppHeader title={item.name} onBack={() => router.back()} />

      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }}>
          <Image source={{ uri: item.img }} style={styles.productImage} />

          <View style={{ marginTop: 20 }}>
            <Text style={styles.price}>{formattedPrice}</Text>

            <View style={styles.qtyWrapper}>
              <TouchableOpacity
                onPress={() => setQty((q) => Math.max(MIN_QTY, q - 1))}
              >
                <Text style={styles.qtyBtn}>−</Text>
              </TouchableOpacity>

              <Text style={styles.qtyText}>{qty}</Text>

              <TouchableOpacity onPress={() => setQty((q) => q + 1)}>
                <Text style={styles.qtyBtn}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />
          </View>

          <Text style={styles.description}>{item.description}</Text>
        </ScrollView>
      </View>

      {/* FOOTER BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <Text style={styles.cartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>

      {/* TOAST */}
      {toastMsg ? (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
              transform: [
                {
                  translateY: toastOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG_LIGHT,
  },

  contentWrapper: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -6,
  },

  productImage: {
    width: width - 80,
    height: (width - 80) * 0.6,
    borderRadius: 16,
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 20,
  },

  price: {
    fontSize: 22,
    color: ACCENT,
    fontWeight: "800",
  },

  qtyWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  qtyBtn: {
    fontSize: 30,
    fontWeight: "800",
    color: ACCENT,
    paddingHorizontal: 12,
  },

  qtyText: {
    fontSize: 18,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#e9e9e9",
    marginVertical: 20,
  },

  description: {
    fontSize: 14,
    color: "#676767",
    lineHeight: 20,
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },

  cartBtn: {
    backgroundColor: ACCENT,
    borderRadius: 30,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },

  cartText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  toast: {
    position: "absolute",
    bottom: 100,
    left: 40,
    right: 40,
    backgroundColor: "#000a",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
  },

  toastText: {
    color: "#fff",
    fontWeight: "700",
  },
});
