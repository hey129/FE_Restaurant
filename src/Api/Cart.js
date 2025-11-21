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

export function CartProvider({ children, merchantId }) {
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
      // Load items from ALL merchants (not filtered by merchantId)
      const { data, error } = await supabase
        .from("cart")
        .select(
          `
        cart_id,
        customer_id,
        merchant_id,
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
        ),
        merchant:merchant_id (
          merchant_id,
          merchant_name
        )
      `
        )
        .eq("customer_id", customerId)
        .eq("status", "active");

      if (!active) return;
      if (error) {
        console.error("❌ Cart load error:", error);
        setItems([]);
      } else {
        console.log("✅ Cart items loaded:", data);
        // Consolidate duplicate products by summing quantities (per merchant)
        const productMap = new Map();
        const duplicateCartIds = []; // Track cart_ids of duplicates to remove

        (data || []).forEach((d) => {
          const key = `${d.merchant_id}:${d.product_id}`; // Key includes merchant
          if (productMap.has(key)) {
            // If product already exists for this merchant, add to quantity
            const existing = productMap.get(key);
            existing.quantity = Math.min(99, existing.quantity + d.quantity);
            duplicateCartIds.push(d.cart_id); // Mark this duplicate for removal
          } else {
            // New product, add to map
            const merchantName =
              d.merchant?.merchant_name || d.merchant_name || "Restaurant";
            console.log(
              `Product: ${d.product?.product_name}, Merchant: ${merchantName}`
            );
            productMap.set(key, {
              id: d.product_id,
              merchant_id: d.merchant_id,
              merchant_name: merchantName,
              cart_id: d.cart_id, // Store cart_id for updates
              quantity: d.quantity,
              price: Number(d.price) || 0,
              added_at: d.added_at,
              name: d.product?.product_name || "Product",
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
    async (product, qty = 1, merchantId) => {
      if (!customerId) throw new Error(AUTH_REQUIRED);
      // If no merchantId provided, error
      if (!merchantId) throw new Error("NO_MERCHANT_ID");

      const normalized = {
        id: product.id, // phải là integer vì FK product_id integer
        price: Number(product.price) || 0,
        name: product.name || product.product_name || "Product",
        image: product.image || "https://placehold.co/100x100?text=No+Image",
        category: product.category ?? product.category_id ?? null,
      };

      // Tính nextQty dựa trên state hiện tại (optimistic)
      const current = items.find(
        (x) => x.id === normalized.id && x.merchant_id === merchantId
      );
      const nextQty = Math.min(99, (current?.quantity || 0) + qty);

      // Optimistic update UI
      setItems((prev) => {
        const i = prev.findIndex(
          (x) => x.id === normalized.id && x.merchant_id === merchantId
        );
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], quantity: nextQty };
          return next;
        }
        return [
          ...prev,
          {
            id: normalized.id,
            merchant_id: merchantId,
            merchant_name: "Loading...", // Will be filled from DB after insert
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
      // 1) Find all active rows for this product
      const { data: existingItems, error: selErr } = await supabase
        .from("cart")
        .select("cart_id, quantity")
        .eq("customer_id", customerId)
        .eq("merchant_id", merchantId)
        .eq("product_id", normalized.id)
        .eq("status", "active");

      if (selErr) {
        // Handle error silently or throw
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
            throw updErr;
          }
        } else {
          // Duplicate case: consolidate all into 1
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
            throw updErr;
          }

          // Delete (soft delete) remaining items
          const removeIds = existingItems.slice(1).map((item) => item.cart_id);
          if (removeIds.length > 0) {
            const { error: delErr } = await supabase
              .from("cart")
              .update({ status: "removed" })
              .in("cart_id", removeIds);

            if (delErr) {
              // Handle error silently
            }
          }
        }
      } else {
        // 2b) Insert mới
        const { error: insErr } = await supabase.from("cart").insert({
          customer_id: customerId,
          merchant_id: merchantId,
          product_id: normalized.id,
          quantity: Math.max(1, qty),
          price: normalized.price,
          status: "active",
          added_at: new Date().toISOString(),
        });
        if (insErr) {
          const { data: reload } = await supabase
            .from("cart")
            .select("product_id, quantity, price, added_at")
            .eq("customer_id", customerId)
            .eq("merchant_id", merchantId)
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

        // Fetch merchant name and update the optimistic item
        const { data: merchantData } = await supabase
          .from("merchant")
          .select("merchant_id, merchant_name")
          .eq("merchant_id", merchantId)
          .single();

        setItems((prev) =>
          prev.map((item) =>
            item.id === normalized.id &&
            item.merchant_id === merchantId &&
            item.merchant_name === "Loading..."
              ? {
                  ...item,
                  merchant_name: merchantData?.merchant_name || "Merchant",
                }
              : item
          )
        );
      }
    },
    [customerId, items]
  );

  // Tương tự sửa updateQuantity, removeFromCart (sử dụng customer_id, table 'cart')
  const updateQuantity = useCallback(
    async (productId, merchantId, qty) => {
      if (!customerId) throw new Error(AUTH_REQUIRED);
      if (!merchantId) throw new Error("NO_MERCHANT_ID");
      const clamped = Math.min(99, Math.max(1, qty));
      setItems((prev) =>
        prev.map((x) =>
          x.id === productId && x.merchant_id === merchantId
            ? { ...x, quantity: clamped }
            : x
        )
      );

      // Find all active cart items for this product in this merchant
      const { data: existingItems } = await supabase
        .from("cart")
        .select("cart_id")
        .eq("customer_id", customerId)
        .eq("merchant_id", merchantId)
        .eq("product_id", productId)
        .eq("status", "active");

      if (existingItems && existingItems.length > 0) {
        // Update first item with new quantity
        const { error: updErr } = await supabase
          .from("cart")
          .update({ quantity: clamped, added_at: new Date().toISOString() })
          .eq("cart_id", existingItems[0].cart_id);

        if (updErr) {
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
    async (productId, merchantId) => {
      if (!customerId) throw new Error(AUTH_REQUIRED);
      if (!merchantId) throw new Error("NO_MERCHANT_ID");
      setItems((prev) =>
        prev.filter(
          (x) => !(x.id === productId && x.merchant_id === merchantId)
        )
      );
      const { error } = await supabase
        .from("cart")
        .update({ status: "removed" }) // Soft delete thay vì delete thật
        .eq("customer_id", customerId)
        .eq("merchant_id", merchantId)
        .eq("product_id", productId)
        .eq("status", "active"); // Chỉ update active items
      if (error) {
        // Handle error silently
      }
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
    if (error) {
      // Handle error silently
    }
  }, [customerId]);

  // Clear cart items for specific merchants
  const clearCartForMerchants = useCallback(
    async (merchantIds) => {
      if (!customerId) throw new Error(AUTH_REQUIRED);
      if (!merchantIds || merchantIds.length === 0) return;

      setItems((prev) =>
        prev.filter((x) => !merchantIds.includes(x.merchant_id))
      );

      const { error } = await supabase
        .from("cart")
        .update({ status: "removed" })
        .eq("customer_id", customerId)
        .in("merchant_id", merchantIds)
        .eq("status", "active");

      if (error) {
        console.error("Error clearing cart:", error);
      }
    },
    [customerId]
  );

  // Cleanup function to consolidate duplicate entries in database
  const consolidateDuplicates = useCallback(async () => {
    if (!customerId) return;

    try {
      // Get all active cart items for this customer (across all merchants)
      const { data: allItems } = await supabase
        .from("cart")
        .select("cart_id, product_id, merchant_id, quantity")
        .eq("customer_id", customerId)
        .eq("status", "active")
        .order("added_at", { ascending: true }); // Keep oldest first

      if (!allItems || allItems.length === 0) return;

      // Group by (merchant_id, product_id)
      const productGroups = new Map();
      allItems.forEach((item) => {
        const key = `${item.merchant_id}:${item.product_id}`;
        if (!productGroups.has(key)) {
          productGroups.set(key, []);
        }
        productGroups.get(key).push(item);
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
    clearCartForMerchants,
    consolidateDuplicates, // Expose for manual cleanup if needed
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
