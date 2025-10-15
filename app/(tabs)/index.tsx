import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  GestureResponderEvent,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CartModal from "../../components/cart/cart";
import { COLORS, PAGINATION } from "../../constants/app";
import Menu from "../screen/menu";

// ------------------ Header Component ------------------
const HeaderComponent = React.memo(function Header({
  searchText,
  onChange,
  onOpenCart,
  onOpenAccount,
}: {
  searchText: string;
  onChange: (t: string) => void;
  onOpenCart: (e?: GestureResponderEvent) => void;
  onOpenAccount: () => void;
}) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm món ăn..."
            value={searchText}
            onChangeText={onChange}
            placeholderTextColor={COLORS.text.light}
            returnKeyType="search"
          />
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/622/622669.png" }}
            style={styles.searchIcon}
          />
        </View>

        <TouchableOpacity onPress={onOpenCart}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/34/34568.png" }}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenAccount}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png" }}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.greeting}>Thèm món gì - Đặt ngay món đó!</Text>
    </View>
  );
});

// ------------------ HomePage ------------------
export default function HomePage({ navigation }: any) {
  const [cartVisible, setCartVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const dummyData = useMemo(() => [{}], []);
  const flatListRef = useRef<FlatList>(null);

  const onChange = useCallback((t: string) => setSearchText(t), []);
  const openCart = useCallback(() => setCartVisible(true), []);
  const openAccount = useCallback(() => {
    alert("Account feature coming soon!");
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setShowScrollTop(y > PAGINATION.SCROLL_THRESHOLD);
  };

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        searchText={searchText}
        onChange={onChange}
        onOpenCart={openCart}
        onOpenAccount={openAccount}
      />

      <View style={styles.contentWrapper}>
        <FlatList
          ref={flatListRef}
          data={dummyData}
          keyExtractor={(_, i) => i.toString()}
          renderItem={() => null}
          ListFooterComponent={<Menu searchText={searchText} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
        />
      </View>

      {showScrollTop && (
        <TouchableOpacity style={styles.scrollTopBtn} activeOpacity={0.8} onPress={scrollToTop}>
          <Text style={styles.scrollTopIcon}>↑</Text>
        </TouchableOpacity>
      )}

      <CartModal visible={cartVisible} onClose={() => setCartVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },

  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
  },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0, color: COLORS.text.primary },
  searchIcon: { width: 20, height: 20, marginLeft: 8 },
  icon: { width: 28, height: 28, marginLeft: 8 },
  greeting: {
    color: "#F8F8F8",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 20,
  },

  contentWrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },

  listContent: { paddingBottom: 30 },

  scrollTopBtn: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  scrollTopIcon: { color: COLORS.white, fontSize: 22, fontWeight: "700" },
});
