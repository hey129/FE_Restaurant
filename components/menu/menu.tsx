import React from "react";
import { View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Category, BestSeller, Recommend, MenuItem } from "../../services/menuService";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const CATEGORY_SIZE = 60;

export const CategoryItem = ({ item }: { item: Category }) => (
  <View style={styles.categoryItem}>
    <View style={styles.categoryImageWrapper}>
      <Image source={{ uri: item.img }} style={styles.categoryImage} />
    </View>
    <Text style={styles.categoryText}>{item.name}</Text>
  </View>
);

export const BestSellerItem = ({ item }: { item: BestSeller }) => {
  const cardWidth = width * 0.35;
  const cardHeight = cardWidth * 0.75;
  return (
    <View style={styles.cardWrapper}>
      <Image source={{ uri: item.img }} style={{ width: cardWidth, height: cardHeight, borderRadius: 15 }} />
      <View style={styles.priceTag}>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
    </View>
  );
};

export const RecommendItem = ({ item }: { item: Recommend }) => {
  const cardWidth = width * 0.4;
  return (
    <View style={styles.cardWrapper}>
      <ImageBackground
        source={{ uri: item.img }}
        style={{ width: cardWidth, height: cardWidth }}
        imageStyle={{ borderRadius: 20 }}
      >
        <View style={[styles.ratingBox, { position: "absolute", top: 8, left: 8 }]}>
          <Text style={styles.ratingText}>⭐ 5</Text>
        </View>
      </ImageBackground>
      <View style={styles.priceTag}>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
    </View>
  );
};

// MenuItem
export const MenuListItem = ({ item }: { item: MenuItem }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/screen/productDetail", params: { id: String(item.id) } })}
      style={styles.menuItemWrapper}
    >
      <Image source={{ uri: item.img }} style={styles.menuItemImage} resizeMode="cover" />
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <View style={styles.infoRow}>
          <View style={styles.ratingListItem}>
            <Text style={styles.ratingTextWhite}>⭐ {item.rating ?? "4.5"}</Text>
          </View>
          <Text style={styles.menuItemPrice}>{item.price}</Text>
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
  categoryImage: { width: CATEGORY_SIZE, height: CATEGORY_SIZE, borderRadius: CATEGORY_SIZE / 2, resizeMode: "cover" },
  categoryText: { color: "#391713", fontSize: 12, marginTop: 6, textAlign: "center" },

  cardWrapper: { marginRight: 12, position: "relative" },
  priceTag: { position: "absolute", bottom: 8, right: -2, backgroundColor: "#E95322", borderTopLeftRadius: 30, borderBottomLeftRadius: 30, paddingHorizontal: 6, paddingVertical: 2 },
  priceText: { color: "#fff", fontSize: 14 },
  ratingBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 },
  ratingText: { fontSize: 14, marginRight: 4, color: "#391713" },
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

