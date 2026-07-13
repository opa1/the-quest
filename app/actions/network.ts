"use server"

import { cookies } from "next/headers"
import {
  ACTIVE_NETWORK_COOKIE,
  normalizeNetwork,
  type Network,
} from "@/lib/config/network"

// Switch the active network. This only sets the cookie that selects which
// Supabase project (and Cardano config) subsequent requests use — it does not
// authenticate. Because each network has its own session cookie, the user may
// need to sign in (or migrate) on the target network. Sessions on the other
// network are untouched, so switching back is seamless.
//
// Deliberately does NOT revalidate: revalidating would re-render the page the
// user is currently on against the network they just left behind — a route they
// may have no session for, and whose data lives in the other database — which
// crashes before the caller can navigate away. Callers follow this with a full
// page load to `/`, which re-renders everything on the new network anyway.
export async function switchNetwork(network: Network) {
  const store = await cookies()
  store.set(ACTIVE_NETWORK_COOKIE, normalizeNetwork(network), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
  return { success: true as const }
}
