import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useCart } from "../../app/context/_cartContext";
import { COLORS as APP_COLORS } from "../../constants/app";
import { CartItem } from "./cartItem";
import { CartSummary } from "./cartSummary";
import { EmptyCart } from "./emptyCart";


const COLORS = {
  background: APP_COLORS.cart.background,
  border: APP_COLORS.cart.border,
  white: APP_COLORS.white,
  whiteLight: "rgba(255,255,255,0.4)",
};
const SPACING = { small: 8, medium: 12, large: 16 };


function useSlideInModal(width: number, duration = 300) {
  const translateX = useRef(new Animated.Value(width)).current;

  const open = () => Animated.timing(translateX, { toValue: 0, duration, useNativeDriver: true }).start();
  const close = (callback?: () => void) =>
    Animated.timing(translateX, { toValue: width, duration: duration * 0.8, useNativeDriver: true }).start(() => {
      callback?.();
    });

  return { translateX, open, close };
}


export default function CartModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { cart, changeQuantity, removeFromCart } = useCart();
  const { width } = Dimensions.get("window");
  const { translateX, open, close } = useSlideInModal(width);

  useEffect(() => {
    if (visible) open();
  }, [visible, open]);

  const handleQtyChange = (id: string, delta: number, current: number) => {
    const newQty = current + delta;
    if (newQty <= 0) removeFromCart(id);
    else changeQuantity(id, delta);
  };

  const handleCheckout = () => {
    close(() => {
      onClose();
      router.push("/screen/checkout");
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => close(onClose)}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={() => close(onClose)}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.container, { width: width * 0.8, transform: [{ translateX }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Giỏ hàng</Text>
            <TouchableOpacity onPress={() => close(onClose)} style={styles.closeBtn}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              <FlatList
                data={cart}
                keyExtractor={(item) => item.id}
                style={{ marginTop: SPACING.medium }}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                  <CartItem
                    item={item}
                    onQuantityChange={(delta) => handleQtyChange(item.id, delta, item.quantity)}
                    onRemove={() => removeFromCart(item.id)}
                  />
                )}
              />

              <View style={styles.footer}>
                <CartSummary 
                  subtotal={subtotal} 
                  showDelivery 
                  showCheckoutButton
                  onCheckout={handleCheckout}
                />
              </View>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { 
    flex: 1, 
    flexDirection: "row", 
    justifyContent: "flex-end", 
    backgroundColor: "rgba(0,0,0,0.35)" 
  },
  backdropTouchable: { flex: 1 },

  container: {
    height: "100%",
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.medium,
    paddingTop: 36,
    paddingBottom: 28,
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
    justifyContent: "flex-start",
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.large,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.whiteLight,
    paddingBottom: SPACING.small,
  },
  title: { 
    color: COLORS.white, 
    fontSize: 28, 
    fontWeight: "700", 
    textAlign: "center" 
  },
  closeBtn: { 
    position: "absolute", 
    left: 0, 
    top: -10, 
    padding: 12 
  },
  close: { 
    color: COLORS.white, 
    fontSize: 24 
  },

  footer: { 
    marginTop: 20 
  },
});
