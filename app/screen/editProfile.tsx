import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from "react-native";
import { ProfileButton, ProfileHeader, ProfileInput } from "../../components/profile";
import { COLORS } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";
import { supabase } from "../../services/supabaseClient";

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(''); 
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(''); 

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace("/auth/_welcome");
        return;
      }

      setEmail(user.email || '');

      const { data, error } = await supabase
        .from('customer')
        .select('*')
        .eq('customer_id', user.id)
        .single();

      if (error) {
        console.error("Lỗi tải hồ sơ:", error);
        return;
      }

      setFullName(data.customer_name || '');
      setPhone(data.phone || ''); 
      setAddress(data.address || '');
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Họ và tên là bắt buộc");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Lỗi", "Số điện thoại là bắt buộc");
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('customer')
        .update({
          customer_name: fullName.trim(),
          phone: phone.trim(), 
          address: address.trim() || null, 
        })
        .eq('customer_id', user.id);

      if (error) {
        Alert.alert("Lỗi", "Cập nhật hồ sơ thất bại");
        console.error(error);
        return;
      }

      Alert.alert(
        "Thành công",
        "Cập nhập hồ sơ thành công",
        [
          {
            text: "OK",
            onPress: () => {
              loadProfile();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Cập nhập hồ sơ thất bại:", error);
      Alert.alert("Lỗi", "Không cập nhật được hồ sơ");
    } finally {
      setSaving(false);
    }
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
      <ProfileHeader title="Cập nhập thông tin" />

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <ProfileInput
            label="Họ và tên"
            required
            placeholder="Nhập họ và tên đầy đủ"
            value={fullName}
            onChangeText={setFullName}
            disabled={saving}
          />

          <ProfileInput
            label="Email"
            placeholder="Email"
            value={email}
            disabled
            helperText="Email được quản lý bởi hệ thống xác thực"
          />

          <ProfileInput
            label="Số điện thoại"
            required
            placeholder="Nhập số điện thoại của bạn"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            disabled={saving}
          />

          <ProfileInput
            label="Địa chỉ"
            placeholder="Nhập địa chỉ của bạn (tùy chọn)"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            disabled={saving}
            style={styles.addressInput}
          />

          <ProfileButton
            title="Cập nhập"
            loading={saving}
            onPress={handleUpdateProfile}
            variant="primary"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  form: {
    gap: 16,
    paddingBottom: 40,
  },
  addressInput: {
    minHeight: 80,
    paddingTop: 14,
  },
});
