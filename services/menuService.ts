import { SUPABASE_TABLES } from "../constants/endpoints";
import { supabase } from "./supabaseClient";

export type Category = {
  id: number;
  name: string;
  img: string;
};

export type BestSeller = {
  id: number;
  name: string;
  price: number;
  img: string;
  rating: number;
};

export type Recommend = {
  id: number;
  name: string;
  price: number;
  img: string;
  rating: number;
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

export const getBestSellers = async (): Promise<BestSeller[]> => {
  return [
    {
      id: 1,
      name: "Burger Deluxe",
      price: 103.0,
      img: "https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=743",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Pizza Special",
      price: 50.0,
      img: "https://images.unsplash.com/photo-1564436872-f6d81182df12?auto=format&fit=crop&q=80&w=687",
      rating: 4.9,
    },
    {
      id: 3,
      name: "Salad Fresh",
      price: 8.2,
      img: "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&q=80&w=687",
      rating: 4.7,
    },
  ];
};

export const getRecommends = async (): Promise<Recommend[]> => {
  return [
    {
      id: 1,
      name: "Pasta Carbonara",
      price: 10.0,
      rating: 5.0,
      img: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=80&w=1115",
    },
    {
      id: 2,
      name: "Grilled Chicken",
      price: 25.0,
      rating: 5.0,
      img: "https://plus.unsplash.com/premium_photo-1669742928112-19364a33b530?auto=format&fit=crop&q=80&w=687",
    },
  ];
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
