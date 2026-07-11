import { Lucid, Blockfrost } from '@lucid-evolution/lucid'
import { activeNetworkFromCookie } from '@/lib/config/network'

export async function getClientLucid() {
  // Route all Blockfrost traffic through our own server proxy so the project id
  // never ships to the browser. The proxy injects the real key server-side.
  // See app/api/blockfrost/[...path]/route.ts.
  const proxyUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/blockfrost`
      : '/api/blockfrost'

  const lucid = await Lucid(
    new Blockfrost(proxyUrl, ''),
    activeNetworkFromCookie()
  )

  return lucid
}
