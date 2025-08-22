"use client"

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient

// Lazily initialize only in the browser to avoid build/prerender crashes
if (typeof window !== 'undefined') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Provide a clearer runtime error on the client
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // On the server during build/prerender, export a proxy that will throw if actually used
  // None of our calls should run on the server (they are inside useEffect), so this is safe
  supabaseClient = new Proxy({} as SupabaseClient, {
    get() {
      throw new Error('Supabase client is only available in the browser')
    }
  }) as SupabaseClient
}

export const supabase = supabaseClient