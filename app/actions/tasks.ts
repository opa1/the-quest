'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'not_authenticated' }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, status, created_by')
    .eq('id', taskId)
    .single()

  if (!task) return { error: 'task_not_found' }
  if (task.status !== 'open') return { error: 'task_not_open' }
  if (task.created_by === user.id) return { error: 'cannot_claim_own_task' }

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'claimed',
      claimed_by: user.id,
      claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (updateError) return { error: 'claim_failed' }

  await supabase.from('task_logs').insert({
    task_id: taskId,
    user_id: user.id,
    action: 'claimed',
  })

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/missions')
  revalidatePath('/realm')

  return { success: true }
}

export async function dropTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'not_authenticated' }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, status, claimed_by')
    .eq('id', taskId)
    .single()

  if (!task) return { error: 'task_not_found' }
  if (task.claimed_by !== user.id) return { error: 'not_claimer' }
  if (task.status !== 'claimed') return { error: 'task_not_claimed' }

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'open',
      claimed_by: null,
      claimed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (updateError) return { error: 'drop_failed' }

  await supabase.from('task_logs').insert({
    task_id: taskId,
    user_id: user.id,
    action: 'cancelled',
  })

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/missions')
  revalidatePath('/realm')

  return { success: true }
}
