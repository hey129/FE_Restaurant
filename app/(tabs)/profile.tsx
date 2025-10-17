import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ProfileButton, ProfileField } from "../../components/profile";
import { COLORS } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";
import { supabase } from "../../services/supabaseClient";

interface CustomerProfile {
  customer_id: string;
  customer_name: string;
  phone: string;
  address: string | null;
  status: boolean;
}

export default function ProfileTab() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace("/feed/_welcome");
        return;
      }

      setEmail(user.email || '');

      const { data, error } = await supabase
        .from('customer')
        .select('*')
        .eq('customer_id', user.id)
        .single();

      if (error) {
        console.error("Tải hồ sơ thất bại", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace("/feed/_welcome");
          },
        },
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.customer_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <ProfileField
            label="Họ và tên"
            value={profile?.customer_name}
          />

          <ProfileField
            label="Email"
            value={email}
          />

          <ProfileField
            label="Số điện thoại"
            value={profile?.phone}
          />

          <ProfileField
            label="Địa chỉ"
            value={profile?.address}
            placeholder="Chưa có địa chỉ"
          />

          <ProfileButton
            title="Sửa hồ sơ"
            onPress={() => router.push("../screen/editProfile" as any)}
            variant="primary"
          />

          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("../screen/changePassword" as any)}
            >
              <Text style={styles.menuText}>Đổi mật khẩu</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Text style={[styles.menuText, { color: '#D32F2F' }]}>Đăng xuất</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.accent,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: COLORS.white,
  },
  form: {
    gap: 16,
    paddingBottom: 40,
  },
  menuSection: {
    marginTop: 24,
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5B4",
    borderRadius: 12,
    padding: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.text.secondary,
  },
});
