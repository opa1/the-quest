import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import TopQuesters from "@/components/molecules/TopQuesters"
import RecentMissions from "@/components/molecules/RecentMissions"
import RealmActivityLog from "@/components/molecules/RealmActivityLog"
import { QUEST_CONFIG } from "@/lib/config/quest.config"

export default async function RealmPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      {/* Left col — Recent missions */}
      <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
        <RecentMissions currentUserId={user?.id ?? ""} />
      </div>

      {/* Right col — Actions + questers + activity */}
      <div className="flex w-full flex-col gap-4 lg:w-[320px] lg:shrink-0">
        <Button variant="default" size="lg" className="w-full" asChild>
          <Link href={QUEST_CONFIG.realm.rightPanel.postMissionHref}>
            <span className="text-sm font-bold tracking-widest uppercase">
              {QUEST_CONFIG.realm.rightPanel.postMissionLabel}
            </span>
          </Link>
        </Button>

        <TopQuesters questers={questersWithRank} />

        <RealmActivityLog />
      </div>
    </div>
  )
}
