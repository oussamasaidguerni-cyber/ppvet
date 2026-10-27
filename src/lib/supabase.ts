import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a dummy client if env vars are missing or dummy
const isDummy = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('dummy') || supabaseUrl.includes('placeholder')
export const supabase = createClient(
  isDummy ? 'http://localhost:54321' : supabaseUrl, 
  isDummy ? 'dummy' : supabaseAnonKey
)
export const isSupabaseDummy = isDummy
