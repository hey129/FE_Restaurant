// src/api/products.js
import { supabase } from "./supabase";

/**
 * Get categories from database with optional filters
 * @param {string} merchantId - Required: Merchant ID to scope categories
 * @param {Object} options - Configuration options
 * @param {boolean} options.includeStatus - Include status and timestamps (for Admin)
 * @param {string} options.orderBy - Field to order by (default: no ordering)
 * @returns {Promise<Array>} Array of categories
 */
export async function getCategories(merchantId, {
  includeStatus = false,
  orderBy = null,
} = {}) {
  if (!merchantId) throw new Error("merchantId is required");
  
  let query = supabase.from("category");

  // Select fields based on whether we need full details
  if (includeStatus) {
    query = query.select("category_id, name, icon_url, status, created_at, merchant_id");
  } else {
    query = query.select("*");
  }

  // Filter by merchant
  query = query.eq("merchant_id", merchantId);

  // Apply ordering if specified
  if (orderBy) {
    query = query.order(orderBy, { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all categories with full info (for Admin)
 * @param {string} merchantId - Required: Merchant ID to scope categories
 * @deprecated Use getCategories(merchantId, { includeStatus: true, orderBy: 'category_id' }) instead
 * @returns {Promise<Array>}
 */
export async function getAllCategories(merchantId) {
  return getCategories(merchantId, { includeStatus: true, orderBy: "category_id" });
}
