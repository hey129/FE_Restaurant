import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { BestSellerItem, CategoryItem, MenuListItem, RecommendItem } from "../../components/menu/menu";
import {
  BestSeller,
  Category,
  getBestSellers,
  getCategories,
  getMenuItems,
  getRecommends,
  MenuItem,
  Recommend,
} from "../../services/menuService";

type MenuProps = { searchText: string };
const PAGE_SIZE = 15;

export default function Menu({ searchText }: MenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [recommends, setRecommends] = useState<Recommend[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [visibleItems, setVisibleItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  // ------------------ Fetch data ------------------
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [cats, best, recs, menu] = await Promise.all([
          getCategories(),
          getBestSellers(),
          getRecommends(),
          getMenuItems(),
        ]);
        setCategories(cats);
        setBestSellers(best);
        setRecommends(recs);
        setMenuItems(menu);
        setFilteredItems(menu);
        setVisibleItems(menu.slice(0, PAGE_SIZE));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ------------------search------------------
  useEffect(() => {
    const timeout = setTimeout(() => {
      const filtered = searchText
        ? menuItems.filter(item =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
          )
        : menuItems;

      setFilteredItems(filtered);
      setVisibleItems(filtered.slice(0, PAGE_SIZE));
      setPage(1);
    }, 200);

    return () => clearTimeout(timeout);
  }, [searchText, menuItems]);

  // ------------------ Load ------------------
  const loadMore = () => {
    if (loadingMore) return;
    if (visibleItems.length >= filteredItems.length) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const start = page * PAGE_SIZE;
    const end = nextPage * PAGE_SIZE;

    setVisibleItems(prev => [...prev, ...filteredItems.slice(start, end)]);
    setPage(nextPage);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#F5CB58" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  const renderHorizontalSection = <T,>(
    title: string,
    data: T[],
    renderItem: ({ item }: { item: T }) => React.ReactElement | null
  ) => (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </>
  );

  return (
    <FlatList
      ListHeaderComponent={
        <>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => <CategoryItem item={item} />}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
          />

          {renderHorizontalSection("Best Seller", bestSellers, ({ item }) => <BestSellerItem item={item} />)}

          {renderHorizontalSection("Recommend", recommends, ({ item }) => <RecommendItem item={item} />)}

          <Text style={styles.sectionTitle}>Menu</Text>
        </>
      }
      data={visibleItems}
      keyExtractor={(_, i) => i.toString()}
      renderItem={({ item }) => <MenuListItem item={item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={() => {
        if (loadingMore) return <ActivityIndicator style={{ marginVertical: 10 }} />;
        if (visibleItems.length >= filteredItems.length)
          return (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <Text style={{ color: "#676767" }}>Không còn sản phẩm</Text>
            </View>
          );
        return null;
      }}
      ListEmptyComponent={() => (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: "#676767" }}>Không tìm thấy sản phẩm nào</Text>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 30 }}
    />
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 20, marginVertical: 12 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
