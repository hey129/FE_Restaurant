import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { supabase } from "../../services/supabaseClient";

export type CartItem = {
  id: string;      // product_id
  name: string;
  price: number;
  quantity: number;
  img: string;
};

type CartContextType = {
  cart: Record<string, CartItem[]>;
  addToCart: (merchantId: string, item: CartItem, qty?: number) => void;
  removeFromCart: (merchantId: string, id: string) => void;
  changeQuantity: (merchantId: string, id: string, delta: number) => void;
  clearCart: (merchantId: string) => void;
  clearAllCarts: () => void;
  getCart: (merchantId: string) => CartItem[];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ------------------------ AUTH ------------------------ */

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/* -------------------- DB OPERATIONS ------------------- */

async function saveMerchantCartToDB(
  customerId: string,
  merchantId: string,
  items: CartItem[]
) {
  await supabase
    .from("cart")
    .delete()
    .eq("customer_id", customerId)
    .eq("merchant_id", merchantId)
    .eq("status", "active");

  if (items.length === 0) return;

  const rows = items.map((i) => ({
    customer_id: customerId,
    merchant_id: merchantId,
    product_id: Number(i.id),
    quantity: i.quantity,
    price: i.price,
    status: "active",
  }));

  await supabase.from("cart").insert(rows);
}

async function clearMerchantCartDB(customerId: string, merchantId: string) {
  await supabase
    .from("cart")
    .delete()
    .eq("customer_id", customerId)
    .eq("merchant_id", merchantId);
}

async function clearAllCartsDB(customerId: string) {
  await supabase.from("cart").delete().eq("customer_id", customerId);
}

async function loadCartFromDB(): Promise<Record<string, CartItem[]>> {
  const customerId = await getCurrentUserId();
  if (!customerId) return {};

  const { data, error } = await supabase
    .from("cart")
    .select(
      `
      merchant_id,
      product_id,
      quantity,
      price,
      product:product_id (
        product_name,
        image
      )
    `
    )
    .eq("customer_id", customerId)
    .eq("status", "active");

  if (error || !data) return {};

  const map: Record<string, CartItem[]> = {};

  data.forEach((row: any) => {
    const merchantId = row.merchant_id;

    if (!map[merchantId]) map[merchantId] = [];

    map[merchantId].push({
      id: String(row.product_id),
      name: row.product?.product_name ?? "",
      img: row.product?.image ?? "",
      price: Number(row.price),
      quantity: Number(row.quantity),
    });
  });

  return map;
}

/* -------------------- PROVIDER -------------------- */

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Record<string, CartItem[]>>({});

  useEffect(() => {
    (async () => {
      const initial = await loadCartFromDB();
      setCart(initial);
    })();
  }, []);

  const getCart = (merchantId: string) => cart[merchantId] || [];

  const syncDB = (merchantId: string, items: CartItem[]) => {
    getCurrentUserId().then((uid) => {
      if (!uid) return;
      saveMerchantCartToDB(uid, merchantId, items);
    });
  };

  const addToCart = (merchantId: string, item: CartItem, qty: number = 1) => {
    setCart((prev) => {
      const current = prev[merchantId] || [];
      const exists = current.find((i) => i.id === item.id);

      const updated = exists
        ? current.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + qty }
              : i
          )
        : [...current, { ...item, quantity: qty }];

      syncDB(merchantId, updated);
      return { ...prev, [merchantId]: updated };
    });
  };

  const removeFromCart = (merchantId: string, id: string) => {
    setCart((prev) => {
      const updated = (prev[merchantId] || []).filter((i) => i.id !== id);
      syncDB(merchantId, updated);
      return { ...prev, [merchantId]: updated };
    });
  };

  const changeQuantity = (
    merchantId: string,
    id: string,
    delta: number
  ) => {
    setCart((prev) => {
      const updated = (prev[merchantId] || [])
        .map((i) =>
          i.id === id
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0);

      syncDB(merchantId, updated);
      return { ...prev, [merchantId]: updated };
    });
  };

  const clearCart = (merchantId: string) => {
    setCart((prev) => {
      const next = { ...prev, [merchantId]: [] };
      getCurrentUserId().then((uid) => {
        if (uid) clearMerchantCartDB(uid, merchantId);
      });
      return next;
    });
  };

  const clearAllCarts = () => {
    setCart({});
    getCurrentUserId().then((uid) => {
      if (uid) clearAllCartsDB(uid);
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        changeQuantity,
        clearCart,
        clearAllCarts,
        getCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
