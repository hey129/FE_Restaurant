import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";

import { EmptyOrders, OrderCard, OrderTabs } from "../../components/orders";
import { ProfileHeader } from "../../components/profile";
import { COLORS } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";
import { cancelOrder, confirmOrderReceived, getCustomerOrders } from "../../services/orderService";
import { supabase } from "../../services/supabaseClient";

/* ==================== TYPES ==================== */
export interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

export interface DroneInfo {
  drone_id: number;
  model: string;
  status: "idle" | "delivering";
  battery: number;
  current_lat: number | null;
  current_lng: number | null;
  updated_at: string;
}

export interface DeliveryAssignment {
  assignment_id: number;
  drone_id: number | null;
  pickup_lat: number;
  pickup_lng: number;
  drop_lat: number;
  drop_lng: number;
  status: "assigned" | "in_transit" | "arrived" | "completed";
  assigned_at: string;
  completed_at: string | null;
  drone?: DroneInfo;
}

export interface Order {
  order_id: number;
  created_at: string;
  total_amount: number;
  order_status: string; // Pending | Shipping | Completed | Canceled
  payment_status: string;
  merchant_name: string;
  merchant_address: string;
  items: OrderItem[];
  delivery_address: string;
  delivery_assignment?: DeliveryAssignment | null;
}

export type OrderStatus = "Tất cả" | "Đang xử lý" | "Hoàn thành" | "Đã hủy";

/* ==================== MAIN ==================== */
export default function OrdersTab() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus>("Tất cả");

  /* LOAD ORDER FROM DB */
  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/_welcome");
        return;
      }

      const customerOrders = await getCustomerOrders(user.id);
      setOrders(customerOrders);
    } catch (err) {
      console.error("[Orders] Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  /* FILTER ORDERS */
  const filterOrders = () => {
    if (activeTab === "Tất cả") return setFilteredOrders(orders);

    if (activeTab === "Đang xử lý") {
      return setFilteredOrders(
        orders.filter((o) => o.order_status === "Pending" || o.order_status === "Shipping")
      );
    }

    if (activeTab === "Hoàn thành") {
      return setFilteredOrders(
        orders.filter((o) => o.order_status === "Completed")
      );
    }

    if (activeTab === "Đã hủy") {
      return setFilteredOrders(
        orders.filter((o) => o.order_status === "Canceled")
      );
    }
  };

  /* HANDLE ACTIONS */
  const openOrderDetail = (order: Order) => {
    router.push({
      pathname: "/screen/myorderDetail",
      params: { order: JSON.stringify(order) },
    });
  };

  const handleCancelOrder = async (orderId: number) => {
    Alert.alert("Xác nhận", "Bạn có muốn hủy đơn?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy",
        style: "destructive",
        onPress: async () => {
          await cancelOrder(orderId);
          loadOrders();
        },
      },
    ]);
  };

  const handleConfirmReceived = async (orderId: number) => {
    Alert.alert("Xác nhận", "Bạn đã nhận hàng?", [
      { text: "Chưa", style: "cancel" },
      {
        text: "Đã nhận",
        onPress: async () => {
          await confirmOrderReceived(orderId);
          loadOrders();
        },
      },
    ]);
  };

  /* EFFECTS */
  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [activeTab, orders]);

  /* UI */
  if (loading) {
    return (
      <View
        style={[
          sharedStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={sharedStyles.container}>
      <ProfileHeader title="Đơn hàng" />
      <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={openOrderDetail}
            onCancelOrder={handleCancelOrder}
            onConfirmReceived={handleConfirmReceived}
          />
        )}
        keyExtractor={(item) => item.order_id.toString()}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={<EmptyOrders activeTab={activeTab} />}
      />
    </View>
  );
}
