import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppHeader from "../../components/header/appHeader";
import { COLORS } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";
import { saveOrderToDatabase } from "../../services/orderService";
import { processMoMoPayment } from "../../services/paymentService";
import { useCart } from "../context/_cartContext";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cart, clearCart } = useCart();

  const merchantId = params.merchantId as string;
  const merchantCart = cart[merchantId] || [];

  const shippingAddress = JSON.parse(params.shippingAddress as string);
  const deliveryTime = params.deliveryTime as string;
  const scheduledTime = params.scheduledTime as string;
  
  /** =========================
   *  FIX QUAN TRỌNG
   *  total PHẢI LÀ SỐ NGUYÊN VND
   ========================== */
  const total = Math.round(Number(params.total));

  const note = (params.note as string) || "";
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      const { supabase } = await import("../../services/supabaseClient");
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập");
        return router.replace("/auth/_welcome");
      }

      /** =========================
       *  CALL MOMO
       ========================== */
      const payment = await processMoMoPayment({
        totalAmount: total,
        itemCount: merchantCart.length,
      });

      if (payment.payUrl) {
        await Linking.openURL(payment.payUrl);
      }

      /** =========================
       *  SAVE ORDER
       ========================== */
      const result = await saveOrderToDatabase(
        {
          customer_id: user.id,
          merchant_id: merchantId,
          delivery_address: shippingAddress.address,
          total_amount: total,
          payment_status: "Paid",
          order_status: "Pending",
          note,
        },
        merchantCart.map((item) => ({
          id: Number(item.id),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        {
          amount: total,
          method: "momo",
          transaction_id: payment.transactionId,
          note: "MoMo Payment",
        }
      );

      clearCart(merchantId);

      Alert.alert(
        "Thành công",
        `Đơn hàng đã được lưu!\nOrder ID: ${result.orderId}`,
        [{ text: "OK", onPress: () => router.replace("/") }]
      );
    } catch (e: any) {
      Alert.alert("Lỗi thanh toán", e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <AppHeader title="Thanh toán" onBack={() => router.back()} />

      <View style={styles.contentWrapper}>
        <ScrollView style={styles.innerContent} showsVerticalScrollIndicator={false}>
          <View style={sharedStyles.section}>
            <Text style={sharedStyles.sectionTitle}>Địa chỉ giao hàng</Text>
            <View style={sharedStyles.addressBox}>
              <Text style={sharedStyles.addressName}>{shippingAddress.name}</Text>
              <Text style={sharedStyles.addressPhone}>{shippingAddress.phone}</Text>
              <Text style={sharedStyles.addressText}>{shippingAddress.address}</Text>
            </View>
          </View>

          <View style={sharedStyles.section}>
            <Text style={sharedStyles.sectionTitle}>Tóm tắt đơn hàng</Text>
            {merchantCart.map((item) => (
              <Text key={item.id} style={styles.summaryItem}>
                {item.name} – {item.quantity} món
              </Text>
            ))}

            <View style={[sharedStyles.divider, { marginTop: 12 }]} />

            <View style={sharedStyles.totalRow}>
              <Text style={sharedStyles.totalLabel}>Tổng cộng</Text>
              <Text style={sharedStyles.totalValue}>{total.toLocaleString()} VND</Text>
            </View>
          </View>

          <View style={sharedStyles.section}>
            <Text style={sharedStyles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.paymentOption}>
              <View style={styles.paymentLeft}>
                <View style={styles.radioOuter}>
                  <View style={styles.radioInner} />
                </View>
                <Text style={styles.paymentMethodText}>MoMo</Text>
              </View>
              <Text style={styles.paymentMethodDetail}>Ví điện tử</Text>
            </View>
            <Text style={styles.paymentNote}>Thanh toán an toàn qua ví MoMo</Text>
          </View>

          <View style={sharedStyles.section}>
            <Text style={sharedStyles.sectionTitle}>Thời gian giao hàng</Text>
            <View style={[sharedStyles.infoBox, { marginTop: 12 }]}>
              <Text style={sharedStyles.infoLabel}>Ước tính</Text>
              <Text style={sharedStyles.infoValue}>
                {deliveryTime === "now" ? "25 phút" : scheduledTime || "Chưa chọn"}
              </Text>
            </View>
          </View>

          <View style={sharedStyles.section}>
            <Text style={sharedStyles.sectionTitle}>Ghi chú</Text>
            <View style={[sharedStyles.infoBox, { marginTop: 8 }]}>
              <Text style={{ color: COLORS.text.secondary }}>
                {note || "Không có"}
              </Text>
            </View>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </View>

      <View style={sharedStyles.footer}>
        <TouchableOpacity
          style={[sharedStyles.primaryButton, isProcessing && styles.disabled]}
          disabled={isProcessing}
          onPress={handlePayment}
        >
          {isProcessing ? (
            <ActivityIndicator size={20} color="#fff" />
          ) : (
            <Text style={sharedStyles.primaryButtonText}>Thanh toán ngay</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  innerContent: {
    paddingHorizontal: 20,
  },
  summaryItem: {
    fontSize: 15,
    paddingVertical: 6,
    color: COLORS.text.primary,
  },
  disabled: { opacity: 0.6 },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
  },
  paymentLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
  },
  paymentMethodText: { fontSize: 16, fontWeight: "600" },
  paymentMethodDetail: { fontSize: 13, color: COLORS.text.light },
  paymentNote: {
    fontSize: 13,
    marginTop: 10,
    color: COLORS.text.secondary,
    fontStyle: "italic",
  },
});
