import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase environment variables from import.meta.env (Vite)
const url = (import.meta.env.VITE_API_URL || import.meta.env.VITE_SUPABASE_URL || '').trim();
// Custom PostgREST setups do not require a Supabase API key, but supabase-js requires a non-empty string.
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'none').trim();

// Warn in the console if URL configuration is missing, as database features will fail
if (!url) {
  console.warn('Supabase/PostgREST URL is missing. Database features will be disabled.');
}

/**
 * Centered configuration for Supabase / PostgREST connection.
 * Returns a initialized Supabase client if credentials are provided, or null otherwise.
 * 
 * @constant {SupabaseClient|null}
 */
export const supabase = url ? createClient(url, key) : null;

