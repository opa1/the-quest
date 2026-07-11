"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
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
export async function switchNetwork(network: Network) {
  const store = await cookies()
  store.set(ACTIVE_NETWORK_COOKIE, normalizeNetwork(network), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
  revalidatePath("/", "layout")
  return { success: true as const }
}
