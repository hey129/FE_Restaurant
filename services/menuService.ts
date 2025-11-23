import { supabase } from "./supabaseClient";

export type Category = {
  id: number;
  name: string;
  img: string;
};

export type MenuItem = {
  id: number;
  name: string;
  price: number;
  img: string;
  rating: number;
  description: string;
  categoryId?: number;
  categoryName?: string;
  merchantName?: string;
};

const fetchFromSupabase = async <T,>(
  table: string,
  selectQuery: string
): Promise<T[]> => {
  const { data, error } = await supabase.from(table).select(selectQuery).eq("status", true);

  if (error) {
    console.error(`Error fetching from ${table}:`, error);
    throw error;
  }

  if (!data) {
    throw new Error(`No data returned from ${table}`);
  }

  return data as T[];
};

export const getCategories = async (): Promise<Category[]> => {
  const data = await fetchFromSupabase<any>(
    "category",
    "category_id, name, icon_url"
  );

  return data.map((item) => ({
    id: item.category_id,
    name: item.name,
    img: item.icon_url,
  }));
};

export const getMenuItems = async (): Promise<MenuItem[]> => {
  const data = await fetchFromSupabase<any>(
    "product",
    "product_id, product_name, price, image, rating, description, category_id"
  );

  return data.map((item) => ({
    id: item.product_id,
    name: item.product_name,
    price: item.price,
    img: item.image,
    rating: item.rating,
    description: item.description,
    categoryId: item.category_id,
  }));
};

export const getMenuItemsByRestaurant = async (merchantId: string): Promise<MenuItem[]> => {
  // Query product table and include related category and merchant fields
  const { data, error } = await supabase
    .from("product")
    .select(
      `product_id, product_name, price, image, rating, description, category_id, category(name), merchant(merchant_name)`
    )
    .eq("merchant_id", merchantId)
    .eq("status", true)
    .order("product_name", { ascending: true });

  if (error) {
    console.error("Error fetching menu items for merchant:", error);
    throw error;
  }

  if (!data) return [];

  return (data as any[]).map(item => ({
    id: item.product_id,
    name: item.product_name,
    price: Number(item.price) || 0,
    img: item.image,
    rating: item.rating,
    description: item.description,
    categoryId: item.category_id,
    categoryName: item.category?.name ?? null,
    merchantName: item.merchant?.merchant_name ?? null,
  }));
};
