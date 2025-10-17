// Supabase Client for Server
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Check if Supabase credentials are configured
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

const hasSupabaseConfig =
  url &&
  key &&
  url.startsWith("http") &&
  url !== "your_supabase_url_here" &&
  key !== "your_supabase_anon_key_here";

if (!hasSupabaseConfig) {
  console.warn("⚠️  ═══════════════════════════════════════════════════════");
  console.warn("⚠️  Supabase credentials not configured!");
  console.warn("⚠️  Please update server/.env with your Supabase credentials:");
  console.warn("⚠️  - SUPABASE_URL");
  console.warn("⚠️  - SUPABASE_ANON_KEY");
  console.warn("⚠️  Database operations will be skipped.");
  console.warn("⚠️  ═══════════════════════════════════════════════════════");
}

// Only create client if properly configured
export const supabase = hasSupabaseConfig ? createClient(url, key) : null;

export const isSupabaseConfigured = hasSupabaseConfig;
