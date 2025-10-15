// src/Api/CartContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "./supabase";
import { useAuth } from "./Auth";

export const AUTH_REQUIRED = "AUTH_REQUIRED";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const customerId = user?.customer_id || null; // Sử dụng customer_id từ profile

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!!customerId);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!customerId) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("cart") // Sử dụng table 'cart'
        .select(
          `
        cart_id,
        customer_id,
        product_id,
        quantity,
        price,          
        added_at,
        status,
        product:product_id (
          product_id,
          product_name,
          image,
          price,        
          category_id
        )
      `
        )
        .eq("customer_id", customerId)
        .eq("status", "active") // Chỉ lấy active items
        .order("added_at", { ascending: false });

      if (!active) return;
      if (error) {
        console.error("Load cart error:", error);
        setItems([]);
      } else {
        setItems(
          (data || []).map((d) => ({
            id: d.product_id, // Map product_id thành id
            quantity: d.quantity,
            price: Number(d.price) || 0,
            added_at: d.added_at,
            name: d.product?.product_name || "Sản phẩm",
            image:
              d.product?.image || "https://placehold.co/100x100?text=No+Image",
            category: d.product?.category_id ?? null,
            product_price_now: Number(d.product?.price ?? 0), // optional: nếu cần hiển thị/so sánh
          }))
        );
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [customerId]);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  );

  const addToCart = useCallback(
    async (product, qty = 1) => {
      if (!customerId) throw new Error(AUTH_REQUIRED);

      const normalized = {
        id: product.id, // phải là integer vì FK product_id integer
        price: Number(product.price) || 0,
      };

      // Tính nextQty dựa trên state hiện tại (optimistic)
      const current = items.find((x) => x.id === normalized.id);
      const nextQty = Math.min(99, (current?.quantity || 0) + qty);

      // Optimistic update UI
      setItems((prev) => {
        const i = prev.findIndex((x) => x.id === normalized.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], quantity: nextQty };
          return next;
        }
        return [
          ...prev,
          { id: normalized.id, price: normalized.price, quantity: nextQty },
        ];
      });

      // === DB: SELECT → UPDATE hoặc INSERT (không dùng upsert) ===
      // 1) Tìm dòng active hiện có
      const { data: existing, error: selErr } = await supabase
        .from("cart")
        .select("cart_id, quantity")
        .eq("customer_id", customerId)
        .eq("product_id", normalized.id)
        .eq("status", "active")
        .maybeSingle();

      if (selErr && selErr.code !== "PGRST116") {
        // PGRST116 = no rows (trong 1 số phiên bản), bỏ qua
        console.error("Select cart error:", selErr);
      }

      if (existing?.cart_id) {
        // 2a) Update cộng dồn
        const { error: updErr } = await supabase
          .from("cart")
          .update({
            quantity: Math.min(99, (existing.quantity || 0) + qty),
            added_at: new Date().toISOString(), // như 'updated_at'
          })
          .eq("cart_id", existing.cart_id);
        if (updErr) {
          console.error("Update cart error:", updErr);
          // rollback nhẹ: reload lại giỏ từ server
          const { data: reload } = await supabase
            .from("cart")
            .select("product_id, quantity, price, added_at")
            .eq("customer_id", customerId)
            .eq("status", "active");
          setItems(
            (reload || []).map((d) => ({
              id: d.product_id,
              quantity: d.quantity,
              price: Number(d.price) || 0,
              added_at: d.added_at,
            }))
          );
          throw updErr;
        }
      } else {
        // 2b) Insert mới
        const { error: insErr } = await supabase.from("cart").insert({
          customer_id: customerId,
          product_id: normalized.id,
          quantity: Math.max(1, qty),
          price: normalized.price,
          status: "active",
          added_at: new Date().toISOString(),
        });
        if (insErr) {
          console.error("Insert cart error:", insErr);
          const { data: reload } = await supabase
            .from("cart")
            .select("product_id, quantity, price, added_at")
            .eq("customer_id", customerId)
            .eq("status", "active");
          setItems(
            (reload || []).map((d) => ({
              id: d.product_id,
              quantity: d.quantity,
              price: Number(d.price) || 0,
              added_at: d.added_at,
            }))
          );
          throw insErr;
        }
      }
    },
    [customerId, items]
  );

  // Tương tự sửa updateQuantity, removeFromCart (sử dụng customer_id, table 'cart')
  const updateQuantity = useCallback(
    async (productId, qty) => {
      if (!customerId) throw new Error(AUTH_REQUIRED);
      const clamped = Math.min(99, Math.max(1, qty));
      setItems((prev) =>
        prev.map((x) => (x.id === productId ? { ...x, quantity: clamped } : x))
      );
      const { error } = await supabase
        .from("cart")
        .update({ quantity: clamped, added_at: new Date().toISOString() })
        .eq("customer_id", customerId)
        .eq("product_id", productId)
        .eq("status", "active");
      if (error) {
        console.error("updateQuantity error:", error);
        throw error;
      }
    },
    [customerId]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (!customerId) throw new Error(AUTH_REQUIRED);
      setItems((prev) => prev.filter((x) => x.id !== productId));
      const { error } = await supabase
        .from("cart")
        .update({ status: "removed" }) // Soft delete thay vì delete thật
        .eq("customer_id", customerId)
        .eq("product_id", productId)
        .eq("status", "active"); // Chỉ update active items
      if (error) console.error("removeFromCart error:", error);
    },
    [customerId]
  );

  const clearCart = useCallback(async () => {
    if (!customerId) throw new Error(AUTH_REQUIRED);
    setItems([]);
    const { error } = await supabase
      .from("cart")
      .update({ status: "removed" })
      .eq("customer_id", customerId)
      .eq("status", "active");
    if (error) console.error("clearCart error:", error);
  }, [customerId]);

  const value = {
    loading,
    items,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
