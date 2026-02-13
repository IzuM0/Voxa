/**
 * Shared Supabase client instance
 * This ensures only one Supabase client is created per browser context,
 * preventing the "Multiple GoTrueClient instances detected" warning.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get the shared Supabase client instance
 * Creates the instance on first call if it doesn't exist
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase configuration is required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Recommended for OAuth flows
    },
  });

  return supabaseInstance;
}

/**
 * Get the Supabase client instance if configured, otherwise return null
 * Useful for optional Supabase usage
 */
export function getSupabaseClientOrNull(): SupabaseClient | null {
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
}
