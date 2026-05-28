import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const redirect = searchParams.get("redirect")

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarded, username, avatar_url, x_handle, signup_method, x_linked")
        .eq("id", data.user.id)
        .single()

      if (!profile) {
        // New X sign-up: create profile
        const xHandle = data.user.user_metadata?.user_name ?? null
        const avatarUrl = data.user.user_metadata?.picture ?? null

        await supabase.from("profiles").insert({
          id: data.user.id,
          username: null,
          avatar_url: avatarUrl,
          x_handle: xHandle,
          x_id: data.user.user_metadata?.provider_id ?? null,
          onboarded: false,
          signup_method: 'x',
        })

        const onboardingParams = new URLSearchParams()
        if (redirect) onboardingParams.set("redirect", redirect)
        return NextResponse.redirect(`${origin}/onboarding?${onboardingParams}`)
      }

      // Wallet user linking their X account
      if (profile.signup_method === 'wallet') {
        const xHandle = data.user.user_metadata?.user_name ?? null
        const avatarUrl = data.user.user_metadata?.picture ?? null

        await supabase.from("profiles").update({
          x_id: data.user.user_metadata?.provider_id ?? null,
          x_handle: xHandle,
          avatar_url: avatarUrl ?? profile.avatar_url,
          x_linked: true,
          updated_at: new Date().toISOString(),
        }).eq("id", data.user.id)

        return NextResponse.redirect(`${origin}/profile`)
      }

      if (!profile.onboarded) {
        const onboardingParams = new URLSearchParams()
        if (redirect) onboardingParams.set("redirect", redirect)
        return NextResponse.redirect(`${origin}/onboarding?${onboardingParams}`)
      }

      const destination = redirect ?? "/realm"
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
