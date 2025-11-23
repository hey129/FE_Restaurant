import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

import {
  AddressForm,
  DeliveryTimePicker,
  OrderSummary,
} from "../../components/checkout";

import { PRICING, COLORS } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";
import { supabase } from "../../services/supabaseClient";

import {
  ShippingAddress,
  validateShippingAddress,
  ValidationErrors,
} from "../../utils/validation";

import { useCart } from "../context/_cartContext";

/* ============================================================
                        MAIN COMPONENT
============================================================ */

export default function CheckoutScreen() {
  const router = useRouter();
  const { merchantId } = useLocalSearchParams<{ merchantId: string }>();

  const { cart } = useCart();
  const merchantCart = cart[merchantId] || [];

  /* ---------------- STATE: SHIPPING ADDRESS ---------------- */

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    address: "",
  });

  const [isAddressFormExpanded, setIsAddressFormExpanded] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({
    name: "",
    phone: "",
    address: "",
  });

  /* ---------------- CHECK AUTH ON LOAD ---------------- */

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        if (Platform.OS === "web") {
          const confirmLogin = globalThis.confirm(
            "Bạn cần đăng nhập để tiếp tục đặt hàng"
          );

          if (confirmLogin) {
            router.replace("/auth/_welcome");
          } else {
            globalThis.history.back();
          }
        } else {
          Alert.alert(
            "Yêu cầu đăng nhập",
            "Bạn cần đăng nhập để tiếp tục đặt hàng",
            [
              {
                text: "Đăng nhập",
                onPress: () => router.replace("/auth/_welcome"),
              },
              { text: "Hủy", style: "cancel", onPress: () => router.back() },
            ]
          );
        }
      } else {
        loadDefaultAddress();
      }
    };

    checkAuth();
  }, [router]);

  /* ---------------- LOAD DEFAULT ADDRESS ---------------- */

  const loadDefaultAddress = async () => {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return;

    const { data } = await supabase
      .from("customer")
      .select("customer_name, phone, address")
      .eq("customer_id", user.id)
      .single();

    if (!data) return;

    setShippingAddress({
      name: data.customer_name || "",
      phone: data.phone || "",
      address: data.address || "",
    });

    if (data.customer_name && data.phone && data.address) {
      setIsAddressFormExpanded(false);
    }
  };

  /* ---------------- CALCULATE TOTAL ---------------- */

  const subtotal = merchantCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const total = subtotal + PRICING.TAX + PRICING.DELIVERY;

  /* ---------------- VALIDATE ADDRESS ---------------- */

  const validateAddressForm = () => {
    const { isValid, errors: validationErrors } =
      validateShippingAddress(shippingAddress);

    setErrors(validationErrors);

    return isValid;
  };

  const handleSaveAddress = () => {
    if (validateAddressForm()) {
      setIsAddressFormExpanded(false);
    }
  };

  /* ---------------- DELIVERY TIME PICKER ---------------- */

  const [deliveryTime, setDeliveryTime] = useState<"now" | "scheduled">("now");
  const [scheduledTime, setScheduledTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const handleTimeConfirm = () => {
    const now = new Date();

    if (
      selectedHour < now.getHours() ||
      (selectedHour === now.getHours() &&
        selectedMinute <= now.getMinutes())
    ) {
      Alert.alert("Thời gian không hợp lệ", "Vui lòng chọn thời gian khác");
      return;
    }

    setScheduledTime(
      `${selectedHour.toString().padStart(2, "0")}:${selectedMinute
        .toString()
        .padStart(2, "0")}`
    );

    setShowTimePicker(false);
  };

  /* ---------------- GO TO PAYMENT SCREEN ---------------- */

  const [note, setNote] = useState("");

  const handlePlaceOrder = () => {
    if (!validateAddressForm()) {
      setIsAddressFormExpanded(true);
      Alert.alert("Lỗi", "Vui lòng điền đúng thông tin giao hàng");
      return;
    }

    router.push({
      pathname: "/screen/payment",
      params: {
        merchantId,
        shippingAddress: JSON.stringify(shippingAddress),
        deliveryTime,
        scheduledTime,
        total: total.toString(),
        note,
      },
    });
  };

  /* ============================================================
                             RENDER UI
  ============================================================ */

  return (
    <View style={sharedStyles.container}>

      {/* HEADER */}
      <View style={sharedStyles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={sharedStyles.backButton}
        >
          <Text style={sharedStyles.backText}>Quay lại</Text>
        </TouchableOpacity>

        <Text style={sharedStyles.headerTitle}>Xác nhận đơn hàng</Text>

        <View style={sharedStyles.backButton} />
      </View>

      {/* CONTENT (CURVED TOP) */}
      <View style={styles.contentWrapper}>
        <ScrollView
          style={sharedStyles.content}
          showsVerticalScrollIndicator={false}
        >
          <AddressForm
            isExpanded={isAddressFormExpanded}
            address={shippingAddress}
            errors={errors}
            onAddressChange={setShippingAddress}
            onErrorChange={setErrors}
            onSave={handleSaveAddress}
            onEdit={() => setIsAddressFormExpanded(true)}
          />

          <DeliveryTimePicker
            deliveryTime={deliveryTime}
            scheduledTime={scheduledTime}
            showTimePicker={showTimePicker}
            selectedHour={selectedHour}
            selectedMinute={selectedMinute}
            onDeliveryTimeChange={setDeliveryTime}
            onShowTimePicker={() => {
              const now = new Date();
              setSelectedHour(now.getHours() + 1);
              setSelectedMinute(0);
              setShowTimePicker(true);
            }}
            onHideTimePicker={() => setShowTimePicker(false)}
            onHourChange={setSelectedHour}
            onMinuteChange={setSelectedMinute}
            onTimeConfirm={handleTimeConfirm}
          />

          {/* NOTE */}
          <View style={sharedStyles.section}>
            <Text style={sharedStyles.sectionTitle}>Ghi chú (không bắt buộc)</Text>
            <TextInput
              style={[sharedStyles.input, sharedStyles.textArea]}
              placeholder="Ví dụ: Giao vào buổi sáng..."
              placeholderTextColor="#999"
              multiline
              value={note}
              onChangeText={setNote}
            />
          </View>

          <OrderSummary
            cart={merchantCart}
            subtotal={subtotal}
            total={total}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* FOOTER */}
      <View style={sharedStyles.footer}>
        <TouchableOpacity
          style={sharedStyles.primaryButton}
          onPress={handlePlaceOrder}
        >
          <Text style={sharedStyles.primaryButtonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ============================================================
                            LOCAL STYLES
============================================================ */

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
  },
});
