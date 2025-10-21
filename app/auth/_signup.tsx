import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthButton, AuthHeader, AuthInput } from "../../components/auth";
import { COLORS } from "../../constants/app";
import { supabase } from "../../services/supabaseClient";

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Lỗi", "Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: user@example.com)");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (authError) {
        console.error("Lỗi xác thực:", authError);
        let errorMessage = "Đăng ký thất bại";
        
        if (authError.message.includes("already registered")) {
          errorMessage = "Email đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác";
        } else if (authError.message.includes("invalid")) {
          errorMessage = "Email hoặc mật khẩu không hợp lệ. Vui lòng kiểm tra lại";
        } else if (authError.message.includes("weak")) {
          errorMessage = "Mật khẩu quá yếu. Vui lòng dùng mật khẩu mạnh hơn";
        } else {
          errorMessage = authError.message;
        }
        
        Alert.alert("Đăng ký thất bại", errorMessage);
        return;
      }

      const { error: customerError } = await supabase
        .from('customer')
        .insert({
          customer_id: authData.user!.id,
          customer_name: fullName,
          phone: phone,
        });

      if (customerError) {
        console.error("Customer insert error:", customerError);
      }

      Alert.alert(
        "Đăng ký thành công",
        "Bạn có thể đăng nhập ngay bây giờ",
        [
          {
            text: "OK",
              onPress: () => router.replace("/auth/_login"),
          },
        ]
      );
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AuthHeader title="Đăng ký" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <AuthInput
            label="Họ và tên"
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
          />

          <AuthInput
            label="Email"
            placeholder="example@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AuthInput
            label="Mật khẩu"
            placeholder="••••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <AuthInput
            label="Số điện thoại"
            placeholder="+84 123 456 789"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.termsText}>
            By continuing, you agree to{"\n"}
            <Text style={styles.termsLink}>Terms of Use</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          <AuthButton
            title="Đăng ký"
            loading={loading}
            onPress={handleSignUp}
          />

          <Text style={styles.orText}>hoặc </Text>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>F</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.replace("/auth/_login")}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.accent,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 24,
  },
  form: {
    gap: 16,
  },
  datePickerContainer: {
    marginBottom: 0,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginTop: 8,
  },
  termsLink: {
    color: COLORS.accent,
    fontWeight: "600",
  },
  orText: {
    textAlign: "center",
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE5B4",
    justifyContent: "center",
    alignItems: "center",
  },
  socialIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.accent,
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: "700",
  },
});
