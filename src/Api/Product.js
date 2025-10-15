// ~/Api/index.js
import { supabase } from "./supabase";

// Export với tên 'product' như bạn đang import
export async function getProducts(filters = {}) {
  let query = supabase
    .from("product")
    .select(
      "product_id, product_name, image, price,description, rating, category_id"
    )
    .order("product_id", { ascending: true });

  if (filters.id !== undefined && filters.id !== null) {
    query = query.eq("product_id", filters.id).single();
  }

  // Apply category filter when it's explicitly provided (allow 0 or string "0")
  if (
    filters.category !== undefined &&
    filters.category !== null &&
    filters.category !== ""
  ) {
    query = query.eq("category_id", filters.category);
  }

  // Apply search when a non-empty trimmed string is provided
  const search = String(filters.search ?? "").trim();
  if (search.length > 0) {
    query = query.ilike("product_name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
