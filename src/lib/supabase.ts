import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const normalizeSupabaseUrl = (url?: string) =>
  url
    ?.trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/$/, "");

const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
export const getSupabaseConfig = () =>
  supabaseUrl && supabaseAnonKey ? { supabaseUrl, supabaseAnonKey } : null;

export const createBrowserSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

export const createServerSupabase = () => {
  const key = supabaseServiceRoleKey || supabaseAnonKey;

  if (!supabaseUrl || !key) {
    return null;
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
    },
  });
};
