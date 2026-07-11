import { type Network } from "@/lib/config/network"

export function adaLabel(network: Network): "ADA" | "tADA" {
  return network === "Mainnet" ? "ADA" : "tADA"
}

export function formatAda(lovelace: number, network: Network): string {
  const ada = lovelace / 1_000_000
  return `${ada % 1 === 0 ? ada.toFixed(0) : ada.toFixed(2)} ${adaLabel(network)}`
}
