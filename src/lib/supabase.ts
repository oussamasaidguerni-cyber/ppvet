import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://snmphndtnyhjrkfpobqf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z_Spoy0-JDGYEqHxWRcI9g_rRCEsGae'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
