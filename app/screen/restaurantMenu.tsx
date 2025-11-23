import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  View,
} from "react-native";

import AppHeader from "../../components/header/appHeader";
import { CategoryItem, MenuListItem } from "../../components/menu/menu";
import { COLORS, PAGINATION } from "../../constants/app";
import { useFilteredItems } from "../../hooks/use-filtered-items";
import { usePagination } from "../../hooks/use-pagination";

import {
  Category,
  getMenuItemsByRestaurant,
  MenuItem,
} from "../../services/menuService";

import {
  getRestaurantById,
  Restaurant,
} from "../../services/restaurantService";

// Types
export type CategoryType = Category;

// Footer (fix Sonar)
const MenuFooter = ({ loading }: { readonly loading: boolean }) =>
  loading ? (
    <ActivityIndicator
      style={{ marginVertical: 20 }}
      size="small"
      color={COLORS.accent}
    />
  ) : null;

// Category header
const CategoryHeader = ({
  categories,
  selectedCategoryId,
  onPressCategory,
}: {
  readonly categories: CategoryType[];
  readonly selectedCategoryId: number | null;
  readonly onPressCategory: (id: number) => void;
}) => (
  <View style={styles.cardContainer}>
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={categories}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <CategoryItem
          item={item}
          selected={selectedCategoryId === item.id}
          onPress={() => onPressCategory(item.id)}
        />
      )}
    />

    <Text style={styles.sectionTitle}>Thực đơn</Text>
  </View>
);

export default function RestaurantMenu() {
  const params = useLocalSearchParams();
  const merchantId = params.merchantId as string;
  const router = useRouter();

  const [searchText, setSearchText] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [merchant, setMerchant] = useState<Restaurant | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    if (!merchantId || merchantId === "undefined") {
      setError("Không tìm thấy nhà hàng. Vui lòng chọn lại.");
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      getMenuItemsByRestaurant(merchantId),
      getRestaurantById(merchantId),
    ])
      .then(([items, m]) => {
        setMenuItems(items);
        setMerchant(m);

        const catList: CategoryType[] = Array.from(
          new Map(
            items
              .filter(
                (i) =>
                  typeof i.categoryId === "number" && !!i.categoryName
              )
              .map((i) => [
                i.categoryId,
                {
                  id: Number(i.categoryId),
                  name: String(i.categoryName),
                  img: String(i.img || ""),
                },
              ])
          ).values()
        );

        setCategories(catList);
      })
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, [merchantId]);

  // Filter + Pagination
  const filteredItems = useFilteredItems(menuItems, {
    searchText,
    categoryId: selectedCategoryId,
  });

  const { visibleItems, loadMore, loadingMore } = usePagination(filteredItems);

  const handleCategoryPress = (catId: number) => {
    setSelectedCategoryId((prev) => (prev === catId ? null : catId));
  };

  // Loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  // Error UI
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
        <Text style={styles.errorMessage}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => globalThis.location.reload()}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Avatar letters
  const initials = (merchant?.restaurant_name || "")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Main UI
  return (
    <View style={styles.screen}>
      <AppHeader
        onBack={() => router.back()}
        showRestaurantInfo
        avatarText={initials}
        restaurantName={merchant?.restaurant_name}
        restaurantAddress={merchant?.address}
      />

      <View style={styles.contentWrapper}>
        <FlatList
          ListHeaderComponent={
            <View>
              {/* Search */}
              <View style={styles.searchWrapper}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm món ăn..."
                  placeholderTextColor={COLORS.text.secondary}
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              <CategoryHeader
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onPressCategory={handleCategoryPress}
              />
            </View>
          }
          data={visibleItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MenuListItem
              item={item}
              merchantId={merchantId}
              onPress={() =>
                router.push({
                  pathname: "/screen/productDetail",
                  params: { id: item.id, merchantId },
                })
              }
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={PAGINATION.END_REACHED_THRESHOLD}
          contentContainerStyle={{ paddingBottom: 50 }}
          ListFooterComponent={<MenuFooter loading={loadingMore} />}
        />
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  contentWrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
  },

  searchWrapper: {
    marginTop: 12,
    marginHorizontal: 16,
  },

  searchInput: {
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    fontSize: 15,
    color: COLORS.text.primary,
  },

  cardContainer: {
    marginTop: 4,
    marginHorizontal: 14,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
    marginLeft: 6,
    color: COLORS.text.primary,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },

  loadingText: {
    marginTop: 10,
    color: COLORS.text.secondary,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.white,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    color: COLORS.text.primary,
  },

  errorMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  retryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
});
