import { createClient } from '@/lib/supabase/client'
import type { FeedEvent } from '@/lib/types/feed'

export async function buildFeedEvents(): Promise<FeedEvent[]> {
  const supabase = createClient()

  const { data: logs } = await supabase
    .from('task_logs')
    .select(`
      id, action, created_at, cardano_tx_hash,
      tasks!task_logs_task_id_fkey(id, title, category, difficulty, reward_credits, ada_reward),
      profiles!task_logs_user_id_fkey(username, avatar_url)
    `)
    .in('action', ['claimed', 'completed'])
    .order('created_at', { ascending: false })
    .limit(30)

  const { data: newTasks } = await supabase
    .from('tasks')
    .select(`
      id, title, category, difficulty, reward_credits, ada_reward, created_at,
      profiles!tasks_created_by_fkey(username, avatar_url)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(20)

  const logEvents: FeedEvent[] = (logs ?? []).map((log) => {
    const task = Array.isArray(log.tasks) ? log.tasks[0] : log.tasks
    const actor = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles
    return {
      id: log.id,
      type: log.action === 'claimed' ? 'claimed' : 'completed',
      created_at: log.created_at,
      task_id: task?.id ?? '',
      task_title: task?.title ?? '',
      category: task?.category ?? '',
      difficulty: task?.difficulty ?? 'easy',
      reward_credits: task?.reward_credits ?? 0,
      ada_reward: task?.ada_reward ?? 0,
      actor_username: actor?.username ?? 'Unknown',
      actor_avatar: actor?.avatar_url ?? null,
      poster_username: null,
      cardano_tx_hash: log.cardano_tx_hash ?? null,
    }
  })

  const taskEvents: FeedEvent[] = (newTasks ?? []).map((task) => {
    const poster = Array.isArray(task.profiles) ? task.profiles[0] : task.profiles
    return {
      id: `task-${task.id}`,
      type: 'new_bounty' as const,
      created_at: task.created_at,
      task_id: task.id,
      task_title: task.title,
      category: task.category,
      difficulty: task.difficulty,
      reward_credits: task.reward_credits ?? 0,
      ada_reward: task.ada_reward ?? 0,
      actor_username: poster?.username ?? 'Unknown',
      actor_avatar: poster?.avatar_url ?? null,
      poster_username: null,
      cardano_tx_hash: null,
    }
  })

  return [...logEvents, ...taskEvents].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}
