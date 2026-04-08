import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase environment variables from import.meta.env (Vite)
const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Warn in the console if configuration is missing, as database features will fail
if (!url || !key) {
  console.warn('Supabase URL or Anon Key is missing. Database features will be disabled.');
}

/**
 * Centered configuration for Supabase / PostgREST connection.
 * Returns a initialized Supabase client if credentials are provided, or null otherwise.
 * 
 * @constant {SupabaseClient|null}
 */
export const supabase = url && key ? createClient(url, key) : null;
