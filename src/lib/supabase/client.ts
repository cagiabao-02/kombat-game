import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

let supabaseClient: SupabaseClient<any, 'public', any> | null = null;

export function getSupabaseClient(): SupabaseClient<any, 'public', any> {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        'Supabase URL or Key is missing. Check your .env.local file (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).'
      );
    }
    supabaseClient = createClient<any>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseClient;
}

export const supabase = getSupabaseClient();
