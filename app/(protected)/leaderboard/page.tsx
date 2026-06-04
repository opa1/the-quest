import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LeaderboardPodium from "@/components/molecules/LeaderboardPodium"
import LeaderboardFullTable from "@/components/molecules/LeaderboardFullTable"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import type { LeaderboardEntry } from "@/lib/types/missions"

export const metadata = {
  title: "Hall of Fame - The Quest",
  description: "The top operatives on The Quest ranked by credits earned.",
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { pageSize } = QUEST_CONFIG.leaderboard

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, credits")
    .order("credits", { ascending: false })
    .limit(3 + pageSize)

  const profileIds = (profiles ?? []).map((p) => p.id)

  const completedMap: Record<string, number> = {}
  const proofMap: Record<string, number> = {}

  if (profileIds.length > 0) {
    const { data: completedTasks } = await supabase
      .from("tasks")
      .select("claimed_by")
      .in("claimed_by", profileIds)
      .eq("status", "completed")

    completedTasks?.forEach((t) => {
      if (t.claimed_by) {
        completedMap[t.claimed_by] = (completedMap[t.claimed_by] || 0) + 1
      }
    })

    const { data: proofLogs } = await supabase
      .from("task_logs")
      .select("user_id")
      .in("user_id", profileIds)
      .eq("action", "completed")
      .not("cardano_tx_hash", "is", null)

    proofLogs?.forEach((l) => {
      if (l.user_id) {
        proofMap[l.user_id] = (proofMap[l.user_id] || 0) + 1
      }
    })
  }

  const allEntries: LeaderboardEntry[] = (profiles ?? []).map((p, i) => ({
    rank: i + 1,
    id: p.id,
    username: p.username,
    avatar_url: p.avatar_url,
    credits: p.credits ?? 0,
    completed: completedMap[p.id] ?? 0,
    proofs: proofMap[p.id] ?? 0,
    isCurrentUser: p.id === user.id,
  }))

  const topThree = allEntries.slice(0, 3)
  const restEntries = allEntries.slice(3)
  const hasMore = restEntries.length === pageSize

  return (
    <div className="flex flex-col gap-12">
      {/* Page heading */}
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-3xl font-black tracking-tight text-primary uppercase md:text-4xl">
          {QUEST_CONFIG.leaderboard.title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {QUEST_CONFIG.leaderboard.subtext}
        </p>
      </div>

      {/* Top 3 podium */}
      <LeaderboardPodium topThree={topThree} />

      {/* Full table — ranks 4+ */}
      {restEntries.length > 0 && (
        <LeaderboardFullTable
          initialEntries={restEntries}
          currentUserId={user.id}
          hasMore={hasMore}
        />
      )}
    </div>
  )
}
