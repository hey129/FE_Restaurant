import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/app";
import { supabase } from "../../services/supabaseClient";

/* ========================================================= */
/* TYPES */
/* ========================================================= */

export interface Merchant {
  merchant_id: string;
  merchant_name: string;
  address: string | null;
}

interface HomeProps {
  readonly searchText?: string;
}

/* ========================================================= */
/* SMALL COMPONENTS (để tránh S6478) */
/* ========================================================= */

function RenderMerchant({
  readonlyItem,
  readonlyOnPress,
}: {
  readonly readonlyItem: Merchant;
  readonly readonlyOnPress: (id: string) => void;
}) {
  const initials = readonlyItem.merchant_name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => readonlyOnPress(readonlyItem.merchant_id)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.merchantName}>{readonlyItem.merchant_name}</Text>
        <Text style={styles.merchantAddress}>
          {readonlyItem.address || "Chưa có địa chỉ"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function EmptyList() {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyText}>Không có nhà hàng nào.</Text>
    </View>
  );
}

/* ========================================================= */
/* MAIN COMPONENT */
/* ========================================================= */

export default function Home({ searchText }: HomeProps) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const router = useRouter();

  /* LOAD MERCHANTS */
  useEffect(() => {
    let mounted = true;

    const fetchMerchants = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("merchant")
          .select("merchant_id, merchant_name, address")
          .eq("status", true)
          .order("merchant_name", { ascending: true });

        if (error) throw error;
        if (!mounted) return;

        setMerchants((data as Merchant[]) || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMerchants();
    return () => {
      mounted = false;
    };
  }, []);

  /* LOADING */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Đang tải danh sách nhà hàng...</Text>
      </View>
    );
  }

  /* ERROR */
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Không thể tải danh sách</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  /* FILTER BY SEARCH */
  const filtered = searchText
    ? merchants.filter((m) =>
        m.merchant_name.toLowerCase().includes(searchText.toLowerCase())
      )
    : merchants;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhà hàng</Text>

      <FlatList
        data={filtered}
        keyExtractor={(m) => m.merchant_id}
        renderItem={({ item }) => (
          <RenderMerchant
            readonlyItem={item}
            readonlyOnPress={(id) =>
              router.push({
                pathname: "/screen/restaurantMenu",
                params: { merchantId: id },
              })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={EmptyList}
      />
    </View>
  );
}

/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    margin: 20,
    color: COLORS.text.primary,
  },

  /* CARD */
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: COLORS.white, fontSize: 20, fontWeight: "800" },
  cardContent: { flex: 1 },
  merchantName: { fontSize: 16, fontWeight: "700", color: COLORS.text.primary },
  merchantAddress: { color: COLORS.text.secondary, fontSize: 13 },
  separator: { height: 12 },

  emptyText: { color: COLORS.text.secondary },
  loadingText: { marginTop: 12, fontSize: 16, color: COLORS.text.secondary },

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
  },

  listContent: { paddingBottom: 30 },
});
