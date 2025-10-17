import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { CategoryItem, MenuListItem } from "../../components/menu/menu";
import { COLORS, PAGINATION } from "../../constants/app";
import { useDebounce } from "../../hooks/use-debounce";
import { useFilteredItems } from "../../hooks/use-filtered-items";
import { useMenuData } from "../../hooks/use-menu-data";
import { usePagination } from "../../hooks/use-pagination";

type MenuProps = { searchText: string };

export default function Menu({ searchText }: MenuProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  const { categories, menuItems, loading, error, retry } = useMenuData();
  
  const debouncedSearch = useDebounce(searchText);
  
  const filteredItems = useFilteredItems(menuItems, {
    searchText: debouncedSearch,
    categoryId: selectedCategoryId,
  });
  
  const { visibleItems, loadMore, loadingMore } = usePagination(filteredItems);

  const handleCategoryPress = (catId: number) => {
    setSelectedCategoryId(prev => (prev === catId ? null : catId));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retry}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <CategoryItem
                  item={item}
                  selected={selectedCategoryId === item.id}
                  onPress={() => handleCategoryPress(item.id)}
                />
              )}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
            />

            <Text style={styles.sectionTitle}>Thực đơn</Text>
          </>
        }
        data={visibleItems}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <MenuListItem item={item} />}
        onEndReached={loadMore}
        onEndReachedThreshold={PAGINATION.END_REACHED_THRESHOLD}
        ListFooterComponent={() => {
          if (loadingMore) return <ActivityIndicator style={styles.loader} />;
          if (visibleItems.length >= filteredItems.length)
            return (
              <View style={styles.footerText}>
                <Text style={styles.footerTextContent}>Không còn sản phẩm</Text>
              </View>
            );
          return null;
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
    marginVertical: 12,
    color: COLORS.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
  
  loader: { marginVertical: 10 },
  footerText: { paddingVertical: 16, alignItems: "center" },
  footerTextContent: { color: COLORS.text.secondary },
  emptyContainer: { padding: 20, alignItems: "center" },
  emptyText: { color: COLORS.text.secondary },
  listContent: { paddingBottom: 30 },
});
