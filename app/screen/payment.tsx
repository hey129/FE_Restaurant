import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";
import { saveOrderToDatabase } from "../../services/orderService";
import { processMoMoPayment } from "../../services/paymentService";
import { useCart } from "../context/_cartContext";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cart, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const shippingAddress = params.shippingAddress 
    ? JSON.parse(params.shippingAddress as string) 
    : { name: "", phone: "", address: "" };
  const deliveryTime = params.deliveryTime as string;
  const scheduledTime = params.scheduledTime as string;
  const total = parseFloat(params.total as string) || 0;
  const note = (params.note as string) || "";

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      console.log('[Payment] Bắt đầu xử lý thanh toán...');
      
      const { supabase } = await import("../../services/supabaseClient");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để tiếp tục");
        router.replace("/feed/_login");
        return;
      }
      
      console.log('[Payment] User ID:', user.id);
      
      const paymentResult = await processMoMoPayment({
        totalAmount: total,
        itemCount: cart.length,
      });

      console.log('[Payment] MoMo thành công:', paymentResult.transactionId);

      if (paymentResult.payUrl) {
        await Linking.openURL(paymentResult.payUrl);
      }

      console.log('[Payment] Đang lưu đơn hàng vào database...');
      const saveResult = await saveOrderToDatabase(
        {
          customer_id: user.id, 
          delivery_address: shippingAddress.address,
          total_amount: total, 
          order_status: 'Chờ xử lý',
          payment_status: 'Đã thanh toán' ,
          note: note || undefined
        },
        cart.map(item => ({
          id: parseInt(item.id as string),
          name: item.name,
          price: item.price, 
          quantity: item.quantity
        })),
        {
          amount: total, 
          method: 'momo',
          transaction_id: paymentResult.transactionId,
          note: 'MoMo Sandbox Payment'
        }
      );

      if (!saveResult.success) {
        console.warn('[Payment] Lưu DB thất bại:', saveResult.error);
      } else {
        console.log('[Payment] Lưu DB thành công! Order ID:', saveResult.orderId);
      }

      Alert.alert(
        "Thanh toán thành công!",
        `ID giao dịch: ${paymentResult.transactionId}\n` +
        `ID đơn hàng: ${saveResult.orderId || 'N/A'}\n\n` +
        `Tổng tiền: ${total.toFixed(3)} VND\n` +
        `Số lượng: ${cart.length} món\n\n` +
        `Đơn hàng đã được lưu vào hệ thống!`,
        [{
          text: "OK",
          onPress: () => {
            clearCart();
            router.replace("/");
          }
        }]
      );
    } catch (error) {
      console.error('[Payment] Lỗi:', error);
      
      Alert.alert(
        "Thanh toán thất bại",
        error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại!",
        [
          {
            text: "Thử lại",
            onPress: () => setIsProcessing(false)
          },
          {
            text: "Hủy",
            style: "cancel",
            onPress: () => {
              setIsProcessing(false);
              router.back();
            }
          }
        ]
      );
    }
  };

  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={sharedStyles.backButton}>
          <Text style={sharedStyles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={sharedStyles.headerTitle}>Thanh toán</Text>
        <View style={sharedStyles.backButton} />
      </View>

      <ScrollView style={sharedStyles.content} showsVerticalScrollIndicator={false}>
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
          {cart.slice(0, 2).map((item, index) => (
            <View key={item.id}>
              <Text style={styles.summaryItem}>
                {item.name} - {item.quantity} món
              </Text>
              {index < 1 && cart.length > 1 && <View style={sharedStyles.divider} />}
            </View>
          ))}
          {cart.length > 2 && (
            <Text style={styles.moreItems}>+{cart.length - 2} món khác</Text>
          )}
          <View style={[sharedStyles.divider, { marginTop: 12 }]} />
          <View style={sharedStyles.totalRow}>
            <Text style={sharedStyles.totalLabel}>Tổng cộng</Text>
            <Text style={sharedStyles.totalValue}>{total.toFixed(3)} VND</Text>
          </View>
        </View>

        <View style={sharedStyles.section}>
          <Text style={sharedStyles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentOption}>
            <View style={styles.paymentOptionLeft}>
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
          <View style={[sharedStyles.infoBox, { marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
            <Text style={sharedStyles.infoLabel}>Ước tính giao hàng</Text>
            <Text style={sharedStyles.infoValue}>
              {deliveryTime === "now" ? "25 phút" : scheduledTime || "Chưa chọn"}
            </Text>
          </View>
        </View>

        <View style={sharedStyles.section}>
          <Text style={sharedStyles.sectionTitle}>Ghi chú</Text>
          <View style={[sharedStyles.infoBox, { marginTop: 8 }]}>
            <Text style={[sharedStyles.addressText, { marginBottom: 0 }]}>
              {note || "Không có"}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={sharedStyles.footer}>
        <TouchableOpacity
          style={[sharedStyles.primaryButton, isProcessing && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={sharedStyles.primaryButtonText}>Thanh toán ngay</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryItem: { fontSize: 15, color: COLORS.text.primary, paddingVertical: 8 },
  moreItems: { fontSize: 13, color: COLORS.text.light, fontStyle: "italic", marginTop: 4 },
  
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  paymentOptionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent },
  paymentMethodText: { fontSize: 16, fontWeight: "600", color: COLORS.text.primary },
  paymentMethodDetail: { fontSize: 13, color: COLORS.text.light },
  paymentNote: { fontSize: 13, color: COLORS.text.secondary, marginTop: 12, fontStyle: "italic" },
  
  buttonDisabled: { opacity: 0.6 },
});
