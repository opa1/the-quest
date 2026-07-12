import "server-only"
import { cookies } from "next/headers"
import {
  ACTIVE_NETWORK_COOKIE,
  normalizeNetwork,
  type Network,
} from "@/lib/config/network"

export async function getActiveNetwork(): Promise<Network> {
  const store = await cookies()
  return normalizeNetwork(store.get(ACTIVE_NETWORK_COOKIE)?.value)
}
