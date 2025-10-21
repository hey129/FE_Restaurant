import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";
import { EmptyOrders, OrderCard, OrderTabs } from "../../components/orders";
import { ProfileHeader } from "../../components/profile";
import { COLORS } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";
import { getCustomerOrders } from "../../services/orderService";
import { supabase } from "../../services/supabaseClient";

type OrderStatus = 'Tất cả' | 'Đang xử lý' | 'Hoàn thành' | 'Đã hủy';

interface Order {
  order_id: number;
  created_at: string;
  total_amount: number;
  order_status: string;
  delivery_address: string;
  items: {
    product_name: string;
    quantity: number;
    price: number;
  }[];
}

export default function OrdersTab() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus>('Tất cả');

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('[Orders] Không có user đăng nhập');
        router.replace("/auth/_welcome");
        return;
      }

      console.log('[Orders] User ID:', user.id);
      console.log('[Orders] User email:', user.email);
      
      const customerOrders = await getCustomerOrders(user.id);
      
      console.log('[Orders] Đã nhận được', customerOrders.length, 'đơn hàng');
      setOrders(customerOrders);
    } catch (error) {
      console.error("[Orders] Tải đơn hàng thất bại:", error);
      Alert.alert("Lỗi", "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (activeTab === 'Tất cả') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => {
        if (activeTab === 'Đang xử lý') return order.order_status === 'Chờ xử lý' || order.order_status === 'Đang xử lý';
        if (activeTab === 'Hoàn thành') return order.order_status === 'Hoàn thành';
        if (activeTab === 'Đã hủy') return order.order_status === 'Đã hủy';
        return true;
      });
      setFilteredOrders(filtered);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, orders]);

  const handleCancelOrder = async (orderId: number) => {
    Alert.alert(
      "Xác nhận hủy đơn",
      "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      [
        {
          text: "Không",
          style: "cancel"
        },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('orders')
                .update({ 
                  order_status: 'Đã hủy',
                  payment_status: 'Đã hoàn tiền'
                })
                .eq('order_id', orderId);

              if (error) {
                console.error('[Orders] Lỗi cập nhật order:', error);
                Alert.alert("Lỗi", "Không thể hủy đơn hàng");
                return;
              }

              Alert.alert("Thành công", "Đơn hàng đã được hủy. Tiền sẽ được hoàn lại trong 3-5 ngày làm việc.");
              
              loadOrders();
            } catch (error) {
              console.error('[Orders] Lỗi hủy đơn:', error);
              Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[sharedStyles.container, { justifyContent: "center", alignItems: "center" }]}>
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
          <OrderCard order={item} onCancelOrder={handleCancelOrder} />
        )}
        keyExtractor={(item) => item.order_id.toString()}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={<EmptyOrders activeTab={activeTab} />}
      />
    </View>
  );
}
