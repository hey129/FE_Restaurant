import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/app";
import { supabase } from "../../services/supabaseClient";
import DroneMap from "../../components/map/droneMap";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORT 2 HÀM QUAN TRỌNG
import {
  updateDroneLocation,
  confirmOrderReceived,
  markOrderArrived,
} from "../../services/orderService";

/* TYPES */
type OrderItem = {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
};

type OrderType = {
  order_id: number;
  merchant_name: string;
  merchant_address: string;
  created_at: string;
  order_status: "Pending" | "Completed" | "Canceled";
  payment_status: "Paid" | "Refunded";
  delivery_address?: string;
  total_amount: number;
  items: OrderItem[];
};

const STATUS_MAP = {
  Pending: "Đang xử lý",
  Completed: "Hoàn thành",
  Canceled: "Đã hủy",
};

const STATUS_COLOR = {
  Pending: "#FFA726",
  Completed: "#66BB6A",
  Canceled: "#EF5350",
};

const PAYMENT_MAP = {
  Paid: "Đã thanh toán",
  Refunded: "Đã hoàn tiền",
};

const PAYMENT_COLOR = {
  Paid: "#66BB6A",
  Refunded: "#29B6F6",
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
    " " +
    d.toLocaleDateString("vi-VN")
  );
};

export default function MyOrderDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ order: string }>();
  const parsed = Array.isArray(params.order) ? params.order[0] : params.order;
  const order: OrderType = JSON.parse(parsed);

  const [lastPos, setLastPos] = useState<{ lat: number; lng: number }>();
  const [droneArrived, setDroneArrived] = useState(false);

  /* Load vị trí + trạng thái drone */
  useEffect(() => {
    const loadData = async () => {
      const saved = await AsyncStorage.getItem(`drone-pos-${order.order_id}`);
      if (saved) setLastPos(JSON.parse(saved));

      const arrived = await AsyncStorage.getItem(
        `drone-arrived-${order.order_id}`
      );
      if (arrived === "true") setDroneArrived(true);
    };

    loadData();
  }, [order.order_id]);

  const canShowButton = order.order_status === "Pending";
  const buttonLabel = droneArrived ? "Đã nhận" : "Hủy đơn";

  /* Xử lý nút */
  const handleButtonPress = async () => {
    if (buttonLabel === "Hủy đơn") {
      Alert.alert("Xác nhận hủy", "Bạn có chắc muốn hủy đơn?", [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy",
          style: "destructive",
          onPress: async () => {
            await supabase
              .from("orders")
              .update({
                order_status: "Canceled",
                payment_status: "Refunded",
              })
              .eq("order_id", order.order_id);

            router.replace("/(tabs)/orders");
          },
        },
      ]);
      return;
    }

    Alert.alert("Xác nhận", "Bạn đã nhận được hàng từ drone?", [
      { text: "Chưa", style: "cancel" },
      {
        text: "Đã nhận",
        onPress: async () => {
          await confirmOrderReceived(order.order_id);
          router.replace("/(tabs)/orders");
        },
      },
    ]);
  };

  const restaurantGPS = { lat: 10.8231, lng: 106.6297 };
  const destinationGPS = { lat: 10.795, lng: 106.68 };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(tabs)/orders")}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {/* STATUS */}
        <View style={styles.statusBox}>
          <View
            style={[
              styles.statusHeader,
              { backgroundColor: STATUS_COLOR[order.order_status] },
            ]}
          >
            <Text style={styles.statusTitle}>
              {STATUS_MAP[order.order_status]}
            </Text>
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTime}>
              Cập nhật: {formatDateTime(order.created_at)}
            </Text>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Thanh toán: </Text>
              <Text
                style={{
                  fontWeight: "800",
                  color: PAYMENT_COLOR[order.payment_status],
                }}
              >
                {PAYMENT_MAP[order.payment_status]}
              </Text>
            </View>
          </View>
        </View>

        {/* MAP – khi Pending */}
        {order.order_status === "Pending" && (
          <>
            <Text style={styles.section}>Vị trí drone hiện tại</Text>

            <DroneMap
              orderId={Number(order.order_id)}
              restaurant={restaurantGPS}
              destination={destinationGPS}
              lastPosition={lastPos}
              onProgress={async () => {
                await updateDroneLocation(order.order_id);
              }}
              onArrived={async (d) => {
                setLastPos({ lat: d.lat, lng: d.lng });

                await AsyncStorage.setItem(
                  `drone-arrived-${order.order_id}`,
                  "true"
                );

                await markOrderArrived(order.order_id);

                setDroneArrived(true);
              }}
            />
          </>
        )}

        {/* MAP WHEN COMPLETED */}
        {order.order_status === "Completed" && (
          <>
            <Text style={styles.section}>Vị trí cuối cùng của drone</Text>
            <DroneMap
              orderId={Number(order.order_id)}
              restaurant={destinationGPS}
              destination={destinationGPS}
              lastPosition={lastPos}
            />
            <View style={styles.card}>
              <Text style={styles.merchant}>Đã giao hàng thành công</Text>
            </View>
          </>
        )}

        {/* ADDRESS */}
        <Text style={styles.section}>Giao tới</Text>
        <View style={styles.card}>
          <Text style={styles.address}>{order.delivery_address}</Text>
        </View>

        {/* MERCHANT */}
        <Text style={styles.section}>Nhà hàng</Text>
        <View style={styles.card}>
          <Text style={styles.merchant}>{order.merchant_name}</Text>
          <Text style={styles.address}>{order.merchant_address}</Text>
        </View>

        {/* ITEMS */}
        <Text style={styles.section}>Sản phẩm</Text>
        <View style={styles.card}>
          {order.items.map((item) => (
            <View key={item.product_id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.product_name} × {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                {(item.price * item.quantity).toLocaleString("vi-VN")} VND
              </Text>
            </View>
          ))}
        </View>

        {/* TOTAL */}
        <Text style={styles.section}>Tổng tiền</Text>
        <View style={styles.card}>
          <Text style={styles.total}>
            {order.total_amount.toLocaleString("vi-VN")} VND
          </Text>
        </View>
      </ScrollView>

      {/* BUTTON */}
      {canShowButton && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleButtonPress}>
            <Text style={styles.cancelText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backBtn: { padding: 6, paddingRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  scroll: { padding: 16 },

  statusBox: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  statusHeader: { paddingVertical: 12, paddingHorizontal: 16 },
  statusTitle: { fontSize: 18, fontWeight: "900", color: "#FFF" },
  statusContent: { padding: 16 },
  statusTime: { color: "#666" },

  paymentRow: { flexDirection: "row", marginTop: 6 },
  paymentLabel: { color: "#444" },

  section: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 6,
  },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  merchant: { fontSize: 16, fontWeight: "800" },
  address: { marginTop: 4, color: "#777" },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  itemName: { fontSize: 14 },
  itemPrice: { color: COLORS.accent, fontWeight: "700" },

  total: { fontSize: 22, fontWeight: "900", color: COLORS.accent },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    backgroundColor: "#FFF",
  },
  cancelBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  cancelText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
