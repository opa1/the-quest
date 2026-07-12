import "server-only"

// Network-agnostic wallet identity. A wallet's address differs between mainnet
// (addr1…) and testnet (addr_test1…), but the underlying key hashes are the
// same, so this links one person across the two separate databases.
//
// Prefer the stake key hash (groups every address under a wallet's stake key);
// fall back to the payment key hash for enterprise addresses with no stake part.
// Dynamic import keeps the Lucid/CML WASM out of every bundle that merely
// imports this module.
export async function walletKeyHash(
  address: string | null | undefined
): Promise<string | null> {
  if (!address) return null
  try {
    const { getAddressDetails } = await import("@lucid-evolution/utils")
    const details = getAddressDetails(address)
    return (
      details.stakeCredential?.hash ?? details.paymentCredential?.hash ?? null
    )
  } catch (err) {
    console.error("[walletKeyHash] failed to parse address:", err)
    return null
  }
}
