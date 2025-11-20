// src/Api/Merchant.js
import { supabase } from "./supabase";

/**
 * Get all merchants
 * @returns {Promise<Array>} Array of merchants
 */
export async function getMerchants() {
  const { data, error } = await supabase
    .from("merchant")
    .select("merchant_id, merchant_name, address, phone, email, status")
    .order("merchant_name", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get a single merchant by ID
 * @param {string} merchantId - Merchant UUID
 * @returns {Promise<Object>} Merchant details
 */
export async function getMerchantById(merchantId) {
  if (!merchantId) throw new Error("merchantId is required");

  const { data, error } = await supabase
    .from("merchant")
    .select("merchant_id, merchant_name, address, phone, email, status")
    .eq("merchant_id", merchantId)
    .single();

  if (error) throw error;
  return data;
}
