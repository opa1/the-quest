import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import RecordStatsStrip from "@/components/molecules/RecordStatsStrip"
import ContributionList from "@/components/molecules/ContributionList"
import ProfileCard from "@/components/molecules/ProfileCard"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import type {
  ContributionRecord,
  RecordStats,
  UserProfile,
} from "@/lib/types/missions"

export const metadata = {
  title: "My Record - The Quest",
  description: "Your permanent on-chain contribution history on The Quest.",
}

export default async function RecordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, username, avatar_url, credits, wallet_address, x_handle, created_at, onboarded"
    )
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/")

  // Fetch tasks that this user has successfully completed (where they are the claimer)
  const { data: completedTasks } = await supabase
    .from("tasks")
    .select("id, title, category, difficulty, reward_credits, completed_at")
    .eq("claimed_by", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })

  const completedTaskIds = (completedTasks ?? []).map((t) => t.id)

  // Fetch task logs to retrieve the cardano payout transaction hashes
  let logs: { task_id: string; cardano_tx_hash: string | null }[] = []
  if (completedTaskIds.length > 0) {
    const { data: logData } = await supabase
      .from("task_logs")
      .select("task_id, cardano_tx_hash")
      .in("task_id", completedTaskIds)
      .eq("action", "completed")
    logs = logData ?? []
  }

  const records: ContributionRecord[] = (completedTasks ?? []).map((task) => {
    const matchingLog = logs.find((l) => l.task_id === task.id)
    return {
      id: task.id,
      task_id: task.id,
      task_title: task.title,
      category: task.category,
      difficulty: task.difficulty,
      reward_credits: task.reward_credits,
      completed_at: task.completed_at || new Date().toISOString(),
      cardano_tx_hash: matchingLog?.cardano_tx_hash ?? null,
    }
  })

  const stats: RecordStats = {
    completed: records.length,
    credits: profile.credits ?? 0,
    rank: "",
    proofs: records.filter((r) => r.cardano_tx_hash !== null).length,
  }

  const userProfile: UserProfile = {
    id: profile.id,
    username: profile.username,
    avatar_url: profile.avatar_url,
    credits: profile.credits ?? 0,
    wallet_address: profile.wallet_address,
    x_handle: profile.x_handle,
    created_at: profile.created_at,
    onboarded: profile.onboarded,
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page heading */}
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-black tracking-tight text-foreground uppercase md:text-4xl">
          {QUEST_CONFIG.record.title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {QUEST_CONFIG.record.subtext}
        </p>
      </div>

      {/* Stats strip */}
      <RecordStatsStrip stats={stats} />

      {/* Two column */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
        {/* Left — contribution list */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <ContributionList records={records} />
          <Link
            href="/ledger"
            className="self-start text-sm text-primary underline underline-offset-2"
          >
            View the full public ledger
          </Link>
        </div>

        {/* Right — profile card */}
        <div className="w-full lg:w-[300px] lg:shrink-0">
          <ProfileCard profile={userProfile} />
        </div>
      </div>
    </div>
  )
}
