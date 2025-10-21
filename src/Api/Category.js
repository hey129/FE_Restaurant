// src/api/products.js
import { supabase } from "./supabase";

/**
 * Get categories from database with optional filters
 * @param {Object} options - Configuration options
 * @param {boolean} options.includeStatus - Include status and timestamps (for Admin)
 * @param {string} options.orderBy - Field to order by (default: no ordering)
 * @returns {Promise<Array>} Array of categories
 */
export async function getCategories({
  includeStatus = false,
  orderBy = null,
} = {}) {
  let query = supabase.from("category");

  // Select fields based on whether we need full details
  if (includeStatus) {
    query = query.select("category_id, name, icon_url, status, created_at");
  } else {
    query = query.select("*");
  }

  // Apply ordering if specified
  if (orderBy) {
    query = query.order(orderBy, { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Lỗi khi lấy danh sách category:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all categories with full info (for Admin)
 * @deprecated Use getCategories({ includeStatus: true, orderBy: 'category_id' }) instead
 * @returns {Promise<Array>}
 */
export async function getAllCategories() {
  return getCategories({ includeStatus: true, orderBy: "category_id" });
}
