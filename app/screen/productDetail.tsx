import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getMenuItems, MenuItem } from "../../services/menuService";
import { CartItem, useCart } from "../context/_cartContext";

// ------------------ Constants ------------------
const { width } = Dimensions.get("window");
const ACCENT = "#E95322";
const BG_LIGHT = "#F5CB58";
const MIN_QTY = 1;
const TOAST_DURATION = 1500;
const SPACING = { headerTop: 60, headerLeft: 30, footerBottom: 30 };

// ------------------ Custom Hook: Toast ------------------
function useToast() {
  const [msg, setMsg] = useState("");
  const opacity = useState(new Animated.Value(0))[0];

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

// ------------------ Service ------------------
async function fetchItemById(id: string) {
  const all = await getMenuItems();
  return all.find((i) => String(i.id) === id) ?? null;
}

// ------------------ Component ------------------
export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [qty, setQty] = useState(MIN_QTY);
  const { msg: toastMsg, opacity: toastOpacity, showToast } = useToast();

  useEffect(() => {
    if (!id) return;
    fetchItemById(id).then(setItem);
  }, [id]);

  if (!item) return <Text style={{ padding: 20 }}>Đang tải...</Text>;

  const formattedPrice = `$${item.price.toFixed(2)}`;

  const handleAddToCart = () => {
    const payload: CartItem = {
      id: String(item.id),
      name: item.name,
      price: item.price,
      img: item.img,
      quantity: qty,
    };
    addToCart(payload, qty);
    showToast(`Đã thêm ${qty} món ăn vào giỏ hàng`);
    setQty(MIN_QTY);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrow-left" size={24} color="#391713" />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.ratingWrapper}>
            <Text style={styles.ratingText}>⭐ {item.rating ?? "4.5"} / 5</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <Image source={{ uri: item.img }} style={styles.productImage} />

          {/* Price & Quantity */}
          <View style={styles.rowWrapper}>
            <View style={styles.row}>
              <Text style={styles.price}>{formattedPrice}</Text>
              <View style={styles.qtyWrapper}>
                <TouchableOpacity onPress={() => setQty((q) => Math.max(MIN_QTY, q - 1))}>
                  <Text style={styles.qtyBtn}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{qty}</Text>
                <TouchableOpacity onPress={() => setQty((q) => q + 1)}>
                  <Text style={styles.qtyBtn}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.divider} />
          </View>

          <Text style={styles.description}>{item.description}</Text>
        </ScrollView>
      </View>

      {/* Add to Cart */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <Text style={styles.cartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>

      {/* Toast */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_LIGHT },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: SPACING.headerLeft,
    paddingTop: SPACING.headerTop,
    paddingBottom: 20,
    backgroundColor: BG_LIGHT,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#391713" },

  ratingWrapper: {
    backgroundColor: ACCENT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  ratingText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -10,
  },

  productImage: {
    width: width - 80,
    height: (width - 80) * 0.6,
    borderRadius: 16,
    marginBottom: 16,
    alignSelf: "center",
    marginTop: 30,
  },

  rowWrapper: { marginTop: 40, marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  divider: { height: 1, backgroundColor: "#EAEAEA", marginTop: 16 },

  price: { fontSize: 20, fontWeight: "700", color: ACCENT },
  qtyWrapper: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { fontSize: 24, marginHorizontal: 12, color: ACCENT, fontWeight: "700" },
  qtyText: { fontSize: 16, fontWeight: "700" },
  description: { fontSize: 14, color: "#676767", lineHeight: 20 },

  footer: { position: "absolute", bottom: SPACING.footerBottom, left: 20, right: 20 },
  cartBtn: {
    backgroundColor: ACCENT,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  cartText: { color: "#fff", fontSize: 16, fontWeight: "700" },

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
  toastText: { color: "#fff", fontWeight: "700" },
});
