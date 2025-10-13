// src/api/products.js
import { supabase } from "./supabase";

/**
 * Lấy tất cả sản phẩm từ database
 * @returns {Promise<Array>} Mảng các sản phẩm
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from("category") // Tên bảng
    .select("*"); // Lấy tất cả các cột

  if (error) {
    console.error("Lỗi khi lấy danh sách catagory:", error);
    // Trả về một mảng rỗng nếu có lỗi để tránh làm sập ứng dụng
    return [];
  }

  return data;
}
