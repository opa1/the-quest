"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

interface OnboardingData {
  username: string
  walletAddress: string | null
  redirectTo: string
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", data.username.toLowerCase().trim())
    .neq("id", user.id)
    .single()

  if (existing) {
    return { error: "username_taken" }
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    username: data.username.toLowerCase().trim(),
    wallet_address: data.walletAddress ?? null,
    onboarded: true,
    avatar_url: user.user_metadata?.picture ?? null,
    x_handle: user.user_metadata?.user_name ?? null,
    x_id: user.user_metadata?.provider_id ?? null,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("[completeOnboarding] upsert error:", error)
    return { error: `DB error ${error.code}: ${error.message}` }
  }

  redirect(data.redirectTo || "/realm")
}
