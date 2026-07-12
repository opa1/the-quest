"use client"

import { useEffect, useState } from "react"
import {
  activeNetworkFromCookie,
  DEFAULT_NETWORK,
  type Network,
} from "@/lib/config/network"
import {
  adaLabel as toAdaLabel,
  formatAda as toFormatAda,
} from "@/lib/utils/currency"

// Client-side ADA label + formatter bound to the active network. Starts on the
// default network (matching SSR to avoid a hydration mismatch), then resolves
// the real network from the cookie after mount.
export function useAda() {
  const [network, setNetwork] = useState<Network>(DEFAULT_NETWORK)
  useEffect(() => setNetwork(activeNetworkFromCookie()), [])
  return {
    network,
    adaLabel: toAdaLabel(network),
    formatAda: (lovelace: number) => toFormatAda(lovelace, network),
  }
}
