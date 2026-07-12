import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getActiveNetwork } from "@/lib/config/network.server"
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

  // Completions come from two sources, deduped by task_id:
  //   1. Multi-claimer — task_claims.status = 'approved' (tx hash on the claim).
  //   2. Legacy single-claimer — tasks.status = 'completed' & claimed_by = user
  //      (rows that predate task_claims; tx hash lives in task_logs).
  const admin = createAdminClient(await getActiveNetwork())

  const [approvedClaimsRes, legacyTasksRes] = await Promise.all([
    admin
      .from("task_claims")
      .select("task_id, completed_at, cardano_tx_hash")
      .eq("user_id", user.id)
      .eq("status", "approved"),
    admin
      .from("tasks")
      .select("id, completed_at")
      .eq("claimed_by", user.id)
      .eq("status", "completed"),
  ])

  // task_id -> completion metadata; claims win over legacy on overlap.
  const claimByTask = new Map<
    string,
    { completed_at: string | null; cardano_tx_hash: string | null }
  >()
  approvedClaimsRes.data?.forEach((c) =>
    claimByTask.set(c.task_id, {
      completed_at: c.completed_at,
      cardano_tx_hash: c.cardano_tx_hash,
    })
  )

  const legacyMeta = new Map<string, { completed_at: string | null }>()
  const legacyOnlyIds: string[] = []
  legacyTasksRes.data?.forEach((t) => {
    legacyMeta.set(t.id, { completed_at: t.completed_at })
    if (!claimByTask.has(t.id)) legacyOnlyIds.push(t.id)
  })

  const allTaskIds = [
    ...new Set([...claimByTask.keys(), ...legacyMeta.keys()]),
  ]

  // Task metadata for every completed task.
  const taskMetaMap = new Map<
    string,
    {
      title: string
      category: string
      difficulty: "easy" | "medium" | "hard"
      reward_credits: number
      ada_reward: number
    }
  >()
  if (allTaskIds.length > 0) {
    const { data: taskRows } = await admin
      .from("tasks")
      .select("id, title, category, difficulty, reward_credits, ada_reward")
      .in("id", allTaskIds)
    taskRows?.forEach((t) =>
      taskMetaMap.set(t.id, {
        title: t.title,
        category: t.category,
        difficulty: t.difficulty,
        reward_credits: t.reward_credits ?? 0,
        ada_reward: t.ada_reward ?? 0,
      })
    )
  }

  // Payout tx hashes for legacy-only completions come from task_logs.
  const legacyTxMap = new Map<string, string | null>()
  if (legacyOnlyIds.length > 0) {
    const { data: logData } = await admin
      .from("task_logs")
      .select("task_id, cardano_tx_hash")
      .eq("user_id", user.id)
      .eq("action", "completed")
      .in("task_id", legacyOnlyIds)
    logData?.forEach((l) => {
      if (!legacyTxMap.has(l.task_id)) legacyTxMap.set(l.task_id, l.cardano_tx_hash)
    })
  }

  const records: ContributionRecord[] = allTaskIds
    .map((taskId) => {
      const meta = taskMetaMap.get(taskId)
      const claim = claimByTask.get(taskId)
      const completed_at =
        claim?.completed_at ??
        legacyMeta.get(taskId)?.completed_at ??
        new Date().toISOString()
      const cardano_tx_hash = claim
        ? claim.cardano_tx_hash
        : (legacyTxMap.get(taskId) ?? null)
      return {
        id: taskId,
        task_id: taskId,
        task_title: meta?.title ?? "Unknown Mission",
        category: meta?.category ?? "GENERAL",
        difficulty: meta?.difficulty ?? "easy",
        reward_credits: meta?.reward_credits ?? 0,
        ada_reward: meta?.ada_reward ?? 0,
        completed_at,
        cardano_tx_hash,
      }
    })
    .sort(
      (a, b) =>
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    )

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
