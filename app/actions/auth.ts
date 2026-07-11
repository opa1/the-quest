"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { getActiveNetwork } from "@/lib/config/network.server"
import { type Network } from "@/lib/config/network"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import crypto from "crypto"

// Wallet-user passwords are derived from a per-network secret. Testnet must keep
// using the same secret as before (WALLET_AUTH_SECRET_TESTNET == the legacy
// WALLET_AUTH_SECRET) or existing wallet logins break; mainnet uses its own.
function walletAuthSecret(network: Network): string {
  const perNetwork =
    network === "Mainnet"
      ? process.env.WALLET_AUTH_SECRET_MAINNET
      : process.env.WALLET_AUTH_SECRET_TESTNET
  return perNetwork ?? process.env.WALLET_AUTH_SECRET ?? ""
}

function derivePassword(walletAddress: string, network: Network): string {
  return crypto
    .createHmac("sha256", walletAuthSecret(network))
    .update(walletAddress)
    .digest("hex")
}

export async function walletSignIn(
  walletAddress: string,
  signature: string,
  key: string
): Promise<
  { success: true; redirectTo: string } | { error: string; message: string }
> {
  // Everything here acts on the currently-selected network's database.
  const network = await getActiveNetwork()
  const adminClient = createAdminClient(network)

  // Fetch and validate nonce
  const { data: nonceRow } = await adminClient
    .from("auth_nonces")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single()

  if (!nonceRow) {
    return {
      error: "invalid_nonce",
      message: "Sign in session expired. Please try again.",
    }
  }

  if (new Date(nonceRow.expires_at) < new Date()) {
    await adminClient.from("auth_nonces").delete().eq("id", nonceRow.id)
    return {
      error: "nonce_expired",
      message: "Sign in session expired. Please try again.",
    }
  }

  // Verify signature
  const { verifyWalletSignature } = await import("@/lib/cardano/verify")
  const isValid = await verifyWalletSignature(
    walletAddress,
    signature,
    key,
    nonceRow.nonce
  )

  if (!isValid) {
    return {
      error: "invalid_signature",
      message: "Wallet signature could not be verified.",
    }
  }

  // Delete used nonce
  await adminClient.from("auth_nonces").delete().eq("id", nonceRow.id)

  // Check if profile exists for this wallet address
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id, signup_method, onboarded")
    .eq("wallet_address", walletAddress)
    .single()

  if (existingProfile) {
    if (existingProfile.signup_method === "x") {
      return {
        error: "wrong_method",
        message:
          "This wallet is linked to an X account. Please sign in with X instead.",
      }
    }

    const email = `${walletAddress}@wallet.thequest.gg`
    const password = derivePassword(walletAddress, network)

    const supabase = await createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return {
        error: "sign_in_failed",
        message: "Failed to sign in. Please try again.",
      }
    }

    return {
      success: true,
      redirectTo: existingProfile.onboarded ? "/realm" : "/onboarding",
    }
  }

  // New wallet user -- create Supabase auth user
  const email = `${walletAddress}@wallet.thequest.gg`
  const password = derivePassword(walletAddress, network)

  const { data: newAuthUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        signup_method: "wallet",
        wallet_address: walletAddress,
      },
    })

  if (createError || !newAuthUser.user) {
    return {
      error: "create_failed",
      message: "Failed to create account. Please try again.",
    }
  }

  // Create profile. wallet_key_hash is the network-agnostic identity used to
  // match this wallet to its profile on the other network during migration.
  const { walletKeyHash } = await import("@/lib/cardano/identity")
  await adminClient.from("profiles").insert({
    id: newAuthUser.user.id,
    wallet_address: walletAddress,
    wallet_key_hash: await walletKeyHash(walletAddress),
    signup_method: "wallet",
    onboarded: false,
  })

  // Sign in
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return {
      error: "sign_in_failed",
      message: "Failed to sign in. Please try again.",
    }
  }

  return { success: true, redirectTo: "/onboarding" }
}

export async function linkXAccount(): Promise<{
  error: string
  message?: string
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "not_authenticated" }

  const headersList = await headers()
  const host = headersList.get("host") ?? "localhost:3000"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const redirectTo = `${protocol}://${host}/auth/callback`

  const { data, error } = await supabase.auth.linkIdentity({
    provider: "twitter",
    options: { redirectTo },
  })

  if (error || !data?.url) {
    return {
      error: "link_failed",
      message: error?.message ?? "Could not start X linking.",
    }
  }

  redirect(data.url)
}
