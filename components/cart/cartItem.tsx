import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CartItem as CartItemType } from "../../app/context/_cartContext";
import { COLORS as APP_COLORS } from "../../constants/app";


type CartItemProps = {
  item: CartItemType;
  onQuantityChange?: (delta: number) => void;
  onRemove?: () => void;
  readOnly?: boolean; 
};


const COLORS = {
  white: APP_COLORS.white,
  whiteTransparent: "rgba(255,255,255,0.3)",
};
const SPACING = { small: 8, medium: 12 };


export function CartItem({ 
  item, 
  onQuantityChange, 
  onRemove, 
  readOnly = false 
}: CartItemProps) {
  return (
    <View>
      <View style={styles.item}>
        <Image source={{ uri: item.img }} style={styles.itemImg} />
        
        <View style={{ flex: 1, marginLeft: SPACING.medium }}>
          <Text style={styles.itemName}>{item.name}</Text>
          
          <View style={styles.priceQtyRow}>
            <Text style={styles.itemPrice}>{item.price.toFixed(3)} VND</Text>
            
            {!readOnly && (
              <View style={styles.qtyRow}>
                <TouchableOpacity 
                  onPress={() => onQuantityChange?.(-1)} 
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                
                <Text style={styles.qtyText}>{item.quantity}</Text>
                
                <TouchableOpacity 
                  onPress={() => onQuantityChange?.(1)} 
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            )}

            {readOnly && (
              <Text style={styles.qtyText}>x{item.quantity}</Text>
            )}
          </View>
        </View>

        {!readOnly && onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.deleteBtn}>
            <AntDesign name="delete" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.itemDivider} />
    </View>
  );
}


const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    marginBottom: SPACING.medium,
    padding: SPACING.medium,
    alignItems: "flex-start",
    position: "relative",
    borderRadius: 12,
    backgroundColor: "transparent",
    minHeight: 90,
  },
  itemImg: { 
    width: 64, 
    height: 64, 
    borderRadius: 10 
  },
  itemName: { 
    fontWeight: "800", 
    fontSize: 18, 
    color: COLORS.white, 
    marginBottom: 6, 
    flexShrink: 1, 
    paddingRight: 30 
  },

  priceQtyRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginTop: 4 
  },
  itemPrice: { 
    fontWeight: "700", 
    fontSize: 16, 
    color: COLORS.white 
  },

  qtyRow: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  qtyBtn: { 
    borderWidth: 1, 
    borderColor: COLORS.white, 
    borderRadius: 4, 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    marginHorizontal: 4 
  },
  qtyBtnText: { 
    color: COLORS.white, 
    fontWeight: "700", 
    fontSize: 16 
  },
  qtyText: { 
    marginHorizontal: 4, 
    fontSize: 16, 
    fontWeight: "700", 
    color: COLORS.white 
  },

  deleteBtn: { 
    position: "absolute", 
    top: 4, 
    right: 4, 
    padding: 4 
  },

  itemDivider: { 
    height: 1, 
    backgroundColor: COLORS.whiteTransparent, 
    width: "70%", 
    alignSelf: "center", 
    marginVertical: 8 
  },
});
