import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-anon-key";

export const isPlaceholderSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  supabaseUrl === "https://placeholder-project.supabase.co";

export const supabase = createClient(supabaseUrl, supabaseKey);

