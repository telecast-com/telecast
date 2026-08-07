import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gbgepfcwhpqmbpcollzv.supabase.co";
const supabaseAnonKey = "sb_publishable_AlejCEefBGWYUf9miYtAYg_5J_N2ZDj";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
