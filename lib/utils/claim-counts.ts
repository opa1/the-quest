import type { SupabaseClient } from '@supabase/supabase-js'
import type { Mission } from '@/lib/types/missions'

/**
 * "50 competing for 3 spots".
 *
 * Deliberately a phrase rather than a bare number or a 50/3 ratio. A loose
 * number next to a progress bar gets read as the bar's own quantity, so an
 * empty bar beside "50" looks like a bug; and "50/3" reads as a fraction,
 * which is nonsense. Phrased, it can only mean one thing.
 */
export function competingLabel(
  submissionCount: number | undefined,
  maxClaimers: number
): string {
  const n = submissionCount ?? 0
  if (n === 0) return `No submissions yet · ${maxClaimers} spots`
  return `${n} competing for ${maxClaimers} ${maxClaimers === 1 ? 'spot' : 'spots'}`
}

/**
 * Three or more people chasing every spot. The threshold is a judgement call,
 * not a science: it exists so someone about to spend an evening on a mission
 * finds out the odds beforehand rather than after being rejected.
 */
export const OVERSUBSCRIBED_RATIO = 3

export function isOversubscribed(
  submissionCount: number | undefined,
  maxClaimers: number
): boolean {
  const n = submissionCount ?? 0
  return maxClaimers > 0 && n >= maxClaimers * OVERSUBSCRIBED_RATIO
}

/**
 * Stamp each mission with its slot tally.
 *
 * Two numbers, deliberately kept apart:
 *  - approved_claimers  slots actually paid out. Drives the progress bar.
 *  - submission_count   operatives competing. Drives the "N submitted" label
 *                       and fills nothing — submitting reserves no slot.
 *
 * Rejected claims are excluded from both: they are out of the running, and
 * counting them would inflate the competition a mission appears to have.
 */
export async function attachClaimCounts(
  supabase: SupabaseClient,
  missions: Mission[]
): Promise<void> {
  const taskIds = missions.map((m) => m.id)
  if (taskIds.length === 0) return

  const { data } = await supabase
    .from('task_claims')
    .select('task_id, status')
    .in('task_id', taskIds)
    .in('status', ['submitted', 'approved'])

  const approved: Record<string, number> = {}
  const submitted: Record<string, number> = {}

  for (const row of data ?? []) {
    submitted[row.task_id] = (submitted[row.task_id] ?? 0) + 1
    if (row.status === 'approved') {
      approved[row.task_id] = (approved[row.task_id] ?? 0) + 1
    }
  }

  missions.forEach((m) => {
    m.approved_claimers = approved[m.id] ?? 0
    m.submission_count = submitted[m.id] ?? 0
  })
}
