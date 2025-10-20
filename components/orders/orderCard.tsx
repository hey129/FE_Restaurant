import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/app";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  order_id: number;
  created_at: string;
  total_amount: number;
  order_status: string;
  delivery_address: string;
  items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  onCancelOrder: (orderId: number) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onCancelOrder }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(3)} VND`;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Chờ xử lý':
      case 'Đang xử lý':
        return { backgroundColor: '#FFA726' };
      case 'Hoàn thành':
        return { backgroundColor: '#66BB6A' };
      case 'Đã hủy':
        return { backgroundColor: '#EF5350' };
      default:
        return { backgroundColor: '#BDBDBD' };
    }
  };

  const getStatusTextVi = (status: string) => {
    switch (status) {
      case 'Chờ xử lý':
        return 'Chờ xác nhận';
      case 'Đang xử lý':
        return 'Đang xử lý';
      case 'Hoàn thành':
        return 'Hoàn thành';
      case 'Đã hủy':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Đơn hàng #{order.order_id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusBadgeStyle(order.order_status)]}>
          <Text style={styles.statusText}>{getStatusTextVi(order.order_status)}</Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        {order.items.map((product, index) => (
          <View key={index} style={styles.productRow}>
            <Text style={styles.productName}>
              {product.quantity}x {product.product_name}
            </Text>
            <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.totalLabel}>Tổng tiền</Text>
          <Text style={styles.totalAmount}>{formatCurrency(order.total_amount)}</Text>
        </View>
        {(order.order_status === 'Chờ xử lý' || order.order_status === 'Đang xử lý') && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => onCancelOrder(order.order_id)}
          >
            <Text style={styles.cancelButtonText}>Hủy đơn</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  orderBody: {
    marginBottom: 12,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  totalLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.accent,
  },
  cancelButton: {
    backgroundColor: "#EF5350",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
});
