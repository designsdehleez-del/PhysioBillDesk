import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wciqtvqxvhrcgbkopqsk.supabase.co'
  let rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  // Automatically clean up any accidental trailing text (e.g. "secret key"), quotes, or whitespace
  let cleanKey = rawKey.trim().replace(/^["']|["']$/g, '')
  if (cleanKey.includes(' ')) {
    cleanKey = cleanKey.split(' ')[0].trim()
  }

  // Ensure key is a valid token format, not a placeholder name like "SUPABASE_SERVICE_ROLE_KEY"
  const isValid = cleanKey.startsWith('sb_') || cleanKey.startsWith('eyJ')
  const finalKey = isValid ? cleanKey : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')

  return createClient<Database>(url, finalKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
