import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CategoryBadge } from '@/components/atoms/CategoryBadge'
import { DifficultyBadge } from '@/components/atoms/DifficultyBadge'
import TaskStatusBadge from '@/components/atoms/TaskStatusBadge'
import TimeAgo from '@/components/atoms/TimeAgo'
import UserAvatar from '@/components/atoms/UserAvatar'
import TaskActionPanel from '@/components/molecules/TaskActionPanel'

interface TaskDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: task } = await supabase
    .from('tasks')
    .select(`
      id, title, description, category, difficulty,
      reward_credits, status, created_at, claimed_at, completed_at,
      created_by,
      claimed_by,
      poster:profiles!tasks_created_by_fkey(username, avatar_url),
      claimer:profiles!tasks_claimed_by_fkey(username, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (!task) notFound()

  let txHash: string | null = null
  if (task.status === 'completed') {
    const { data: log } = await supabase
      .from('task_logs')
      .select('cardano_tx_hash')
      .eq('task_id', task.id)
      .eq('action', 'completed')
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
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Missions
      </Link>

      {/* Two column layout */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12 lg:items-start">

        {/* Left — Task content */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge label={task.category} />
            <DifficultyBadge difficulty={task.difficulty as any} />
            <TaskStatusBadge status={task.status as any} />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-foreground font-heading leading-tight">
            {task.title}
          </h1>

          {/* Posted by + time */}
          <div className="flex items-center gap-3">
            <UserAvatar
              src={poster?.avatar_url ?? null}
              username={poster?.username ?? 'Unknown'}
              size="sm"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                @{poster?.username ?? 'Unknown'}
              </span>
              <TimeAgo date={task.created_at} />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-border/40" />

          {/* Full description */}
          <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
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
