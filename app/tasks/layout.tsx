import { createClient } from "@/lib/supabase/server"
import { ScrollArea } from "@/components/ui/scroll-area"
import RealmHeader from "@/components/sections/RealmHeader"
import FloatingMobileNav from "@/components/molecules/FloatingMobileNav"
import { Navbar } from "@/components/sections/Navbar"

export default async function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: {
    username: string | null
    avatar_url: string | null
    credits: number | null
    onboarded: boolean | null
  } | null = null

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url, credits, onboarded")
      .eq("id", user.id)
      .single()
    profile = data
  }

  // Signed-in, onboarded members get the full realm chrome.
  if (user && profile?.onboarded) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <RealmHeader
          userId={user.id}
          username={profile.username ?? ""}
          avatarUrl={profile.avatar_url ?? null}
          credits={profile.credits ?? 0}
        />
        <ScrollArea className="min-h-0 w-full flex-1">
          <main className="mx-auto w-full max-w-7xl px-4 py-8 pt-22 pb-24 md:px-10 lg:pb-8">
            {children}
          </main>
        </ScrollArea>
        <FloatingMobileNav />
      </div>
    )
  }

  // Guests (and users who haven't onboarded yet) can still view a shared
  // mission link — they get the public landing chrome instead.
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-10">
          {children}
        </div>
      </main>
    </>
  )
}
