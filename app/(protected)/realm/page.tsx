import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import FeedFilterBar from "@/components/molecules/FeedFilterBar"
import FeedList from "@/components/molecules/FeedList"
import TopQuesters from "@/components/molecules/TopQuesters"
import ActiveMissionBanner from "@/components/molecules/ActiveMissionBanner"
import { Button } from "@/components/ui/button"
import { QUEST_CONFIG } from "@/lib/config/quest.config"

export default async function RealmPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: activeMission } = await supabase
    .from("tasks")
    .select("id, title, category, difficulty")
    .eq("claimed_by", user?.id)
    .eq("status", "claimed")
    .single()

  const { data: topQuesters } = await supabase
    .from("profiles")
    .select("username, avatar_url, credits")
    .order("credits", { ascending: false })
    .limit(5)

  const questersWithRank = (topQuesters ?? []).map((q, i) => ({
    rank: i + 1,
    username: q.username ?? "Unknown",
    xp: q.credits ?? 0,
    avatar: q.avatar_url ?? null,
  }))

  return (
    <div className="flex flex-col items-start gap-8 md:flex-row">
      {/* Left col — Feed */}
      <div className="w-full flex min-w-0 flex-1 flex-col gap-6">
        <FeedFilterBar />
        <FeedList />
      </div>

      {/* Right col — Status panel */}
      <div className="flex w-full flex-col gap-4 md:w-[320px] md:shrink-0">
        <ActiveMissionBanner task={activeMission ?? null} />

        <Button variant="default" size="lg" className="w-full" asChild>
          <Link href={QUEST_CONFIG.realm.rightPanel.postMissionHref}>
            <span className="text-sm font-bold tracking-widest uppercase">
              {QUEST_CONFIG.realm.rightPanel.postMissionLabel}
            </span>
          </Link>
        </Button>

        <TopQuesters questers={questersWithRank} />
      </div>
    </div>
  )
}
