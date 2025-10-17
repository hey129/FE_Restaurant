import { SUPABASE_TABLES } from "../constants/endpoints";
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

// API functions
export const getCategories = async (): Promise<Category[]> => {
  const data = await fetchFromSupabase<any>(
    SUPABASE_TABLES.CATEGORIES,
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
    SUPABASE_TABLES.PRODUCTS,
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
