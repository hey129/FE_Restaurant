import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AddressForm, DeliveryTimePicker, OrderSummary } from "../../components/checkout";
import { PRICING } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";
import { supabase } from "../../services/supabaseClient";
import { ShippingAddress, validateShippingAddress, ValidationErrors } from "../../utils/validation";
import { useCart } from "../context/_cartContext";

type DeliveryTime = "now" | "scheduled";

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart } = useCart();

  const [isAddressFormExpanded, setIsAddressFormExpanded] = useState(true);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({ name: "", phone: "", address: "" });
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({ name: "", phone: "", address: "" });
  const [deliveryTime, setDeliveryTime] = useState<DeliveryTime>("now");
  const [scheduledTime, setScheduledTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (Platform.OS === "web") {
            const confirmLogin = window.confirm("Bạn cần đăng nhập để tiếp tục đặt hàng");
            if (confirmLogin) {
              router.replace("/auth/_welcome");
            } else {
              window.history.back();
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
                {
                  text: "Hủy",
                  onPress: () => router.back(),
                  style: "cancel",
                },
              ]
            );
          }
        } else {
          loadDefaultAddress();
        }
      } catch (error) {
        console.error("Lỗi kiểm tra xác thực:", error);
      }
    };

    checkAuthentication();
  }, [router]);

  const loadDefaultAddress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('customer')
        .select('customer_name, phone, address')
        .eq('customer_id', user.id)
        .single();

      if (error) {
        console.error("Lỗi tải địa chỉ:", error);
        return;
      }

      if (data) {
        setShippingAddress({
          name: data.customer_name || "",
          phone: data.phone || "",
          address: data.address || "",
        });

        if (data.customer_name && data.phone && data.address) {
          setIsAddressFormExpanded(false);
        }
      }
    } catch (error) {
      console.error("Lỗi tải địa chỉ mặc định:", error);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + PRICING.TAX + PRICING.DELIVERY;

  const validateAddress = () => {
    const { isValid, errors: validationErrors } = validateShippingAddress(shippingAddress);
    setErrors(validationErrors);
    return isValid;
  };

  const handleSaveAddress = () => {
    if (!validateAddress()) return;
    setIsAddressFormExpanded(false);
  };

  const handlePlaceOrder = () => {
    if (!validateAddress()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ và chính xác thông tin giao hàng");
      setIsAddressFormExpanded(true);
      return;
    }

    router.push({
      pathname: "/screen/payment",
      params: {
        shippingAddress: JSON.stringify(shippingAddress),
        deliveryTime,
        scheduledTime,
        total: total.toString(),
        note,
      },
    });
  };

  const handleTimeConfirm = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute <= currentMinute)) {
      Alert.alert("Thời gian không hợp lệ", "Vui lòng chọn thời gian trong tương lai");
      return;
    }

    setScheduledTime(`${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`);
    setShowTimePicker(false);
  };

  const handleShowTimePicker = () => {
    setDeliveryTime("scheduled");
    const now = new Date();
    const defaultHour = now.getHours() + 1 < 24 ? now.getHours() + 1 : now.getHours();
    setSelectedHour(defaultHour);
    setSelectedMinute(0);
    setShowTimePicker(true);
  };

  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={sharedStyles.backButton}>
          <Text style={sharedStyles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={sharedStyles.headerTitle}>Xác nhận đơn hàng</Text>
        <View style={sharedStyles.backButton} />
      </View>

      <ScrollView style={sharedStyles.content} showsVerticalScrollIndicator={false}>
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
          onShowTimePicker={handleShowTimePicker}
          onHideTimePicker={() => setShowTimePicker(false)}
          onHourChange={setSelectedHour}
          onMinuteChange={setSelectedMinute}
          onTimeConfirm={handleTimeConfirm}
        />

        <View style={sharedStyles.section}>
          <Text style={sharedStyles.sectionTitle}>Ghi chú (không bắt buộc)</Text>
          <TextInput
            style={[sharedStyles.input, sharedStyles.textArea]}
            placeholder="Ví dụ: Giao vào buổi sáng, để hàng ở bảo vệ..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <OrderSummary cart={cart} subtotal={subtotal} total={total} />

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={sharedStyles.footer}>
        <TouchableOpacity style={sharedStyles.primaryButton} onPress={handlePlaceOrder}>
          <Text style={sharedStyles.primaryButtonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
