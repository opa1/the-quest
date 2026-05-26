import { Lucid, Blockfrost } from '@lucid-evolution/lucid'
import { CARDANO_NETWORK, BLOCKFROST_URL } from '@/lib/config/cardano.config'

export async function getClientLucid() {
  const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID
  if (!projectId) throw new Error('Blockfrost project ID not configured.')

  const lucid = await Lucid(
    new Blockfrost(BLOCKFROST_URL, projectId),
    CARDANO_NETWORK
  )

  return lucid
}
