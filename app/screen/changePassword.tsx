import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { ProfileButton, ProfileHeader, ProfileInput } from "../../components/profile";
import { COLORS } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";
import { supabase } from "../../services/supabaseClient";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Điền đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không khớp");
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        Alert.alert("Lỗi", "Người dùng không tồn tại");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert("Lỗi", "Mật khẩu hiện tại không đúng");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Alert.alert("Error", updateError.message);
        setLoading(false);
        return;
      }

      Alert.alert(
        "Thành công",
        "Đổi mật khẩu thành công",
        [
          {
            text: "OK",
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            },
          },
        ]
      );
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      Alert.alert("Lỗi", "Không thể đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={sharedStyles.container}>
      <ProfileHeader title="Cài đặt" />

      <View style={styles.content}>

        <Text style={styles.title}>Đổi mật khẩu</Text>

        <View style={styles.form}>
          <ProfileInput
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu hiện tại"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            disabled={loading}
          />

          <ProfileInput
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            disabled={loading}
          />

          <ProfileInput
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            disabled={loading}
          />

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementTitle}>Mật khẩu phải chứa:</Text>
            <Text style={[
              styles.requirement,
              newPassword.length >= 6 && styles.requirementMet
            ]}>
              • Ít nhất 6 ký tự
            </Text>
            <Text style={[
              styles.requirement,
              newPassword !== confirmPassword && confirmPassword.length > 0 && styles.requirementNotMet
            ]}>
              • Mật khẩu phải trùng khớp
            </Text>
          </View>

          <ProfileButton
            title="Đổi mật khẩu"
            loading={loading}
            onPress={handleChangePassword}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  form: {
    gap: 16,
  },
  passwordRequirements: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  requirementTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  requirement: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  requirementMet: {
    color: "#66BB6A",
  },
  requirementNotMet: {
    color: "#EF5350",
  },
});
