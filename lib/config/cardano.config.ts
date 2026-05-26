export const CARDANO_NETWORK = (process.env.NEXT_PUBLIC_CARDANO_NETWORK ?? 'Preprod') as 'Mainnet' | 'Preprod'

export const BLOCKFROST_URL =
  CARDANO_NETWORK === 'Mainnet'
    ? 'https://cardano-mainnet.blockfrost.io/api/v0'
    : 'https://cardano-preprod.blockfrost.io/api/v0'

export const PLATFORM_WALLET_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS ?? ''

export const MIN_ADA_BOUNTY = BigInt(2_000_000) // 2 ADA in lovelace — minimum UTXO safe amount
