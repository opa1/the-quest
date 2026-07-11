import { createBrowserClient } from '@supabase/ssr'
import {
  ACTIVE_NETWORK_COOKIE,
  DEFAULT_NETWORK,
  normalizeNetwork,
  type Network,
} from '@/lib/config/network'
import { supabasePublicConfig } from '@/lib/supabase/config'

function activeNetworkFromDocument(): Network {
  if (typeof document === 'undefined') return DEFAULT_NETWORK
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${ACTIVE_NETWORK_COOKIE}=([^;]+)`)
  )
  return normalizeNetwork(match?.[1])
}

export function createClient() {
  const { url, anonKey } = supabasePublicConfig(activeNetworkFromDocument())
  return createBrowserClient(url, anonKey)
}
