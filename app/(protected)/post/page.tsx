import { createClient } from "@/lib/supabase/server"
import PostMissionForm from "@/components/molecules/PostMissionForm"
import { QUEST_CONFIG } from "@/lib/config/quest.config"

export const metadata = {
  title: "Post a Mission - The Quest",
  description: "Deploy a new mission on The Quest.",
}

export default async function PostPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let hasWallet = false
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_address")
      .eq("id", user.id)
      .single()
    hasWallet = !!profile?.wallet_address
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-black tracking-tight text-foreground uppercase md:text-4xl">
          {QUEST_CONFIG.postMission.title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {QUEST_CONFIG.postMission.subtext}
        </p>
      </div>
      <PostMissionForm hasWallet={hasWallet} />
    </div>
  )
}
