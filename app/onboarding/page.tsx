import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OnboardingForm from "./_components/OnboardingForm"
import MigrationOfferGate from "@/components/molecules/MigrationOfferGate"

const NETWORK_SWITCH_ENABLED =
  process.env.NEXT_PUBLIC_NETWORK_SWITCH_ENABLED === "true"

interface OnboardingPageProps {
  searchParams: Promise<{
    redirect?: string
  }>
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const {
    redirect: redirectParam,
  } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded, username, avatar_url, x_handle, signup_method, wallet_address")
    .eq("id", user.id)
    .single()

  if (profile?.onboarded) {
    redirect(redirectParam ?? "/realm")
  }

  const signupMethod = (profile?.signup_method ?? 'x') as 'x' | 'wallet'
  const isWalletUser = signupMethod === 'wallet'

  const defaultUsername = isWalletUser
    ? (profile?.username ?? '')
    : (profile?.username ?? user.user_metadata?.user_name ?? '')
  const avatarUrl = isWalletUser
    ? null
    : (profile?.avatar_url ?? user.user_metadata?.picture ?? null)
  const xHandle = isWalletUser
    ? null
    : (profile?.x_handle ?? user.user_metadata?.user_name ?? null)

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <OnboardingForm
        redirectTo={redirectParam ?? "/realm"}
        defaultUsername={defaultUsername}
        avatarUrl={avatarUrl}
        xHandle={xHandle}
        signupMethod={signupMethod}
        preConnectedWallet={isWalletUser ? (profile?.wallet_address ?? null) : null}
      />
      {/* A user with a profile on the other network is offered migration here,
          before manually onboarding. Migrating carries onboarded=true, so the
          page's own guard then redirects them into the realm. */}
      {NETWORK_SWITCH_ENABLED && <MigrationOfferGate blockWhileChecking />}
    </main>
  )
}
