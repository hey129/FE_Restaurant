import { supabase } from "./supabaseClient";

export type MenuItem = {
  id: number;      
  name: string;
  price: number;
  img: string;
  rating: number;
  description: string;
};

export type Category = { id: number; name: string; img: string };
export type BestSeller = { price: string; img: string };
export type Recommend = { price: string; rating: string; img: string };

// ------------------ API:Supabase ------------------

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("category")
    .select("category_id, name, icon_url")
    .eq("status", true)
    .order("category_id", { ascending: true });

  if (error) {
    console.error("❌ Lỗi khi lấy danh mục:", error.message);
    return [];
  }

  return (
    data?.map((c) => ({
      id: c.category_id,
      name: c.name,
      img: c.icon_url,
    })) ?? []
  );
};

export const getMenuItems = async (): Promise<MenuItem[]> => {
  const { data, error } = await supabase
    .from("product")
    .select("product_id, product_name, price, image, rating, description") 
    .eq("status", true)
    .order("product_id", { ascending: true });

  if (error) {
    console.error("Lỗi khi lấy menu:", error.message);
    return [];
  }

  return (
    data?.map((item) => ({
      id: item.product_id,       
      name: item.product_name,
      price: item.price,
      img: item.image,
      rating: item.rating,
      description: item.description,
    })) ?? []
  );
};


export const getBestSellers = async (): Promise<BestSeller[]> => {
  return [
    {
      price: "$103.0",
      img: "https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=743",
    },
    {
      price: "$50.0",
      img: "https://images.unsplash.com/photo-1564436872-f6d81182df12?auto=format&fit=crop&q=80&w=687",
    },
    {
      price: "$8.20",
      img: "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&q=80&w=687",
    },
  ];
};

export const getRecommends = async (): Promise<Recommend[]> => {
  return [
    {
      price: "$10.0",
      rating: "5.0",
      img: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=80&w=1115",
    },
    {
      price: "$25.0",
      rating: "5.0",
      img: "https://plus.unsplash.com/premium_photo-1669742928112-19364a33b530?auto=format&fit=crop&q=80&w=687",
    },
  ];
};
