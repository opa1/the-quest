import { type Network } from "@/lib/config/network"

export const MIN_ADA_BOUNTY = BigInt(2_000_000) // 2 ADA in lovelace — min UTXO-safe

export function blockfrostUrl(network: Network): string {
  return network === "Mainnet"
    ? "https://cardano-mainnet.blockfrost.io/api/v0"
    : "https://cardano-preprod.blockfrost.io/api/v0"
}

export function explorerTxUrl(network: Network, txHash: string): string {
  const base =
    network === "Mainnet"
      ? "https://cardanoscan.io/transaction"
      : "https://preprod.cardanoscan.io/transaction"
  return `${base}/${txHash}`
}

// Public deposit target, per network. Static NEXT_PUBLIC_* refs so they inline
// into the client bundle; falls back to the legacy single var (= testnet).
const PLATFORM_ADDRESSES: Record<Network, string | undefined> = {
  Mainnet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS_MAINNET,
  Preprod: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS_TESTNET,
}

export function platformWalletAddress(network: Network): string {
  return (
    PLATFORM_ADDRESSES[network] ??
    process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS ??
    ""
  )
}

// Server-side Blockfrost key, per network. Returns "" on the client (which goes
// through the /api/blockfrost proxy instead of holding a key).
export function blockfrostProjectId(network: Network): string {
  const id =
    network === "Mainnet"
      ? process.env.BLOCKFROST_PROJECT_ID_MAINNET
      : process.env.BLOCKFROST_PROJECT_ID
  return id ?? process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID ?? ""
}
