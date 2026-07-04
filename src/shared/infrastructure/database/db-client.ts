import {createClient, type SupabaseClient} from '@supabase/supabase-js';

/**
 * Supabase database client singleton.
 *
 * Uses environment variables for configuration:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * For server-side operations, use service_role key (not exposed to client).
 */
let supabaseClient: SupabaseClient | undefined = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || (!anonKey && !serviceRoleKey)) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseClient = createClient(url, serviceRoleKey || anonKey);
  return supabaseClient;
}

/**
 * Reset the client (useful for testing).
 */
export function resetSupabaseClient(): void {
  supabaseClient = null;
}
