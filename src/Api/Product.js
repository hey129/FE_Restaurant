// ~/Api/Product/index.js
import { supabase } from "./supabase";

/**
 * Get products with optional filters and category information
 * @param {string} merchantId - Required: Merchant ID to scope products
 * @param {Object} filters - Filter options
 * @param {number} filters.id - Get single product by ID
 * @param {number|string} filters.category - Filter by category ID
 * @param {string} filters.search - Search by product name
 * @param {Object} options - Additional options
 * @param {boolean} options.includeCategory - Include category details (for Admin)
 * @returns {Promise<Array|Object>} Array of products or single product
 */
export async function getProducts(merchantId, filters = {}, options = {}) {
  if (!merchantId) throw new Error("merchantId is required");

  const { includeCategory = false } = options;

  // Select query based on whether we need category details
  const selectQuery = includeCategory
    ? `
      product_id,
      product_name,
      image,
      price,
      description,
      rating,
      status,
      category_id,
      merchant_id,
      category:category_id (
        category_id,
        name
      )
    `
    : "product_id, product_name, image, price, description, rating, category_id, merchant_id";

  let query = supabase
    .from("product")
    .select(selectQuery)
    .eq("merchant_id", merchantId)
    .order("product_id", { ascending: true });

  // Get single product by ID
  if (filters.id !== undefined && filters.id !== null) {
    query = query.eq("product_id", filters.id).single();
  }

  // Apply category filter when explicitly provided
  if (
    filters.category !== undefined &&
    filters.category !== null &&
    filters.category !== ""
  ) {
    query = query.eq("category_id", filters.category);
  }

  // Apply search filter
  const search = String(filters.search ?? "").trim();
  if (search.length > 0) {
    query = query.ilike("product_name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Get all products with category info (for Admin)
 * @param {string} merchantId - Required: Merchant ID to scope products
 * @deprecated Use getProducts(merchantId, {}, { includeCategory: true }) instead
 * @returns {Promise<Array>}
 */
export async function getAllProducts(merchantId) {
  return getProducts(merchantId, {}, { includeCategory: true });
}

/**
 * Get all products from all merchants (for Admin Dashboard)
 * @returns {Promise<Array>} Array of all products with category info
 */
export async function getAdminAllProducts() {
  const { data, error } = await supabase
    .from("product")
    .select(
      `
      product_id,
      product_name,
      price,
      image,
      description,
      rating,
      status,
      created_at,
      merchant_id,
      category_id,
      category:category_id (
        category_id,
        name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
