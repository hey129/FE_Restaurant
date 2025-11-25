import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/app";

interface OrderCardProps {
  order: any;
  onPress: (order: any) => void;
  onCancelOrder: (id: number) => void;
  onConfirmReceived: (id: number) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onCancelOrder,
  onConfirmReceived,
}) => {
  const [droneArrived, setDroneArrived] = useState(false);

  /* Load trạng thái drone */
  useEffect(() => {
    const checkArrived = async () => {
      const arrived = await AsyncStorage.getItem(
        `drone-arrived-${order.order_id}`
      );
      if (arrived === "true") setDroneArrived(true);
    };
    checkArrived();
  }, [order.order_id]);

  /* Trạng thái */
  const status = order.order_status;

  const STATUS_COLOR: Record<string, string> = {
    Pending: "#FFA726",
    Shipping: "#29B6F6",
    Completed: "#66BB6A",
    Cancelled: "#EF5350",
  };

  const STATUS_TEXT: Record<string, string> = {
    Pending: "Đang xử lý",
    Shipping: "Đang vận chuyển",
    Completed: "Hoàn thành",
    Cancelled: "Đã hủy",
  };

  /* Logic nút (chuẩn theo yêu cầu của bạn) */
  const showCancelButton =
    (status === "Pending" || status === "Shipping") && !droneArrived;

  const showConfirmButton = status === "Shipping" && droneArrived;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(order)}
      activeOpacity={0.9}
    >
      <Text style={styles.merchant}>{order.merchant_name}</Text>
      <Text style={styles.address}>{order.merchant_address}</Text>

      <Text style={styles.total}>
        {order.total_amount.toLocaleString("vi-VN")} VND
      </Text>

      <View
        style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[status] }]}
      >
        <Text style={styles.statusText}>{STATUS_TEXT[status]}</Text>
      </View>

      {showCancelButton && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => onCancelOrder(order.order_id)}
        >
          <Text style={styles.cancelText}>Hủy đơn</Text>
        </TouchableOpacity>
      )}

      {showConfirmButton && (
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => onConfirmReceived(order.order_id)}
        >
          <Text style={styles.confirmText}>Đã nhận</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

/* STYLES */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  merchant: { fontSize: 16, fontWeight: "800" },
  address: { marginTop: 4, color: "#777" },
  total: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.accent,
    marginTop: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  statusText: { color: "#FFF", fontWeight: "800" },

  cancelBtn: {
    backgroundColor: "#EF5350",
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  confirmBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
  },
  confirmText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
});

export default OrderCard;
