import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/app";

export type MenuItem = {
  readonly id: string | number;
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly img: string;
  readonly categoryId?: number;
  readonly categoryName?: string;
};

// Category Item
export function CategoryItem({
  item,
  selected,
  onPress,
}: {
  readonly item: { id: number; name: string; img?: string };
  readonly selected: boolean;
  readonly onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.categoryWrapper,
        selected && styles.categorySelected,
      ]}
    >
      <Text
        style={[
          styles.categoryText,
          selected && styles.categoryTextSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}

// Menu List Item
export function MenuListItem({
  item,
  merchantId,
  onPress,
}: {
  readonly item: MenuItem;
  readonly merchantId: string;
  readonly onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>

        {item.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <Text style={styles.price}>
          {item.price.toLocaleString("vi-VN")} VND
        </Text>
      </View>

      <Image source={{ uri: item.img }} style={styles.image} />
    </TouchableOpacity>
  );
}

// Styles
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#FFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.accent,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginLeft: 12,
  },

  /* Category */
  categoryWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#F3F3F3",
    marginRight: 10,
  },
  categorySelected: {
    backgroundColor: COLORS.accent,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  categoryTextSelected: {
    color: COLORS.text.primary,
    fontWeight: "700",
  },
});

export default styles;
