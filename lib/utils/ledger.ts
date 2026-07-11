import { createClient } from '@/lib/supabase/client'
import { adaLabel } from '@/lib/utils/currency'
import { activeNetworkFromCookie } from '@/lib/config/network'

export type LedgerTransaction = {
  id: string
  task_id: string
  task_title: string
  completed_by: string
  completed_at: string
  category: string
  ada_reward: number
  reward_credits: number
  cardano_tx_hash: string | null
  status: 'confirmed' | 'pending'
}

export type LedgerStats = {
  totalXpAwarded: number
  openMissions: number
  totalAdaEarned: number
  adaLabel: string
}

export async function fetchLedgerTransactions(limit = 2, offset = 0): Promise<LedgerTransaction[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('task_logs')
    .select(`
      id, created_at, cardano_tx_hash,
      tasks!task_logs_task_id_fkey(id, title, category, ada_reward, reward_credits),
      profiles!task_logs_user_id_fkey(username)
    `)
    .eq('action', 'completed')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return (data ?? []).map((log) => {
    const task = Array.isArray(log.tasks) ? log.tasks[0] : (log.tasks as any)
    const profile = Array.isArray(log.profiles) ? log.profiles[0] : (log.profiles as any)
    return {
      id: log.id,
      task_id: task?.id ?? '',
      task_title: task?.title ?? 'Unknown Mission',
      completed_by: profile?.username ?? 'Unknown',
      completed_at: log.created_at,
      category: task?.category ?? 'GENERAL',
      ada_reward: task?.ada_reward ?? 0,
      reward_credits: task?.reward_credits ?? 0,
      cardano_tx_hash: log.cardano_tx_hash ?? null,
      status: (log.cardano_tx_hash ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
    }
  })
}

export async function fetchLedgerStats(): Promise<LedgerStats> {
  const supabase = createClient()

  const [completedRes, openRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('ada_reward, reward_credits')
      .eq('status', 'completed'),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
  ])

  const completed = completedRes.data ?? []
  const totalXpAwarded = completed.reduce((sum, t) => sum + (t.reward_credits ?? 0), 0)
  const totalAdaEarned = completed.reduce((sum, t) => sum + (t.ada_reward ?? 0), 0)
  const openMissions = openRes.count ?? 0

  return {
    totalXpAwarded,
    openMissions,
    totalAdaEarned,
    adaLabel: adaLabel(activeNetworkFromCookie()),
  }
}
