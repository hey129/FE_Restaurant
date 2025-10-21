// Supabase Client for Server
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Check if Supabase credentials are configured
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

const hasSupabaseConfig = url && key && url.startsWith("http");

if (!hasSupabaseConfig) {
  console.warn("Supabase credentials not configured!");
}

// Only create client if properly configured
export const supabase = hasSupabaseConfig ? createClient(url, key) : null;

export const isSupabaseConfigured = hasSupabaseConfig;
