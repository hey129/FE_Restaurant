import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

type OnboardingProps = {
  onFinish: () => void;
};

export const OnboardingSimple = ({ onFinish }: OnboardingProps) => {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=800",
        }}
        style={styles.background}
        resizeMode="cover"
      />

      <View style={styles.overlay} />

      <View style={styles.bottomModal}>
        <Image
          source={{ uri: "https://via.placeholder.com/80.png?text=Icon" }}
          style={styles.icon}
        />
        <Text style={styles.title}>Fast Delivery</Text>
        <Text style={styles.subtitle}>
          Giao đồ ăn nhanh chóng, ngon miệng và tiện lợi ngay tại nhà
        </Text>

        <View style={styles.pagination}>
          <View style={[styles.dot, { backgroundColor: "#f5a623" }]} />
        </View>

        <TouchableOpacity style={styles.button} onPress={onFinish}>
          <Text style={styles.buttonText}>Bắt đầu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { 
    position: "absolute", 
    width: width, 
    height: height,
  },
  overlay: {
    position: "absolute",
    width: width,
    height: height,
    backgroundColor: "rgba(0,0,0,0.2)", 
  },
  bottomModal: {
    position: "absolute",
    bottom: 0,
    width: width,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  icon: { width: 80, height: 80, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "900", color: "#f5a623", marginBottom: 10 },
  subtitle: { fontSize: 14, fontWeight: "500", color: "#333", textAlign: "center", width: width - 40 },
  pagination: { flexDirection: "row", marginVertical: 20 },
  dot: { width: 20, height: 5, borderRadius: 5 },
  button: { backgroundColor: "#f5a623", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 50 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "500" },
});
