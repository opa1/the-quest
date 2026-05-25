'use server'

import { createClient } from '@/lib/supabase/server'

export type ProofUrl = {
  id: string
  url: string
  created_at: string
}

export async function getTaskProofs(taskId: string): Promise<ProofUrl[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('task_proofs')
    .select('id, url, created_at')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  return (data ?? []) as ProofUrl[]
}
