import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CategoryBadge } from "@/components/atoms/CategoryBadge"
import { DifficultyBadge } from "@/components/atoms/DifficultyBadge"
import TaskStatusBadge from "@/components/atoms/TaskStatusBadge"
import TimeAgo from "@/components/atoms/TimeAgo"
import UserAvatar from "@/components/atoms/UserAvatar"
import TaskActionPanel from "@/components/molecules/TaskActionPanel"
import { unstable_noStore as noStore } from "next/cache"

interface TaskDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  noStore()
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: task } = await supabase
    .from("tasks")
    .select(
      `
      id, title, description, category, difficulty,
      reward_credits, ada_reward, proof_type, status, created_at, claimed_at, completed_at,
      created_by,
      claimed_by,
      poster:profiles!tasks_created_by_fkey(username, avatar_url),
      claimer:profiles!tasks_claimed_by_fkey(username, avatar_url)
    `
    )
    .eq("id", id)
    .single()

  if (!task) notFound()

  // console.log("task ->", task)

  let txHash: string | null = null
  if (task.status === "completed") {
    const { data: log } = await supabase
      .from("task_logs")
      .select("cardano_tx_hash")
      .eq("task_id", task.id)
      .eq("action", "completed")
      .single()
    txHash = log?.cardano_tx_hash ?? null
  }

  const poster = Array.isArray(task.poster) ? task.poster[0] : task.poster
  const claimer = Array.isArray(task.claimer) ? task.claimer[0] : task.claimer

  return (
    <div className="flex flex-col gap-8">
      {/* Back link */}
      <Link
        href="/missions"
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Missions
      </Link>

      {/* Two column layout */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        {/* Left — Task content */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge label={task.category} />
            <DifficultyBadge difficulty={task.difficulty as any} />
            <TaskStatusBadge status={task.status as any} />
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl leading-tight font-black text-foreground md:text-4xl">
            {task.title}
          </h1>

          {/* Posted by + time */}
          <div className="flex items-center gap-3">
            <UserAvatar
              src={poster?.avatar_url ?? null}
              username={poster?.username ?? "Unknown"}
              size="sm"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                @{poster?.username ?? "Unknown"}
              </span>
              <TimeAgo date={task.created_at} />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-border/40" />

          {/* Full description */}
          <div className="text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {task.description}
          </div>
        </div>

        {/* Right — Action panel */}
        <div className="w-full lg:w-[320px] lg:shrink-0">
          <TaskActionPanel
            taskId={task.id}
            status={task.status as any}
            createdById={task.created_by}
            claimedById={task.claimed_by}
            xp={task.reward_credits}
            adaReward={task.ada_reward ?? 0}
            proofType={task.proof_type ?? "any"}
            txHash={txHash}
            completedAt={task.completed_at}
            claimedAt={task.claimed_at}
            claimer={claimer ?? null}
            poster={poster ?? null}
          />
        </div>
      </div>
    </div>
  )
}
