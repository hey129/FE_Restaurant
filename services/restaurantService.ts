import { supabase } from "./supabaseClient";

export type Restaurant = {
  restaurant_id: string;
  restaurant_name: string;
  address?: string;
  phone?: string;
  email?: string;
};

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from("merchant")
    .select("merchant_id, merchant_name, address, phone, email")
    .eq("status", true);
  if (error) throw error;
  const rows: any[] = data ?? [];
  return rows.map(r => ({
    restaurant_id: r.merchant_id,
    restaurant_name: r.merchant_name,
    address: r.address,
    phone: r.phone,
    email: r.email,
  }));
}

export const getRestaurantById = async (merchantId: string): Promise<Restaurant | null> => {
  const { data, error } = await supabase
    .from("merchant")
    .select("merchant_id, merchant_name, address, phone, email")
    .eq("merchant_id", merchantId)
    .single();

  if (error) {
    console.error("Error fetching merchant:", error);
    throw error;
  }

  if (!data) return null;

  return {
    restaurant_id: data.merchant_id,
    restaurant_name: data.merchant_name,
    address: data.address,
    phone: data.phone,
    email: data.email,
  };
};
