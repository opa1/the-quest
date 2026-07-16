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

  // "Earned" means ADA that actually left the treasury, so the source of truth is
  // the claim's payout_status - not the task's status. A task sits at 'completed'
  // the moment its slots are filled, which says nothing about whether anyone was
  // paid, and a multi-claimer task pays out while it is still 'open'. Counting
  // per claim rather than per task is deliberate: releaseReward sends one payout
  // of tasks.ada_reward per approved claim, so a task with two paid claimers has
  // genuinely paid twice.
  const [paidRes, openRes] = await Promise.all([
    supabase
      .from('task_claims')
      .select('tasks!task_claims_task_id_fkey(ada_reward, reward_credits)')
      .eq('payout_status', 'succeeded'),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
  ])

  // PostgREST types a to-one embed as either an object or a single-element array
  // depending on how it resolves the relationship; normalise both shapes.
  type PaidTask = { ada_reward: number | null; reward_credits: number | null }
  const paid = (paidRes.data ?? []).map((claim) => {
    const task = (claim as { tasks: PaidTask | PaidTask[] | null }).tasks
    return Array.isArray(task) ? task[0] : task
  })

  const totalXpAwarded = paid.reduce((sum, t) => sum + (t?.reward_credits ?? 0), 0)
  const totalAdaEarned = paid.reduce((sum, t) => sum + (t?.ada_reward ?? 0), 0)
  const openMissions = openRes.count ?? 0

  return {
    totalXpAwarded,
    openMissions,
    totalAdaEarned,
    adaLabel: adaLabel(activeNetworkFromCookie()),
  }
}
