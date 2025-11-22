// Supabase Client for Server
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from root .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Check if Supabase credentials are configured
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

const hasSupabaseConfig = url && key && url.startsWith("http");
// Only create client if properly configured
export const supabase = hasSupabaseConfig ? createClient(url, key) : null;

export const isSupabaseConfigured = hasSupabaseConfig;
