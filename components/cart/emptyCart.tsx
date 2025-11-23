import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { COLORS } from "../../constants/app";

export function EmptyCart() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/102/102661.png" }}
        style={styles.img}
      />
      <Text style={styles.text}>Giỏ hàng trống</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  img: {
    width: 70,
    height: 70,
    opacity: 0.6,
    marginBottom: 16,
  },
  text: {
    color: COLORS.text.secondary,
    fontSize: 16,
    fontWeight: "600",
  },
});
