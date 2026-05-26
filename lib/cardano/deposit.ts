import { PLATFORM_WALLET_ADDRESS, MIN_ADA_BOUNTY } from '@/lib/config/cardano.config'

export async function depositBounty(
  walletApi: unknown,
  lovelace: bigint
): Promise<{ txHash: string } | { error: string; message: string }> {
  try {
    if (lovelace < MIN_ADA_BOUNTY) {
      return {
        error: 'below_minimum',
        message: 'Minimum bounty is 2 ADA.',
      }
    }

    if (!PLATFORM_WALLET_ADDRESS) {
      return {
        error: 'no_platform_wallet',
        message: 'Platform wallet not configured.',
      }
    }

    // Dynamic import keeps Lucid WASM out of the server bundle
    const { getClientLucid } = await import('@/lib/cardano/client')
    const lucid = await getClientLucid()
    lucid.selectWallet.fromAPI(walletApi as Parameters<typeof lucid.selectWallet.fromAPI>[0])

    const tx = await lucid
      .newTx()
      .pay.ToAddress(PLATFORM_WALLET_ADDRESS, { lovelace })
      .complete()

    const signedTx = await tx.sign.withWallet().complete()
    const txHash = await signedTx.submit()

    return { txHash }
  } catch (err) {
    console.error('Bounty deposit failed:', err)
    return {
      error: 'deposit_failed',
      message: 'Failed to process bounty payment. Please try again.',
    }
  }
}
