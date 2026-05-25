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

  if (!task) return { error: 'task_not_found', message: 'This mission no longer exists.' }
  if (task.status !== 'open') return { error: 'task_not_open', message: 'This mission has already been claimed by someone else.' }
  if (task.created_by === user.id) return { error: 'cannot_claim_own_task', message: 'You cannot claim a mission you posted.' }

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'claimed',
      claimed_by: user.id,
      claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (updateError) return { error: 'claim_failed', message: 'Something went wrong while claiming this mission. Please try again.' }

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

  if (!task) return { error: 'task_not_found', message: 'This mission no longer exists.' }
  if (task.claimed_by !== user.id) return { error: 'not_claimer', message: 'You have not claimed this mission.' }
  if (task.status !== 'claimed') return { error: 'task_not_claimed', message: 'This mission is not currently claimed.' }

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'open',
      claimed_by: null,
      claimed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (updateError) return { error: 'drop_failed', message: 'Something went wrong while dropping this mission. Please try again.' }

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

export async function createMission(formData: {
  title: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  ada_reward?: number
  proof_type?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated' }

  const creditMap = { easy: 400, medium: 1200, hard: 3000 }

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      difficulty: formData.difficulty,
      reward_credits: creditMap[formData.difficulty],
      ada_reward: formData.ada_reward ? Math.round(formData.ada_reward * 1_000_000) : 0,
      proof_type: formData.proof_type ?? 'any',
      status: 'open',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: 'create_failed' }

  await supabase.from('task_logs').insert({
    task_id: task.id,
    user_id: user.id,
    action: 'created',
  })

  revalidatePath('/missions')
  revalidatePath('/realm')

  return { success: true, taskId: task.id }
}

export async function submitWork(
  taskId: string,
  data: { urls?: string[]; notes?: string; imageUrl?: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated', message: 'You must be signed in.' }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, status, claimed_by, proof_type')
    .eq('id', taskId)
    .single()

  if (!task) return { error: 'not_found', message: 'Mission not found.' }
  if (task.claimed_by !== user.id) return { error: 'not_claimer', message: 'You have not claimed this mission.' }
  if (task.status !== 'claimed') return { error: 'invalid_status', message: 'This mission cannot accept a submission right now.' }

  const { data: ban } = await supabase
    .from('task_bans')
    .select('id')
    .eq('task_id', taskId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (ban) return { error: 'banned', message: 'You are not permitted to submit to this mission.' }

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'submitted',
      proof_notes: data.notes ?? null,
      proof_image_url: data.imageUrl ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (updateError) return { error: 'update_failed', message: 'Something went wrong. Please try again.' }

  if (data.urls && data.urls.length > 0) {
    await supabase.from('task_proofs').delete().eq('task_id', taskId)
    const rows = data.urls.slice(0, 3).map((url) => ({
      task_id: taskId,
      submitted_by: user.id,
      url,
    }))
    await supabase.from('task_proofs').insert(rows)
  }

  await supabase.from('task_logs').insert({
    task_id: taskId,
    user_id: user.id,
    action: 'submitted',
  })

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/missions')
  revalidatePath('/realm')

  return { success: true }
}

export async function approveWork(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated', message: 'You must be signed in.' }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, status, created_by, claimed_by, reward_credits')
    .eq('id', taskId)
    .single()

  if (!task) return { error: 'not_found', message: 'Mission not found.' }
  if (task.created_by !== user.id) return { error: 'not_poster', message: 'Only the mission poster can approve submissions.' }
  if (task.status !== 'submitted') return { error: 'invalid_status', message: 'No submission to approve.' }

  const { error: taskError } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (taskError) return { error: 'update_failed', message: 'Something went wrong. Please try again.' }

  if (task.claimed_by && task.reward_credits) {
    const { data: claimer } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', task.claimed_by)
      .single()

    await supabase
      .from('profiles')
      .update({ credits: (claimer?.credits ?? 0) + task.reward_credits })
      .eq('id', task.claimed_by)
  }

  await supabase.from('task_logs').insert({
    task_id: taskId,
    user_id: user.id,
    action: 'completed',
    cardano_tx_hash: null,
  })

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/missions')
  revalidatePath('/realm')
  revalidatePath('/leaderboard')
  revalidatePath('/record')

  return { success: true }
}

export async function rejectWork(taskId: string, reason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated', message: 'You must be signed in.' }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, status, created_by')
    .eq('id', taskId)
    .single()

  if (!task) return { error: 'not_found', message: 'Mission not found.' }
  if (task.created_by !== user.id) return { error: 'not_poster', message: 'Only the mission poster can reject submissions.' }
  if (task.status !== 'submitted') return { error: 'invalid_status', message: 'No submission to reject.' }

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'open',
      claimed_by: null,
      claimed_at: null,
      proof_notes: null,
      proof_image_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (updateError) return { error: 'update_failed', message: 'Something went wrong. Please try again.' }

  await supabase.from('task_proofs').delete().eq('task_id', taskId)

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

export async function banUser(taskId: string, targetUserId: string, reason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated', message: 'You must be signed in.' }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, created_by')
    .eq('id', taskId)
    .single()

  if (!task) return { error: 'not_found', message: 'Mission not found.' }
  if (task.created_by !== user.id) return { error: 'not_poster', message: 'Only the mission poster can ban users.' }
  if (targetUserId === user.id) return { error: 'cannot_self_ban', message: 'You cannot ban yourself.' }

  await supabase
    .from('task_bans')
    .upsert(
      { task_id: taskId, user_id: targetUserId, reason: reason ?? null },
      { onConflict: 'task_id,user_id', ignoreDuplicates: true }
    )

  revalidatePath(`/tasks/${taskId}/review`)

  return { success: true }
}
