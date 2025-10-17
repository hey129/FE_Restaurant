import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Category, MenuItem } from "../../services/menuService";

const CATEGORY_SIZE = 60;

export const CategoryItem = ({
  item,
  selected = false,
  onPress,
}: {
  item: Category;
  selected?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.categoryItem} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.categoryImageWrapper, selected ? styles.categoryImageWrapperSelected : undefined]}>
      <Image source={{ uri: item.img }} style={styles.categoryImage} />
    </View>
    <Text style={[styles.categoryText, selected ? styles.categoryTextSelected : undefined]}>{item.name}</Text>
  </TouchableOpacity>
);

// MenuItem
export const MenuListItem = ({ item }: { item: MenuItem }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/screen/productDetail", params: { id: String(item.id) } })}
      style={styles.menuItemWrapper}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.img }} style={styles.menuItemImage} resizeMode="cover" />
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <View style={styles.infoRow}>
          <View style={styles.ratingListItem}>
            <Text style={styles.ratingTextWhite}>⭐ {item.rating?.toFixed(1) ?? "4.5"}</Text>
          </View>
          <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.menuItemDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryItem: { alignItems: "center", marginRight: 16 },
  categoryImageWrapper: { backgroundColor: "#F3E9B5", borderRadius: CATEGORY_SIZE / 2, padding: 12 },
  categoryImageWrapperSelected: { backgroundColor: "#E95322" }, 
  categoryImage: { width: CATEGORY_SIZE, height: CATEGORY_SIZE, borderRadius: CATEGORY_SIZE / 2, resizeMode: "cover" },
  categoryText: { color: "#391713", fontSize: 12, marginTop: 6, textAlign: "center" },
  categoryTextSelected: { color: "#fff" }, 

  ratingTextWhite: { fontSize: 14, color: "#fff", fontWeight: "700" },
  ratingListItem: { backgroundColor: "#E95322", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },

  menuItemWrapper: { flexDirection: "row", marginBottom: 16, marginHorizontal: 20, backgroundColor: "#FFF", borderRadius: 15, overflow: "hidden", elevation: 2, height: 110 },
  menuItemImage: { width: 100, height: "100%" },
  menuItemContent: { flex: 1, padding: 12, justifyContent: "center" },
  menuItemName: { fontSize: 16, color: "#391713", fontWeight: "bold", marginBottom: 6 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  menuItemPrice: { fontSize: 14, color: "#E95322", fontWeight: "bold" },
  menuItemDescription: { fontSize: 12, color: "#676767", lineHeight: 16 },
});

