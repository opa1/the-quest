import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveNetwork } from '@/lib/config/network.server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { walletAddress } = await req.json() as { walletAddress?: string }

  if (!walletAddress) {
    return NextResponse.json({ error: 'wallet_address required' }, { status: 400 })
  }

  // Store the nonce in the active network's DB so walletSignIn (same request
  // scope, same network) reads it from the right place.
  const adminClient = createAdminClient(await getActiveNetwork())

  await adminClient
    .from('auth_nonces')
    .delete()
    .eq('wallet_address', walletAddress)

  const nonce = crypto.randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  await adminClient.from('auth_nonces').insert({
    wallet_address: walletAddress,
    nonce,
    expires_at: expiresAt,
  })

  return NextResponse.json({ nonce })
}
