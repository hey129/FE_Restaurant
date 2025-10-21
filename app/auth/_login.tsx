import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthButton, AuthHeader, AuthInput } from "../../components/auth";
import { COLORS } from "../../constants/app";
import { supabase } from "../../services/supabaseClient";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Lỗi", "Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: user@example.com)");
      return;
    }

    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error("Đăng nhập thất bại:", error);
        let errorMessage = "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email chưa được xác thực. Vui lòng kiểm tra hộp thư.";
        } else if (error.message.includes("User not found")) {
          errorMessage = "Tài khoản không tồn tại. Vui lòng đăng ký.";
        }
        
        Alert.alert("Đăng nhập thất bại", errorMessage);
        return;
      }

      console.log("Đăng nhập thành công:", data.user);
      Alert.alert("Thành công", "Đăng nhập thành công!", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error) {
      console.error("Đăng nhâp thất bại:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AuthHeader title="Đăng nhập" />

      <View style={styles.content}>
        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeTitle}>Welcome</Text>
        </View>

        <View style={styles.form}>
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

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <AuthButton
            title="Đăng nhập"
            loading={loading}
            onPress={handleLogin}
          />

          <Text style={styles.orText}>hoặc</Text>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>f</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signupPrompt}>
            <Text style={styles.signupText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/_signup")}>
              <Text style={styles.signupLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  welcomeBox: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  form: {
    gap: 16,
  },
  forgotPassword: {
    fontSize: 13,
    color: COLORS.accent,
    textAlign: "right",
    marginTop: -8,
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
  signupPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  signupLink: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: "700",
  },
});
