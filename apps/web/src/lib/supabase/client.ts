import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:9999',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      }
    )
  }
  return supabaseClient
}
