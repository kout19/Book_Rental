import { createClient } from "@supabase/supabase-js";
import Cookies from "js-cookie";
const supabaseUrl= import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Public anon key (safe for frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey,{
  auth: {
       persistSession: false, // we manage it ourselves
    storage: {
      getItem: (key) => Cookies.getItem(key),
      setItem: (key, value) => Cookies.setItem(key, value),
      removeItem: (key) => Cookies.removeItem(key),
  },
}
});
const token= Cookies.get('token');
if (token) {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
}

export default supabase;

// import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(
//  import.meta.env.VITE_SUPABASE_URL,
//  import.meta.env.VITE_SUPABASE_ANON_KEY, // use service_role key
// );

// export default supabase;