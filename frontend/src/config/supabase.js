import { createClient } from "@supabase/supabase-js";

// Public anon key (safe for frontend)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
