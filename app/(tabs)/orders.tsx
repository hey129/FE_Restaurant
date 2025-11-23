import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";

import { EmptyOrders, OrderCard, OrderTabs } from "../../components/orders";
import { ProfileHeader } from "../../components/profile";
import { COLORS } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";
import { getCustomerOrders } from "../../services/orderService";
import { supabase } from "../../services/supabaseClient";

/* ==================== TYPES ==================== */
export interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  order_id: number;
  created_at: string;
  total_amount: number;
  order_status: string; // Pending | Completed | Canceled
  payment_status: string;
  merchant_name: string;
  merchant_address: string;
  items: OrderItem[];
  delivery_address: string;
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
        orders.filter((o) => o.order_status === "Pending")
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
          await supabase
            .from("orders")
            .update({ order_status: "Canceled", payment_status: "Refunded" })
            .eq("order_id", orderId);

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
          await supabase
            .from("orders")
            .update({
              order_status: "Completed",
              payment_status: "Paid",
              delivery_updated_at: new Date().toISOString(),
            })
            .eq("order_id", orderId);

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
