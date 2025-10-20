import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS as APP_COLORS, PRICING } from "../../constants/app";


type CartSummaryProps = {
  subtotal: number;
  showDelivery?: boolean; 
  showCheckoutButton?: boolean; 
  onCheckout?: () => void;
};


const COLORS = {
  accent: APP_COLORS.accentYellow,
  white: APP_COLORS.white,
  whiteLight: "rgba(255,255,255,0.4)",
};


const SummaryRow = ({ 
  label, 
  value, 
  bold = false 
}: { 
  label: string; 
  value: string; 
  bold?: boolean;
}) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, bold && { fontWeight: "700" }]}>
      {label}
    </Text>
    <Text style={[styles.summaryValue, bold && { fontWeight: "700" }]}>
      {value}
    </Text>
  </View>
);


export function CartSummary({ 
  subtotal, 
  showDelivery = true,
  showCheckoutButton = true,
  onCheckout,
}: CartSummaryProps) {
  const delivery = showDelivery ? PRICING.DELIVERY : 0;
  const total = subtotal + PRICING.TAX + delivery;

  return (
    <View style={styles.container}>
      <SummaryRow label="Tạm tính" value={`${subtotal.toFixed(3)}`} />
      
      <SummaryRow label="Thuế & phí" value={`${PRICING.TAX.toFixed(3)}`} />
      
      {showDelivery && (
        <SummaryRow label="Phí giao hàng" value={`${delivery.toFixed(3)}`} />
      )}

      <View style={styles.totalDivider} />
      
      <SummaryRow 
        label="Tổng cộng" 
        value={`${total.toFixed(3)} VND`} 
        bold 
      />

      {showCheckoutButton && (
        <TouchableOpacity 
          style={styles.checkoutBtn}
          onPress={onCheckout}
        >
          <Text style={styles.checkoutText}>Thanh toán</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { 
    marginTop: 20 
  },
  
  summaryRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 8, 
    alignItems: "center" 
  },
  summaryLabel: { 
    color: COLORS.white, 
    opacity: 0.95, 
    fontSize: 17 
  },
  summaryValue: { 
    color: COLORS.white, 
    fontWeight: "700", 
    fontSize: 16 
  },

  totalDivider: { 
    borderTopWidth: 1, 
    borderTopColor: COLORS.whiteLight, 
    marginTop: 8, 
    marginBottom: 8 
  },

  checkoutBtn: { 
    marginTop: 14, 
    backgroundColor: COLORS.accent, 
    borderRadius: 25, 
    paddingVertical: 12, 
    alignItems: "center" 
  },
  checkoutText: { 
    fontWeight: "700", 
    fontSize: 16, 
    color: "#391713" 
  },
});
