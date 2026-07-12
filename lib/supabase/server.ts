import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ACTIVE_NETWORK_COOKIE, normalizeNetwork } from '@/lib/config/network'
import { supabasePublicConfig } from '@/lib/supabase/config'

export async function createClient() {
  const cookieStore = await cookies()
  const network = normalizeNetwork(cookieStore.get(ACTIVE_NETWORK_COOKIE)?.value)
  const { url, anonKey } = supabasePublicConfig(network)

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component — session refresh handled by middleware
        }
      },
    },
  })
}
