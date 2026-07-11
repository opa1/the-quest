// The active network is a per-request cookie, not a build-time constant, so a
// single deployment can serve mainnet (default) and testnet from two separate
// Supabase projects. Keep this module free of `next/headers` etc. so it is safe
// to import from both server and client code.

export type Network = "Mainnet" | "Preprod"

export const ACTIVE_NETWORK_COOKIE = "active_network"

// The single knob for the app's front-door network. Cutover to mainnet is then
// just `NEXT_PUBLIC_DEFAULT_NETWORK=Mainnet` — no code change. Per-user requests
// can still be on the other network via the active_network cookie; this only
// sets the default when no cookie is present. Defaults to testnet.
export const DEFAULT_NETWORK: Network =
  process.env.NEXT_PUBLIC_DEFAULT_NETWORK === "Mainnet" ? "Mainnet" : "Preprod"

export function normalizeNetwork(value: string | null | undefined): Network {
  if (value === "Mainnet") return "Mainnet"
  if (value === "Preprod") return "Preprod"
  // Absent or unrecognized → the default front door.
  return DEFAULT_NETWORK
}

// Client-side read of the active network from the cookie. Safe to call during
// SSR (returns the default there); the client re-render picks up the cookie.
export function activeNetworkFromCookie(): Network {
  if (typeof document === "undefined") return DEFAULT_NETWORK
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${ACTIVE_NETWORK_COOKIE}=([^;]+)`)
  )
  return normalizeNetwork(match?.[1])
}
