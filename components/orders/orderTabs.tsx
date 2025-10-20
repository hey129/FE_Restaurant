import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/app";

type OrderStatus = 'Tất cả' | 'Đang xử lý' | 'Hoàn thành' | 'Đã hủy';

interface OrderTabsProps {
  activeTab: OrderStatus;
  onTabChange: (tab: OrderStatus) => void;
}

const TABS: OrderStatus[] = ['Tất cả', 'Đang xử lý', 'Hoàn thành', 'Đã hủy'];

export const OrderTabs: React.FC<OrderTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabs}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => onTabChange(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
});
