import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://isewpmysxqbrcrnvvxdf.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZXdwbXlzeHFicmNybnZ2eGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTI0ODEsImV4cCI6MjA3NTg4ODQ4MX0.oRhuoaAMYiNgt27rcuuJRUIoYHbaV8xWwzN-3b1K3e8"; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
