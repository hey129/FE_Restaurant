import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { COLORS } from "../../constants/app";

type AppHeaderProps = {
  title?: string;        
  onBack?: () => void;

  /*  OPTIONAL: dùng cho RestaurantMenu */
  showRestaurantInfo?: boolean;
  avatarText?: string;        
  restaurantName?: string;
  restaurantAddress?: string;
};

export default function AppHeader({
  title,
  onBack,
  showRestaurantInfo = false,
  avatarText,
  restaurantName,
  restaurantAddress,
}: AppHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* ===== NORMAL HEADER ===== */}
        {!showRestaurantInfo && (
          <Text style={styles.title}>{title}</Text>
        )}

        {/* ===== RESTAURANT HEADER ===== */}
        {showRestaurantInfo && (
          <>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {avatarText || "?"}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.restaurantName}>
                {restaurantName}
              </Text>
              <Text style={styles.restaurantAddress}>
                {restaurantAddress}
              </Text>
            </View>
          </>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 26,
    paddingHorizontal: 20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text.primary,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text.primary,
  },

  /* RESTAURANT INFO */
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text.primary,
  },
  restaurantAddress: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});
