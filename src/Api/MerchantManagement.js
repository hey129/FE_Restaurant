// src/Api/MerchantManagement.js
/**
 * Merchant Management API
 * Provides merchant-scoped CRUD operations for managing their products, categories, and store data
 */
import { supabase } from "./supabase";

/**
 * ============================================================================
 * CATEGORY MANAGEMENT
 * ============================================================================
 */

/**
 * Get all categories for a merchant
 * @param {Object} params
 * @param {string} params.merchantId - Required: Merchant ID
 * @returns {Promise<Array>}
 */
export async function getMerchantCategories({ merchantId }) {
  if (!merchantId) throw new Error("NO_MERCHANT_ID");

  const { data, error } = await supabase
    .from("category")
    .select("category_id, name,  status, created_at, merchant_id")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new category for merchant
 * @param {Object} params
 * @param {string} params.merchantId - Merchant ID
 * @param {string} params.name - Category name
 * @returns {Promise<Object>}
 */
export async function createMerchantCategory({ merchantId, name }) {
  if (!merchantId) throw new Error("NO_MERCHANT_ID");
  if (!name) throw new Error("NO_CATEGORY_NAME");

  const { data, error } = await supabase
    .from("category")
    .insert({
      merchant_id: merchantId,
      name,
      status: true,
    })
    .select("category_id, name, status, created_at, merchant_id")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update category
 * @param {Object} params
 * @param {number} params.categoryId - Category ID
 * @param {string} [params.name] - New category name
 * @param {boolean} [params.status] - New status (true=active, false=inactive)
 * @returns {Promise<Object>}
 */
export async function updateMerchantCategory({ categoryId, name, status }) {
  if (!categoryId) throw new Error("NO_CATEGORY_ID");

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (status !== undefined) updateData.status = status;

  const { data, error } = await supabase
    .from("category")
    .update(updateData)
    .eq("category_id", categoryId)
    .select("category_id, name, status, created_at, merchant_id")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete category
 * @param {Object} params
 * @param {number} params.categoryId - Category ID to delete
 * @returns {Promise<void>}
 */
export async function deleteMerchantCategory({ categoryId }) {
  if (!categoryId) throw new Error("NO_CATEGORY_ID");

  const { error } = await supabase
    .from("category")
    .delete()
    .eq("category_id", categoryId);

  if (error) throw error;
}

/**
 * ============================================================================
 * PRODUCT MANAGEMENT
 * ============================================================================
 */

/**
 * Get all products for a merchant
 * @param {Object} params
 * @param {string} params.merchantId - Merchant ID
 * @param {number} [params.categoryId] - Optional: Filter by category
 * @param {boolean} [params.includeInactive] - Include inactive products
 * @returns {Promise<Array>}
 */
export async function getMerchantProducts({
  merchantId,
  categoryId = null,
  includeInactive = false,
}) {
  if (!merchantId) throw new Error("NO_MERCHANT_ID");

  try {
    let query = supabase
      .from("product")
      .select(
        "product_id, product_name, image, price, description, rating, category_id, merchant_id, status, created_at"
      )
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (!includeInactive) {
      query = query.eq("status", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Query error:", error);
      throw error;
    }

    console.log("✅ Query result:", {
      merchantId,
      dataCount: data?.length || 0,
    });
    return data || [];
  } catch (error) {
    console.error("❌ getMerchantProducts error:", error);
    throw error;
  }
}

/**
 * Create a new product for merchant
 * @param {Object} params
 * @param {string} params.merchantId - Merchant ID
 * @param {string} params.productName - Product name
 * @param {number} params.price - Product price
 * @param {number} params.categoryId - Category ID
 * @param {string} [params.description] - Product description
 * @param {string} [params.image] - Image URL
 * @returns {Promise<Object>}
 */
export async function createMerchantProduct({
  merchantId,
  productName,
  price,
  categoryId,
  description = null,
  image = null,
}) {
  if (!merchantId) throw new Error("NO_MERCHANT_ID");
  if (!productName) throw new Error("NO_PRODUCT_NAME");
  if (price === undefined || price === null) throw new Error("NO_PRICE");
  if (!categoryId) throw new Error("NO_CATEGORY_ID");

  try {
    console.log("🔄 Creating product:", {
      merchantId,
      productName,
      price,
      categoryId,
    });

    const { data, error } = await supabase
      .from("product")
      .insert({
        merchant_id: merchantId,
        product_name: productName,
        price: Number(price),
        category_id: Number(categoryId),
        description,
        image,
        status: true,
        rating: 0,
      })
      .select()
      .single();
    if (error) {
      console.error("❌ Insert error:", error);
      throw error;
    }

    console.log("✅ Product created:", data);
    return data;
  } catch (error) {
    console.error("❌ createMerchantProduct error:", error);
    throw error;
  }
}

/**
 * Update product
 * @param {Object} params
 * @param {number} params.productId - Product ID
 * @param {string} [params.productName] - New product name
 * @param {number} [params.price] - New price
 * @param {string} [params.description] - New description
 * @param {string} [params.image] - New image URL
 * @param {number} [params.categoryId] - New category ID
 * @param {boolean} [params.status] - New status (true=active, false=inactive)
 * @returns {Promise<Object>}
 */
export async function updateMerchantProduct({
  productId,
  productName,
  price,
  description,
  image,
  categoryId,
  status,
}) {
  if (!productId) throw new Error("NO_PRODUCT_ID");

  const updateData = {};
  if (productName !== undefined) updateData.product_name = productName;
  if (price !== undefined) updateData.price = price;
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;
  if (categoryId !== undefined) updateData.category_id = categoryId;
  if (status !== undefined) updateData.status = status;

  const { data, error } = await supabase
    .from("product")
    .update(updateData)
    .eq("product_id", productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete product (soft delete via status)
 * @param {Object} params
 * @param {number} params.productId - Product ID to delete
 * @returns {Promise<Object>}
 */
export async function deleteMerchantProduct({ productId }) {
  if (!productId) throw new Error("NO_PRODUCT_ID");

  // Soft delete by setting status to false (inactive)
  return updateMerchantProduct({ productId, status: false });
}

/**
 * Bulk update product status
 * @param {Object} params
 * @param {number[]} params.productIds - Array of product IDs
 * @param {boolean} params.status - New status (true=active, false=inactive)
 * @returns {Promise<void>}
 */
export async function updateMerchantProductsStatus({ productIds, status }) {
  if (!productIds || productIds.length === 0) throw new Error("NO_PRODUCT_IDS");
  if (!status) throw new Error("NO_STATUS");

  const { error } = await supabase
    .from("product")
    .update({ status })
    .in("product_id", productIds);

  if (error) throw error;
}

/**
 * ============================================================================
 * MERCHANT PROFILE MANAGEMENT
 * ============================================================================
 */

/**
 * Get merchant profile
 * @param {Object} params
 * @param {string} params.merchantId - Merchant ID
 * @returns {Promise<Object>}
 */
export async function getMerchantProfile({ merchantId }) {
  if (!merchantId) throw new Error("NO_MERCHANT_ID");

  const { data, error } = await supabase
    .from("merchant")
    .select("merchant_id, merchant_name, address, phone, email, status")
    .eq("merchant_id", merchantId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update merchant profile
 * @param {Object} params
 * @param {string} params.merchantId - Merchant ID
 * @param {string} [params.merchantName] - New merchant name
 * @param {string} [params.address] - New address
 * @param {string} [params.phone] - New phone
 * @returns {Promise<Object>}
 */
export async function updateMerchantProfile({
  merchantId,
  merchantName,
  address,
  phone,
}) {
  if (!merchantId) throw new Error("NO_MERCHANT_ID");

  const updateData = {};
  if (merchantName !== undefined) updateData.merchant_name = merchantName;
  if (address !== undefined) updateData.address = address;
  if (phone !== undefined) updateData.phone = phone;

  const { data, error } = await supabase
    .from("merchant")
    .update(updateData)
    .eq("merchant_id", merchantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * ============================================================================
 * MERCHANT ANALYTICS
 * ============================================================================
 */

/**
 * Get merchant sales statistics
 * @param {Object} params
 * @param {string} params.merchantId - Merchant ID
 * @returns {Promise<Object>}
 */
export async function getMerchantStats({ merchantId }) {
  if (!merchantId) throw new Error("NO_MERCHANT_ID");

  // Get all orders for this merchant
  const { data: allOrders, error: ordersErr } = await supabase
    .from("orders")
    .select("order_id, total_amount, order_status, payment_status, order_date")
    .eq("merchant_id", merchantId);

  if (ordersErr) throw ordersErr;

  // Calculate stats
  const stats = {
    totalOrders: allOrders?.length || 0,
    totalRevenue: (allOrders || []).reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0
    ),
    PendingOrders: (allOrders || []).filter((o) => o.order_status === "Pending")
      .length,
    CompleteddOrders: (allOrders || []).filter(
      (o) => o.order_status === "Completedd"
    ).length,
    CancelledOrders: (allOrders || []).filter(
      (o) => o.order_status === "Cancelled"
    ).length,
    PaidOrders: (allOrders || []).filter((o) => o.payment_status === "Paid")
      .length,
    refundedOrders: (allOrders || []).filter(
      (o) => o.payment_status === "refunded"
    ).length,
  };

  // Get product count
  const { count: productCount, error: productErr } = await supabase
    .from("product")
    .select("*", { count: "exact", head: true })
    .eq("merchant_id", merchantId)
    .eq("status", true);

  if (productErr) throw productErr;

  stats.activeProducts = productCount || 0;

  return stats;
}

/**
 * Get top performing products for a merchant
 * @param {Object} params
 * @param {string} params.merchantId - Merchant ID
 * @param {number} [params.limit] - Number of products to return (default: 10)
 * @returns {Promise<Array>}
 */
export async function getMerchantTopProducts({ merchantId, limit = 10 } = {}) {
  if (!merchantId) throw new Error("NO_MERCHANT_ID");

  // Get order items grouped by product
  const { data: allOrderItems, error: itemsErr } = await supabase.from(
    "order_detail"
  ).select(`
      product_id,
      quantity,
      price,
      order:orders(merchant_id)
    `);

  if (itemsErr) throw itemsErr;

  // Filter for this merchant and aggregate
  const merchantItems = (allOrderItems || []).filter(
    (item) => item.order?.merchant_id === merchantId
  );

  const productAggregates = {};
  merchantItems.forEach((item) => {
    if (!productAggregates[item.product_id]) {
      productAggregates[item.product_id] = {
        product_id: item.product_id,
        totalQuantity: 0,
        totalRevenue: 0,
      };
    }
    productAggregates[item.product_id].totalQuantity += item.quantity;
    productAggregates[item.product_id].totalRevenue +=
      item.quantity * item.price;
  });

  // Sort by revenue and get top N
  const topProducts = Object.values(productAggregates)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);

  // Enrich with product details
  const productIds = topProducts.map((p) => p.product_id);
  if (productIds.length === 0) return [];

  const { data: products, error: productsErr } = await supabase
    .from("product")
    .select("product_id, product_name, image, price")
    .in("product_id", productIds);

  if (productsErr) throw productsErr;

  // Combine
  const productMap = {};
  (products || []).forEach((p) => {
    productMap[p.product_id] = p;
  });

  return topProducts.map((p) => ({
    ...productMap[p.product_id],
    ...p,
  }));
}
