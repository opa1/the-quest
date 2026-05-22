'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUsername(username: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated' }

  const trimmed = username.toLowerCase().trim()

  if (trimmed.length < 3) return { error: 'too_short' }
  if (trimmed.length > 20) return { error: 'too_long' }
  if (!/^[a-z0-9_]+$/.test(trimmed)) return { error: 'invalid_chars' }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', trimmed)
    .neq('id', user.id)
    .single()

  if (existing) return { error: 'username_taken' }

  const { error } = await supabase
    .from('profiles')
    .update({ username: trimmed, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'update_failed' }

  revalidatePath('/profile')
  revalidatePath('/record')

  return { success: true }
}

export async function updateWalletAddress(walletAddress: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated' }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('wallet_address', walletAddress)
    .neq('id', user.id)
    .single()

  if (existing) return { error: 'wallet_already_linked' }

  const { error } = await supabase
    .from('profiles')
    .update({ wallet_address: walletAddress, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'update_failed' }

  revalidatePath('/profile')
  revalidatePath('/record')

  return { success: true }
}

export async function disconnectWallet() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ wallet_address: null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'update_failed' }

  revalidatePath('/profile')
  revalidatePath('/record')

  return { success: true }
}
