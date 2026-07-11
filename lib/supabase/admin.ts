import { createClient } from '@supabase/supabase-js'
import { DEFAULT_NETWORK, type Network } from '@/lib/config/network'
import { supabasePublicConfig } from '@/lib/supabase/config'

// Server-only: the secret (service-role) key must never reach the client.
const SECRET_KEYS: Record<Network, string | undefined> = {
  Mainnet: process.env.SUPABASE_SECRET_KEY_MAINNET,
  Preprod: process.env.SUPABASE_SECRET_KEY_TESTNET,
}

// Pass an explicit network to reach a specific project (e.g. reading the
// testnet DB during a migration while acting on mainnet). Defaults to the
// front-door network; falls back to the legacy single-project secret.
export function createAdminClient(network: Network = DEFAULT_NETWORK) {
  const { url } = supabasePublicConfig(network)
  const secret = SECRET_KEYS[network] ?? process.env.SUPABASE_SECRET_KEY!
  return createClient(url, secret)
}
