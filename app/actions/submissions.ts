"use server"

import { createClient } from "@/lib/supabase/server"

export type ProofUrl = {
  id: string
  url: string
  created_at: string
}

export async function getTaskProofs(
  taskId: string,
  userId?: string
): Promise<ProofUrl[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from("task_proofs")
    .select("id, url, created_at")
    .eq("task_id", taskId)

  // Scope to a single operative's submission when reviewing one claim.
  if (userId) {
    query = query.eq("submitted_by", userId)
  }

  const { data } = await query.order("created_at", { ascending: true })

  return (data ?? []) as ProofUrl[]
}
