"use server"

import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Completed-mission count per user, correct for both claim models.
 *
 * UNION of:
 *   1. Legacy single-claimer completions — tasks.status = 'completed'
 *      with tasks.claimed_by = user (rows that predate task_claims).
 *   2. Multi-claimer completions — task_claims.status = 'approved'.
 *
 * Deduped by (user_id, task_id) so a task present in both sources
 * (a single-claimer task that also has an approved claim row) counts once.
 *
 * Admin client — aggregates across every user, bypassing RLS.
 */
export async function getCompletedCounts(
  userIds: string[]
): Promise<Record<string, number>> {
  if (userIds.length === 0) return {}

  const admin = createAdminClient()

  // user_id -> set of task_ids they have completed
  const byUser: Record<string, Set<string>> = {}
  const add = (userId: string | null, taskId: string | null) => {
    if (!userId || !taskId) return
    ;(byUser[userId] ??= new Set()).add(taskId)
  }

  const [legacyRes, claimsRes] = await Promise.all([
    admin
      .from("tasks")
      .select("id, claimed_by")
      .in("claimed_by", userIds)
      .eq("status", "completed"),
    admin
      .from("task_claims")
      .select("task_id, user_id")
      .in("user_id", userIds)
      .eq("status", "approved"),
  ])

  legacyRes.data?.forEach((t) => add(t.claimed_by, t.id))
  claimsRes.data?.forEach((c) => add(c.user_id, c.task_id))

  const result: Record<string, number> = {}
  for (const [userId, taskIds] of Object.entries(byUser)) {
    result[userId] = taskIds.size
  }
  return result
}
