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
        // Consolidate duplicate products by summing quantities
        const productMap = new Map();
        const duplicateCartIds = []; // Track cart_ids of duplicates to remove

        (data || []).forEach((d) => {
          const productId = d.product_id;
          if (productMap.has(productId)) {
            // If product already exists, add to quantity and mark for removal
            const existing = productMap.get(productId);
            existing.quantity = Math.min(99, existing.quantity + d.quantity);
            duplicateCartIds.push(d.cart_id); // Mark this duplicate for removal
          } else {
            // New product, add to map
            productMap.set(productId, {
              id: productId,
              cart_id: d.cart_id, // Store cart_id for updates
              quantity: d.quantity,
              price: Number(d.price) || 0,
              added_at: d.added_at,
              name: d.product?.product_name || "Sản phẩm",
              image:
                d.product?.image ||
                "https://placehold.co/100x100?text=No+Image",
              category: d.product?.category_id ?? null,
              product_price_now: Number(d.product?.price ?? 0),
            });
          }
        });

        // If we found duplicates, clean them up in the database
        if (duplicateCartIds.length > 0) {
          const consolidatedItems = Array.from(productMap.values());

          // Update quantities for kept items
          for (const item of consolidatedItems) {
            await supabase
              .from("cart")
              .update({
                quantity: item.quantity,
                added_at: new Date().toISOString(),
              })
              .eq("cart_id", item.cart_id);
          }

          // Soft delete duplicate items
          await supabase
            .from("cart")
            .update({ status: "removed" })
            .in("cart_id", duplicateCartIds);

          console.log(
            `Consolidated ${duplicateCartIds.length} duplicate cart items`
          );
        }

        setItems(Array.from(productMap.values()));
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
        name: product.name || product.product_name || "Sản phẩm",
        image: product.image || "https://placehold.co/100x100?text=No+Image",
        category: product.category ?? product.category_id ?? null,
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
          {
            id: normalized.id,
            price: normalized.price,
            quantity: nextQty,
            name: normalized.name,
            image: normalized.image,
            category: normalized.category,
            product_price_now: normalized.price,
            added_at: new Date().toISOString(),
          },
        ];
      });

      // === DB: SELECT → UPDATE hoặc INSERT (không dùng upsert) ===
      // 1) Tìm tất cả dòng active hiện có cho product này
      const { data: existingItems, error: selErr } = await supabase
        .from("cart")
        .select("cart_id, quantity")
        .eq("customer_id", customerId)
        .eq("product_id", normalized.id)
        .eq("status", "active");

      if (selErr) {
        console.error("Select cart error:", selErr);
      }

      if (existingItems && existingItems.length > 0) {
        // 2a) Có item(s) tồn tại
        if (existingItems.length === 1) {
          // Trường hợp bình thường: chỉ có 1 item, update nó
          const existing = existingItems[0];
          const { error: updErr } = await supabase
            .from("cart")
            .update({
              quantity: Math.min(99, (existing.quantity || 0) + qty),
              added_at: new Date().toISOString(),
            })
            .eq("cart_id", existing.cart_id);
          if (updErr) {
            console.error("Update cart error:", updErr);
            throw updErr;
          }
        } else {
          // Trường hợp có duplicate: consolidate tất cả thành 1
          const totalQty = existingItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const newQty = Math.min(99, totalQty + qty);

          // Giữ lại item đầu tiên, update quantity
          const keepItem = existingItems[0];
          const { error: updErr } = await supabase
            .from("cart")
            .update({
              quantity: newQty,
              added_at: new Date().toISOString(),
            })
            .eq("cart_id", keepItem.cart_id);

          if (updErr) {
            console.error("Update cart error:", updErr);
            throw updErr;
          }

          // Xóa (soft delete) các items còn lại
          const removeIds = existingItems.slice(1).map((item) => item.cart_id);
          if (removeIds.length > 0) {
            const { error: delErr } = await supabase
              .from("cart")
              .update({ status: "removed" })
              .in("cart_id", removeIds);

            if (delErr) {
              console.error("Remove duplicate cart items error:", delErr);
            }
          }
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

      // Find all active cart items for this product
      const { data: existingItems } = await supabase
        .from("cart")
        .select("cart_id")
        .eq("customer_id", customerId)
        .eq("product_id", productId)
        .eq("status", "active");

      if (existingItems && existingItems.length > 0) {
        // Update first item with new quantity
        const { error: updErr } = await supabase
          .from("cart")
          .update({ quantity: clamped, added_at: new Date().toISOString() })
          .eq("cart_id", existingItems[0].cart_id);

        if (updErr) {
          console.error("updateQuantity error:", updErr);
          throw updErr;
        }

        // Remove any duplicates
        if (existingItems.length > 1) {
          const removeIds = existingItems.slice(1).map((item) => item.cart_id);
          await supabase
            .from("cart")
            .update({ status: "removed" })
            .in("cart_id", removeIds);
        }
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

  // Cleanup function to consolidate duplicate entries in database
  const consolidateDuplicates = useCallback(async () => {
    if (!customerId) return;

    try {
      // Get all active cart items
      const { data: allItems } = await supabase
        .from("cart")
        .select("cart_id, product_id, quantity")
        .eq("customer_id", customerId)
        .eq("status", "active")
        .order("added_at", { ascending: true }); // Keep oldest first

      if (!allItems || allItems.length === 0) return;

      // Group by product_id
      const productGroups = new Map();
      allItems.forEach((item) => {
        if (!productGroups.has(item.product_id)) {
          productGroups.set(item.product_id, []);
        }
        productGroups.get(item.product_id).push(item);
      });

      // Process each group
      for (const [, items] of productGroups) {
        if (items.length > 1) {
          // Has duplicates
          const totalQty = Math.min(
            99,
            items.reduce((sum, item) => sum + item.quantity, 0)
          );
          const keepItem = items[0]; // Keep first (oldest) item
          const removeItems = items.slice(1);

          // Update the kept item with consolidated quantity
          await supabase
            .from("cart")
            .update({
              quantity: totalQty,
              added_at: new Date().toISOString(),
            })
            .eq("cart_id", keepItem.cart_id);

          // Soft delete duplicates
          const removeIds = removeItems.map((item) => item.cart_id);
          await supabase
            .from("cart")
            .update({ status: "removed" })
            .in("cart_id", removeIds);
        }
      }

      console.log("Cart duplicates consolidated successfully");
    } catch (error) {
      console.error("Error consolidating duplicates:", error);
    }
  }, [customerId]);

  const value = {
    loading,
    items,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    consolidateDuplicates, // Expose for manual cleanup if needed
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
