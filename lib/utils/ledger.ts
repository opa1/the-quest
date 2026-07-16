import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { adaLabel } from '@/lib/utils/currency'
import { activeNetworkFromCookie, type Network } from '@/lib/config/network'

/**
 * The ledger is read from two places — the landing section (browser client) and
 * /ledger (server client) — so the queries take a client rather than making
 * one. They used to be copy-pasted into app/ledger/page.tsx instead, which is
 * exactly how that page ended up reporting 8 ADA under a table listing 56.33:
 * the calculation was corrected in one copy and not the other.
 */

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

export async function computeLedgerTransactions(
  supabase: SupabaseClient,
  limit = 2,
  offset = 0
): Promise<LedgerTransaction[]> {
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

export async function computeLedgerStats(
  supabase: SupabaseClient,
  network: Network
): Promise<LedgerStats> {
  // Counted from task_logs — the same rows the ledger table renders — so the
  // headline can never disagree with the transactions listed under it.
  //
  // Not tasks.status: a task reaches 'completed' when its slots fill, which says
  // nothing about anyone being paid, and a multi-claimer mission pays out while
  // still 'open'. Not task_claims either, which only covers the modern era —
  // most testnet completions predate that table and live solely in task_logs, so
  // reading claims silently under-reported there while looking right on mainnet.
  //
  // One log row per approval, so a mission that paid two claimers counts twice.
  // Refunds are action='cancelled' and never counted here.
  const [logsRes, openRes] = await Promise.all([
    supabase
      .from('task_logs')
      .select('cardano_tx_hash, tasks!task_logs_task_id_fkey(ada_reward, reward_credits)')
      .eq('action', 'completed'),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
  ])

  // PostgREST types a to-one embed as either an object or a single-element array
  // depending on how it resolves the relationship; normalise both shapes.
  type PaidTask = { ada_reward: number | null; reward_credits: number | null }
  const rows = (logsRes.data ?? []).map((log) => {
    const embedded = (log as { tasks: PaidTask | PaidTask[] | null }).tasks
    return {
      txHash: (log as { cardano_tx_hash: string | null }).cardano_tx_hash,
      task: Array.isArray(embedded) ? embedded[0] : embedded,
    }
  })

  // ADA only counts once a transaction exists to prove it left the wallet —
  // that is exactly what the table badges CONFIRMED. XP has no such condition:
  // it is granted on approval, including on missions that pay no ADA at all.
  const totalAdaEarned = rows
    .filter((r) => !!r.txHash)
    .reduce((sum, r) => sum + (r.task?.ada_reward ?? 0), 0)
  const totalXpAwarded = rows.reduce(
    (sum, r) => sum + (r.task?.reward_credits ?? 0),
    0
  )
  const openMissions = openRes.count ?? 0

  return {
    totalXpAwarded,
    openMissions,
    totalAdaEarned,
    adaLabel: adaLabel(network),
  }
}

/** Browser-side wrappers — the landing page's ledger section. */
export function fetchLedgerTransactions(limit = 2, offset = 0) {
  return computeLedgerTransactions(createClient(), limit, offset)
}

export function fetchLedgerStats() {
  return computeLedgerStats(createClient(), activeNetworkFromCookie())
}
