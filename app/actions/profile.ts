"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getActiveNetwork } from "@/lib/config/network.server"
import { revalidatePath } from "next/cache"

export async function updateUsername(username: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "not_authenticated" }

  const trimmed = username.toLowerCase().trim()

  if (trimmed.length < 3) return { error: "too_short" }
  if (trimmed.length > 20) return { error: "too_long" }
  if (!/^[a-z0-9_]+$/.test(trimmed)) return { error: "invalid_chars" }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", trimmed)
    .neq("id", user.id)
    .single()

  if (existing) return { error: "username_taken" }

  const { error } = await supabase
    .from("profiles")
    .update({ username: trimmed, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) return { error: "update_failed" }

  revalidatePath("/profile")
  revalidatePath("/record")

  return { success: true }
}

export async function updateWalletAddress(walletAddress: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "not_authenticated" }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("wallet_address", walletAddress)
    .neq("id", user.id)
    .single()

  if (existing) return { error: "wallet_already_linked" }

  const { error } = await supabase
    .from("profiles")
    .update({
      wallet_address: walletAddress,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) return { error: "update_failed" }

  revalidatePath("/profile")
  revalidatePath("/record")

  return { success: true }
}

export async function linkWalletWithSignature(
  walletAddress: string,
  signature: string,
  key: string,
  nonce: string
): Promise<{ success: true } | { error: string; message: string }> {
  const adminClient = createAdminClient(await getActiveNetwork())

  const { data: nonceRow } = await adminClient
    .from('auth_nonces')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single()

  if (!nonceRow) {
    return { error: 'invalid_nonce', message: 'Verification session expired. Please try again.' }
  }

  if (new Date(nonceRow.expires_at) < new Date()) {
    await adminClient.from('auth_nonces').delete().eq('id', nonceRow.id)
    return { error: 'nonce_expired', message: 'Verification session expired. Please try again.' }
  }

  if (nonceRow.nonce !== nonce) {
    return { error: 'nonce_mismatch', message: 'Verification failed. Please try again.' }
  }

  const { verifyWalletSignature } = await import('@/lib/cardano/verify')
  const isValid = await verifyWalletSignature(
    walletAddress,
    signature,
    key,
    nonce,
    'Link wallet to The Quest'
  )

  await adminClient.from('auth_nonces').delete().eq('id', nonceRow.id)

  if (!isValid) {
    return { error: 'invalid_signature', message: 'Wallet signature could not be verified.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated', message: 'You must be signed in.' }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('wallet_address', walletAddress)
    .neq('id', user.id)
    .single()

  if (existing) {
    return { error: 'wallet_already_linked', message: 'This wallet is already linked to another account.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ wallet_address: walletAddress, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'update_failed', message: 'Failed to link wallet. Please try again.' }

  revalidatePath('/profile')
  revalidatePath('/record')

  return { success: true }
}

export async function disconnectWallet() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "not_authenticated" }

  const { error } = await supabase
    .from("profiles")
    .update({ wallet_address: null, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) return { error: "update_failed" }

  revalidatePath("/profile")
  revalidatePath("/record")

  return { success: true }
}
