import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  GestureResponderEvent,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CartModal from "../../components/cart/cart";
import Menu from "../screen/menu";

// ------------------ Header Component ------------------
const HeaderComponent = React.memo(function Header({
  searchText,
  onChange,
  onOpenCart,
}: {
  searchText: string;
  onChange: (t: string) => void;
  onOpenCart: (e?: GestureResponderEvent) => void;
}) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn muốn ăn gì hôm nay?"
            value={searchText}
            onChangeText={onChange}
            placeholderTextColor="#999"
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

        <TouchableOpacity onPress={() => alert("Account pressed!")}>
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

  const dummyData = useMemo(() => [{}], []);

  const onChange = useCallback((t: string) => setSearchText(t), []);
  const openCart = useCallback(() => setCartVisible(true), []);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent searchText={searchText} onChange={onChange} onOpenCart={openCart} />

      <View style={styles.contentWrapper}>
        <FlatList
          data={dummyData}
          keyExtractor={(_, i) => i.toString()}
          renderItem={() => null}
          ListFooterComponent={<Menu searchText={searchText} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </View>

      <CartModal visible={cartVisible} onClose={() => setCartVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5CB58" },

  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#F5CB58",
  },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
});
