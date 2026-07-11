import { type Network } from "@/lib/config/network"

// Per-network Supabase connection config (URL + publishable/anon key).
//
// NEXT_PUBLIC_* vars are only inlined into the client bundle when referenced
// statically, so each one is named explicitly here rather than built up
// dynamically. Falls back to the legacy single-project vars so nothing breaks
// until the mainnet project's env is provisioned.

const URLS: Record<Network, string | undefined> = {
  Mainnet: process.env.NEXT_PUBLIC_SUPABASE_URL_MAINNET,
  Preprod: process.env.NEXT_PUBLIC_SUPABASE_URL_TESTNET,
}

const ANON_KEYS: Record<Network, string | undefined> = {
  Mainnet: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_MAINNET,
  Preprod: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_TESTNET,
}

export function supabasePublicConfig(network: Network): {
  url: string
  anonKey: string
} {
  const url = URLS[network] ?? process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey =
    ANON_KEYS[network] ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  return { url, anonKey }
}
