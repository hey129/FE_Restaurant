import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS as APP_COLORS } from "../../constants/app";


const COLORS = {
  white: APP_COLORS.white,
};


export function EmptyCart() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Giỏ Hàng trống</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  text: { 
    color: COLORS.white, 
    fontSize: 18, 
    fontWeight: "700" 
  },
});
