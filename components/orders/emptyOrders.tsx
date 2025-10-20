import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/app";

type OrderStatus = 'Tất cả' | 'Đang xử lý' | 'Hoàn thành' | 'Đã hủy';

interface EmptyOrdersProps {
  activeTab: OrderStatus;
}

export const EmptyOrders: React.FC<EmptyOrdersProps> = ({ activeTab }) => {
  const router = useRouter();

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Không tìm thấy đơn đặt hàng nào</Text>
      <Text style={styles.emptyText}>
        {activeTab === 'Tất cả'
          ? "Bạn chưa có đơn hàng nào"
          : `Bạn không có bất kỳ đơn hàng ${activeTab.toLowerCase()} nào`}
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.browseButtonText}>Duyệt thực đơn</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
});
