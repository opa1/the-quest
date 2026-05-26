import { createClient } from '@/lib/supabase/client'

export type ActivityEvent = {
  id: string
  action: 'claimed' | 'completed'
  created_at: string
  task_id: string
  task_title: string
  actor_username: string
  actor_avatar: string | null
  cardano_tx_hash: string | null
}

export async function fetchRealmActivity(): Promise<ActivityEvent[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('task_logs')
    .select(`
      id, action, created_at, cardano_tx_hash,
      tasks!task_logs_task_id_fkey(id, title),
      profiles!task_logs_user_id_fkey(username, avatar_url)
    `)
    .in('action', ['claimed', 'completed'])
    .order('created_at', { ascending: false })
    .limit(20)

  return (data ?? []).map((log) => {
    const task = Array.isArray(log.tasks) ? log.tasks[0] : log.tasks
    const actor = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles
    return {
      id: log.id,
      action: log.action as 'claimed' | 'completed',
      created_at: log.created_at,
      task_id: task?.id ?? '',
      task_title: task?.title ?? '',
      actor_username: actor?.username ?? 'Unknown',
      actor_avatar: actor?.avatar_url ?? null,
      cardano_tx_hash: log.cardano_tx_hash ?? null,
    }
  })
}
