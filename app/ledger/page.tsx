import { createClient } from '@/lib/supabase/server'
import { ADA_LABEL } from '@/lib/utils/currency'
import { LedgerPageContent } from '@/components/sections/LedgerPageContent'
import type { LedgerTransaction, LedgerStats } from '@/lib/utils/ledger'

export const metadata = {
  title: 'The Ledger | The Quest',
  description:
    'A public record of every completed mission on The Quest, verified on the Cardano blockchain.',
}

export const dynamic = 'force-dynamic'

export default async function LedgerPage() {
  const supabase = await createClient()

  const [logsRes, countRes, completedTasksRes, openCountRes] = await Promise.all([
    supabase
      .from('task_logs')
      .select(`
        id, created_at, cardano_tx_hash,
        tasks!task_logs_task_id_fkey(id, title, category, ada_reward, reward_credits),
        profiles!task_logs_user_id_fkey(username)
      `)
      .eq('action', 'completed')
      .order('created_at', { ascending: false })
      .range(0, 19),
    supabase
      .from('task_logs')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'completed'),
    supabase
      .from('tasks')
      .select('ada_reward, reward_credits')
      .eq('status', 'completed'),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
  ])

  const logs = logsRes.data ?? []
  const totalCount = countRes.count ?? 0
  const completed = completedTasksRes.data ?? []

  const initialTransactions: LedgerTransaction[] = logs.map((log) => {
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

  const totalXpAwarded = completed.reduce((sum, t) => sum + (t.reward_credits ?? 0), 0)
  const totalAdaEarned = completed.reduce((sum, t) => sum + (t.ada_reward ?? 0), 0)

  const initialStats: LedgerStats = {
    totalXpAwarded,
    openMissions: openCountRes.count ?? 0,
    totalAdaEarned,
    adaLabel: ADA_LABEL,
  }

  return (
    <LedgerPageContent
      initialTransactions={initialTransactions}
      initialStats={initialStats}
      totalCount={totalCount}
    />
  )
}
