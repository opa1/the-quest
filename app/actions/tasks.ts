"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendAdaPayoutViaService } from "@/lib/cardano/server"
import { verifyDepositCoversBounty } from "@/lib/cardano/verify-deposit"
import { createAdminClient } from "@/lib/supabase/admin"
import { getActiveNetwork } from "@/lib/config/network.server"
import { type Network } from "@/lib/config/network"
import { createNotification } from "@/lib/utils/notify"
import { formatAda } from "@/lib/utils/currency"

// Claim rows that still occupy a slot on the mission. A "rejected" claim frees
// its slot so the poster (or another operative) can take it again.
const ACTIVE_CLAIM_STATUSES = ["claimed", "submitted", "approved"] as const

type AdminClient = ReturnType<typeof createAdminClient>

// Recompute a multi-claimer task's status from its claim rows.
// Single-claimer (max_claimers === 1) tasks keep the legacy explicit
// transitions (open -> claimed -> submitted -> completed) and never call this.
async function recomputeMultiTaskState(
  admin: AdminClient,
  taskId: string,
  maxClaimers: number
) {
  const { data: claims } = await admin
    .from("task_claims")
    .select("status")
    .eq("task_id", taskId)

  const rows = claims ?? []
  const active = rows.filter((c) =>
    (ACTIVE_CLAIM_STATUSES as readonly string[]).includes(c.status)
  ).length
  const approved = rows.filter((c) => c.status === "approved").length

  const now = new Date().toISOString()
  const update: Record<string, unknown> = { updated_at: now }

  if (approved >= maxClaimers) {
    update.status = "completed"
    update.completed_at = now
  } else if (active >= maxClaimers) {
    update.status = "claimed"
  } else {
    update.status = "open"
  }

  await admin.from("tasks").update(update).eq("id", taskId)
}

export async function claimTask(taskId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "not_authenticated" }

  const admin = createAdminClient(await getActiveNetwork())

  const { data: task } = await admin
    .from("tasks")
    .select("id, title, status, created_by, max_claimers")
    .eq("id", taskId)
    .single()

  if (!task)
    return {
      error: "task_not_found",
      message: "This mission no longer exists.",
    }
  if (task.created_by === user.id)
    return {
      error: "cannot_claim_own_task",
      message: "You cannot claim a mission you posted.",
    }

  const maxClaimers = task.max_claimers ?? 1

  // Ban gate - a poster can bar an operative from a mission.
  const { data: ban } = await admin
    .from("task_bans")
    .select("id")
    .eq("task_id", taskId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (ban)
    return {
      error: "banned",
      message: "You are not permitted to claim this mission.",
    }

  // One claim row per (task, user) - the table's unique constraint enforces it.
  const { data: existingClaim } = await admin
    .from("task_claims")
    .select("id, status")
    .eq("task_id", taskId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingClaim && existingClaim.status !== "rejected")
    return {
      error: "already_claimed",
      message: "You have already claimed this mission.",
    }

  // Slot check - count claims that still occupy a slot.
  const { data: claims } = await admin
    .from("task_claims")
    .select("status")
    .eq("task_id", taskId)

  const activeCount = (claims ?? []).filter((c) =>
    (ACTIVE_CLAIM_STATUSES as readonly string[]).includes(c.status)
  ).length

  if (activeCount >= maxClaimers)
    return {
      error: "task_full",
      message: "All slots for this mission have already been filled.",
    }

  const now = new Date().toISOString()

  if (existingClaim) {
    // Re-claiming after a rejection: reset the existing row rather than insert
    // (the unique constraint forbids a second row).
    const { error: claimError } = await admin
      .from("task_claims")
      .update({
        status: "claimed",
        claimed_at: now,
        submitted_at: null,
        completed_at: null,
        proof_notes: null,
        proof_image_url: null,
        rejection_reason: null,
        cardano_tx_hash: null,
      })
      .eq("id", existingClaim.id)

    if (claimError)
      return {
        error: "claim_failed",
        message:
          "Something went wrong while claiming this mission. Please try again.",
      }
  } else {
    const { error: claimError } = await admin.from("task_claims").insert({
      task_id: taskId,
      user_id: user.id,
      status: "claimed",
      claimed_at: now,
    })

    if (claimError)
      return {
        error: "claim_failed",
        message:
          "Something went wrong while claiming this mission. Please try again.",
      }
  }

  // Keep tasks.claimed_by in sync for single-claimer missions (backward compat
  // with the record/leaderboard queries). Multi-claimer tasks recompute status.
  if (maxClaimers === 1) {
    await admin
      .from("tasks")
      .update({
        status: "claimed",
        claimed_by: user.id,
        claimed_at: now,
        updated_at: now,
      })
      .eq("id", taskId)
  } else {
    const newActive = activeCount + 1
    await admin
      .from("tasks")
      .update({
        status: newActive >= maxClaimers ? "claimed" : "open",
        updated_at: now,
      })
      .eq("id", taskId)
  }

  await admin.from("task_logs").insert({
    task_id: taskId,
    user_id: user.id,
    action: "claimed",
  })

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath("/missions")
  revalidatePath("/realm")

  await createNotification({
    userId: task.created_by,
    actorId: user.id,
    type: "mission_claimed",
    category: "mission",
    title: "Mission Claimed",
    message: `Someone claimed your mission: "${task.title}"`,
    actionUrl: `/tasks/${taskId}/review`,
  })

  return { success: true }
}

export async function dropTask(taskId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "not_authenticated" }

  const admin = createAdminClient(await getActiveNetwork())

  const { data: task } = await admin
    .from("tasks")
    .select("id, max_claimers")
    .eq("id", taskId)
    .single()

  if (!task)
    return {
      error: "task_not_found",
      message: "This mission no longer exists.",
    }

  const maxClaimers = task.max_claimers ?? 1

  const { data: claim } = await admin
    .from("task_claims")
    .select("id, status")
    .eq("task_id", taskId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!claim || claim.status !== "claimed")
    return {
      error: "not_claimer",
      message: "You do not have an active claim on this mission.",
    }

  const { error: deleteError } = await admin
    .from("task_claims")
    .delete()
    .eq("id", claim.id)

  if (deleteError)
    return {
      error: "drop_failed",
      message:
        "Something went wrong while dropping this mission. Please try again.",
    }

  const now = new Date().toISOString()

  if (maxClaimers === 1) {
    await admin
      .from("tasks")
      .update({
        status: "open",
        claimed_by: null,
        claimed_at: null,
        updated_at: now,
      })
      .eq("id", taskId)
  } else {
    await recomputeMultiTaskState(admin, taskId, maxClaimers)
  }

  await admin.from("task_logs").insert({
    task_id: taskId,
    user_id: user.id,
    action: "cancelled",
  })

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath("/missions")
  revalidatePath("/realm")

  return { success: true }
}

export async function createMission(formData: {
  title: string
  description: string
  category: string
  difficulty: "easy" | "medium" | "hard"
  reward_credits: number
  ada_reward?: number
  proof_type?: string
  deposit_tx_hash?: string
  max_claimers?: number
  reward_per_claimer?: number
  deadline?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "not_authenticated" }

  if (formData.reward_credits < 500 || formData.reward_credits > 10000) {
    return {
      error: "invalid_xp",
      message: "XP reward must be between 500 and 10,000.",
    }
  }

  const maxClaimers = formData.max_claimers ?? 1
  if (maxClaimers < 1 || maxClaimers > 100) {
    return {
      error: "invalid_slots",
      message: "Slot count must be between 1 and 100.",
    }
  }
  if (maxClaimers > 1) {
    const rewardPerClaimer = formData.reward_per_claimer ?? 0
    if (rewardPerClaimer < 5_000_000) {
      return {
        error: "min_reward",
        message: "Minimum reward per person is 5 ADA.",
      }
    }
  }
  if (formData.deadline) {
    const deadline = new Date(formData.deadline)
    const now = new Date()
    if (deadline < new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      return {
        error: "deadline_too_soon",
        message: "Deadline must be at least 24 hours from now.",
      }
    }
    if (deadline > new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)) {
      return {
        error: "deadline_too_far",
        message: "Deadline cannot be more than 3 months from now.",
      }
    }
  }

  // One on-chain deposit funds exactly one mission. Without this, a poster
  // could reference the same deposit tx across N missions and the platform
  // would pay out N times for a single escrow. (The solvency of each deposit
  // is verified on-chain at payout/refund time — see verifyDepositCoversBounty.)
  if (formData.deposit_tx_hash) {
    const admin = createAdminClient(await getActiveNetwork())
    const { data: existingDeposit } = await admin
      .from("tasks")
      .select("id")
      .eq("deposit_tx_hash", formData.deposit_tx_hash)
      .maybeSingle()
    if (existingDeposit) {
      return {
        error: "deposit_reused",
        message: "This escrow deposit has already been used for another mission.",
      }
    }
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      difficulty: formData.difficulty,
      reward_credits: formData.reward_credits,
      ada_reward: formData.ada_reward
        ? Math.round(formData.ada_reward * 1_000_000)
        : 0,
      proof_type: formData.proof_type ?? "any",
      deposit_tx_hash: formData.deposit_tx_hash ?? null,
      max_claimers: maxClaimers,
      reward_per_claimer: formData.reward_per_claimer ?? 0,
      deadline: formData.deadline ?? null,
      status: "open",
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("[createMission] insert failed:", error)
    return { error: "create_failed", message: error.message }
  }

  await supabase.from("task_logs").insert({
    task_id: task.id,
    user_id: user.id,
    action: "created",
  })

  revalidatePath("/missions")
  revalidatePath("/realm")

  return { success: true, taskId: task.id }
}

export async function submitWork(
  taskId: string,
  data: { urls?: string[]; notes?: string; imageUrl?: string }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return { error: "not_authenticated", message: "You must be signed in." }

  const admin = createAdminClient(await getActiveNetwork())

  const { data: task } = await admin
    .from("tasks")
    .select("id, title, created_by, max_claimers")
    .eq("id", taskId)
    .single()

  if (!task) return { error: "not_found", message: "Mission not found." }

  const maxClaimers = task.max_claimers ?? 1

  const { data: claim } = await admin
    .from("task_claims")
    .select("id, status")
    .eq("task_id", taskId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!claim)
    return {
      error: "not_claimer",
      message: "You have not claimed this mission.",
    }
  if (claim.status !== "claimed")
    return {
      error: "invalid_status",
      message: "This claim cannot accept a submission right now.",
    }

  const { data: ban } = await admin
    .from("task_bans")
    .select("id")
    .eq("task_id", taskId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (ban)
    return {
      error: "banned",
      message: "You are not permitted to submit to this mission.",
    }

  const now = new Date().toISOString()

  const { error: claimError } = await admin
    .from("task_claims")
    .update({
      status: "submitted",
      proof_notes: data.notes ?? null,
      proof_image_url: data.imageUrl ?? null,
      submitted_at: now,
    })
    .eq("id", claim.id)

  if (claimError) {
    console.error('[submitWork] task_claims update failed:', claimError)
    return {
      error: "update_failed",
      message: `Failed to submit proof: ${claimError.message}`,
    }
  }

  // Proof URLs stay in task_proofs, scoped per-operative by submitted_by.
  if (data.urls && data.urls.length > 0) {
    await admin
      .from("task_proofs")
      .delete()
      .eq("task_id", taskId)
      .eq("submitted_by", user.id)
    const rows = data.urls.slice(0, 3).map((url) => ({
      task_id: taskId,
      submitted_by: user.id,
      url,
    }))
    await admin.from("task_proofs").insert(rows)
  }

  // Mirror onto the task row for single-claimer missions so the legacy
  // task-level proof reads keep working.
  if (maxClaimers === 1) {
    await admin
      .from("tasks")
      .update({
        status: "submitted",
        proof_notes: data.notes ?? null,
        proof_image_url: data.imageUrl ?? null,
        updated_at: now,
      })
      .eq("id", taskId)
  }

  await admin.from("task_logs").insert({
    task_id: taskId,
    user_id: user.id,
    action: "submitted",
  })

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath("/missions")
  revalidatePath("/realm")

  await createNotification({
    userId: task.created_by,
    actorId: user.id,
    type: "proof_submitted",
    category: "mission",
    title: "Proof Submitted",
    message: `Someone submitted proof for your mission: "${task.title}"`,
    actionUrl: `/tasks/${taskId}/review?claim=${claim.id}`,
  })

  return { success: true }
}

export async function approveWork(taskId: string, claimId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return { error: "not_authenticated", message: "You must be signed in." }

  const network = await getActiveNetwork()
  const admin = createAdminClient(network)

  const { data: task } = await admin
    .from("tasks")
    .select(
      "id, title, created_by, reward_credits, ada_reward, max_claimers, reward_per_claimer, deposit_tx_hash"
    )
    .eq("id", taskId)
    .single()

  if (!task) return { error: "not_found", message: "Mission not found." }
  if (task.created_by !== user.id)
    return {
      error: "not_poster",
      message: "Only the mission poster can approve submissions.",
    }

  const { data: claim } = await admin
    .from("task_claims")
    .select("id, status, user_id")
    .eq("id", claimId)
    .eq("task_id", taskId)
    .single()

  if (!claim) return { error: "not_found", message: "Submission not found." }
  if (claim.status !== "submitted")
    return { error: "invalid_status", message: "No submission to approve." }

  const maxClaimers = task.max_claimers ?? 1
  let payoutTxHash: string | null = null

  if (task.ada_reward && task.ada_reward > 0 && claim.user_id) {
    const { data: claimerProfile } = await admin
      .from("profiles")
      .select("credits, wallet_address")
      .eq("id", claim.user_id)
      .single()

    if (!claimerProfile?.wallet_address) {
      return {
        error: "no_wallet",
        message:
          "Claimer has not linked a Cardano wallet. Cannot release payment.",
      }
    }

    // Never release ADA the platform never received: confirm on-chain that the
    // poster's escrow deposit covers this mission's full bounty. Fails closed.
    const totalBounty =
      maxClaimers > 1
        ? maxClaimers * (task.reward_per_claimer ?? 0)
        : task.ada_reward
    const depositCheck = await verifyDepositCoversBounty(
      task.deposit_tx_hash,
      totalBounty,
      network
    )
    if (!depositCheck.ok) {
      return { error: depositCheck.error, message: depositCheck.message }
    }

    // Atomically claim this payout attempt so a concurrent/retried approval
    // can't send two payouts for the same claim.
    const { data: lockedClaim } = await admin
      .from("task_claims")
      .update({ payout_status: "pending" })
      .eq("id", claim.id)
      .eq("status", "submitted")
      .or("payout_status.is.null,payout_status.eq.failed")
      .select("id")

    if (!lockedClaim || lockedClaim.length === 0) {
      return {
        error: "payout_in_progress",
        message: "A payout is already being processed for this submission.",
      }
    }

    const payoutResult = await sendAdaPayout(
      claimerProfile.wallet_address,
      task.ada_reward,
      network
    )
    if ("error" in payoutResult) {
      await admin
        .from("task_claims")
        .update({
          payout_status: "failed",
          payout_last_error: payoutResult.message ?? payoutResult.error,
        })
        .eq("id", claim.id)
      return payoutResult
    }

    payoutTxHash = payoutResult.txHash

    // Persist the tx hash immediately - before touching credits or anything
    // else - so a failure in any later step never loses track of ADA that
    // has already left the wallet.
    await admin
      .from("task_claims")
      .update({ payout_status: "succeeded", cardano_tx_hash: payoutTxHash })
      .eq("id", claim.id)

    await admin
      .from("profiles")
      .update({
        credits: (claimerProfile.credits ?? 0) + (task.reward_credits ?? 0),
      })
      .eq("id", claim.user_id)
  } else if (claim.user_id && task.reward_credits) {
    const { data: claimerProfile } = await admin
      .from("profiles")
      .select("credits")
      .eq("id", claim.user_id)
      .single()

    await admin
      .from("profiles")
      .update({ credits: (claimerProfile?.credits ?? 0) + task.reward_credits })
      .eq("id", claim.user_id)
  }

  const now = new Date().toISOString()

  const { error: claimError } = await admin
    .from("task_claims")
    .update({
      status: "approved",
      completed_at: now,
      cardano_tx_hash: payoutTxHash,
    })
    .eq("id", claim.id)

  if (claimError)
    return {
      error: "update_failed",
      message: "Something went wrong. Please try again.",
    }

  await admin.from("task_logs").insert({
    task_id: taskId,
    user_id: claim.user_id,
    action: "completed",
    cardano_tx_hash: payoutTxHash,
  })

  if (maxClaimers === 1) {
    await admin
      .from("tasks")
      .update({
        status: "completed",
        completed_at: now,
        updated_at: now,
      })
      .eq("id", taskId)
  } else {
    await recomputeMultiTaskState(admin, taskId, maxClaimers)
  }

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath("/missions")
  revalidatePath("/realm")
  revalidatePath("/leaderboard")
  revalidatePath("/record")

  if (claim.user_id) {
    const adaText =
      task.ada_reward > 0
        ? ` ${formatAda(task.ada_reward, network)} has been sent to your wallet.`
        : ""
    await createNotification({
      userId: claim.user_id,
      actorId: user.id,
      type: "submission_approved",
      category: "reward",
      title: "Submission Approved",
      message: `Your proof for "${task.title}" was approved.${adaText}`,
      actionUrl: `/tasks/${taskId}`,
    })
  }

  return { success: true }
}

export async function rejectWork(
  taskId: string,
  claimId: string,
  reason?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return { error: "not_authenticated", message: "You must be signed in." }

  const admin = createAdminClient(await getActiveNetwork())

  const { data: task } = await admin
    .from("tasks")
    .select("id, title, created_by, max_claimers")
    .eq("id", taskId)
    .single()

  if (!task) return { error: "not_found", message: "Mission not found." }
  if (task.created_by !== user.id)
    return {
      error: "not_poster",
      message: "Only the mission poster can reject submissions.",
    }

  const { data: claim } = await admin
    .from("task_claims")
    .select("id, status, user_id")
    .eq("id", claimId)
    .eq("task_id", taskId)
    .single()

  if (!claim) return { error: "not_found", message: "Submission not found." }
  if (claim.status !== "submitted")
    return { error: "invalid_status", message: "No submission to reject." }

  const maxClaimers = task.max_claimers ?? 1
  const now = new Date().toISOString()

  const { error: claimError } = await admin
    .from("task_claims")
    .update({
      status: "rejected",
      rejection_reason: reason ?? null,
    })
    .eq("id", claim.id)

  if (claimError)
    return {
      error: "update_failed",
      message: "Something went wrong. Please try again.",
    }

  // Clear this operative's proof URLs; other claimers' proofs are untouched.
  await admin
    .from("task_proofs")
    .delete()
    .eq("task_id", taskId)
    .eq("submitted_by", claim.user_id)

  // The task itself returns to 'open' (the slot reopens); it is never marked
  // 'rejected'. Single-claimer missions clear their mirrored proof fields.
  if (maxClaimers === 1) {
    await admin
      .from("tasks")
      .update({
        status: "open",
        claimed_by: null,
        claimed_at: null,
        proof_notes: null,
        proof_image_url: null,
        updated_at: now,
      })
      .eq("id", taskId)
  } else {
    await recomputeMultiTaskState(admin, taskId, maxClaimers)
  }

  await admin.from("task_logs").insert({
    task_id: taskId,
    user_id: claim.user_id,
    action: "cancelled",
  })

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath("/missions")
  revalidatePath("/realm")

  if (claim.user_id) {
    await createNotification({
      userId: claim.user_id,
      actorId: user.id,
      type: "submission_rejected",
      category: "mission",
      title: "Submission Rejected",
      message: `Your proof for "${task.title}" was rejected. Review the feedback and resubmit.`,
      actionUrl: `/tasks/${taskId}/submit`,
    })
  }

  return { success: true }
}

export async function banUser(
  taskId: string,
  targetUserId: string,
  reason?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return { error: "not_authenticated", message: "You must be signed in." }

  const { data: task } = await supabase
    .from("tasks")
    .select("id, created_by")
    .eq("id", taskId)
    .single()

  if (!task) return { error: "not_found", message: "Mission not found." }
  if (task.created_by !== user.id)
    return {
      error: "not_poster",
      message: "Only the mission poster can ban users.",
    }
  if (targetUserId === user.id)
    return { error: "cannot_self_ban", message: "You cannot ban yourself." }

  await supabase
    .from("task_bans")
    .upsert(
      { task_id: taskId, user_id: targetUserId, reason: reason ?? null },
      { onConflict: "task_id,user_id", ignoreDuplicates: true }
    )

  revalidatePath(`/tasks/${taskId}/review`)

  return { success: true }
}

export async function markTaskNotificationsRead(taskId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const adminClient = createAdminClient(await getActiveNetwork())
  // Match both `/tasks/{id}/review` and `/tasks/{id}/review?claim=…`.
  await adminClient
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .like("action_url", `/tasks/${taskId}/review%`)
    .eq("read", false)
}

// Columns closeAndRefundUnfilled needs to do its job.
const REFUND_TASK_COLUMNS =
  "id, title, created_by, max_claimers, reward_per_claimer, ada_reward, status, deadline, refund_status, deposit_tx_hash"

type RefundableTask = {
  id: string
  title: string
  created_by: string
  max_claimers: number | null
  reward_per_claimer: number | null
  ada_reward: number | null
  status: string
  refund_status: string | null
  deposit_tx_hash: string | null
}

/**
 * Close a task and refund every slot nobody was ever paid for.
 *
 * Shared by the deadline cron and the poster's manual close. Those two differ
 * only in what authorises them and what the poster gets told afterwards — the
 * way money moves must not diverge, which is why this lives in one place.
 *
 * Refunds cover max_claimers minus approved claims, fail closed if the on-chain
 * deposit doesn't cover the bounty, and are guarded by the refund_status lock so
 * a retry or a concurrent call can never send the same refund twice. Callers are
 * responsible for their own preconditions (deadline reached, caller is poster).
 */
async function closeAndRefundUnfilled(
  adminClient: AdminClient,
  task: RefundableTask,
  network: Network,
  trigger: "deadline" | "poster"
): Promise<{ success: boolean; refundAmount?: number; error?: string }> {
  const taskId = task.id
  const isClosed = task.status === "completed" || task.status === "cancelled"

  // Count approved claims
  const { count: approvedCount } = await adminClient
    .from("task_claims")
    .select("id", { count: "exact", head: true })
    .eq("task_id", taskId)
    .eq("status", "approved")

  const totalSlots = task.max_claimers ?? 1
  const filledSlots = approvedCount ?? 0
  const unfilledSlots = totalSlots - filledSlots

  // Close the task for new claims. This only needs to happen once - closing
  // is independent of whether the refund below succeeds, so it no longer
  // gates retries.
  if (!isClosed) {
    await adminClient
      .from("tasks")
      .update({
        status: unfilledSlots === 0 ? "completed" : "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
  }

  if (unfilledSlots <= 0) return { success: true, refundAmount: 0 }

  // Calculate refund amount
  const rewardPerClaimer = task.reward_per_claimer ?? task.ada_reward ?? 0
  const refundLovelace = unfilledSlots * rewardPerClaimer

  if (refundLovelace <= 0) return { success: true, refundAmount: 0 }

  const { data: poster } = await adminClient
    .from("profiles")
    .select("wallet_address")
    .eq("id", task.created_by)
    .single()

  if (!poster?.wallet_address) {
    await adminClient
      .from("tasks")
      .update({ refund_status: "failed", refund_last_error: "poster_no_wallet" })
      .eq("id", taskId)
    return { success: false, error: "poster_no_wallet" }
  }

  // Never refund ADA the platform never received: confirm on-chain that the
  // escrow deposit covered the full bounty before sending anything back.
  const totalBounty = totalSlots * rewardPerClaimer
  const depositCheck = await verifyDepositCoversBounty(
    task.deposit_tx_hash,
    totalBounty,
    network
  )
  if (!depositCheck.ok) {
    await adminClient
      .from("tasks")
      .update({
        refund_status: "failed",
        refund_last_error: depositCheck.error,
      })
      .eq("id", taskId)
    return { success: false, error: depositCheck.error }
  }

  // Atomically claim this refund attempt so a concurrent/retried invocation
  // can't send two refunds for the same task.
  const { data: lockedTask } = await adminClient
    .from("tasks")
    .update({ refund_status: "pending" })
    .eq("id", taskId)
    .or("refund_status.is.null,refund_status.eq.failed")
    .select("id")

  if (!lockedTask || lockedTask.length === 0)
    return { success: false, error: "refund_already_in_progress" }

  try {
    const refundResult = await sendAdaPayoutViaService(
      poster.wallet_address,
      refundLovelace,
      network
    )
    if ("txHash" in refundResult) {
      await adminClient
        .from("tasks")
        .update({ refund_status: "succeeded" })
        .eq("id", taskId)
      await adminClient.from("task_logs").insert({
        task_id: taskId,
        user_id: task.created_by,
        action: "cancelled",
        notes: `${trigger === "deadline" ? "Deadline refund" : "Mission closed by poster"}: ${unfilledSlots} unfilled slot${unfilledSlots > 1 ? "s" : ""}`,
        cardano_tx_hash: refundResult.txHash,
      })
    } else {
      await adminClient
        .from("tasks")
        .update({ refund_status: "failed", refund_last_error: refundResult.message ?? refundResult.error })
        .eq("id", taskId)
      return { success: false, error: "refund_failed" }
    }
  } catch (err) {
    console.error("Refund payout failed:", err)
    await adminClient
      .from("tasks")
      .update({
        refund_status: "failed",
        refund_last_error: err instanceof Error ? err.message : "unknown_error",
      })
      .eq("id", taskId)
    return { success: false, error: "refund_failed" }
  }

  // Notify poster - only reached once the refund has actually succeeded.
  const slotLabel = `${unfilledSlots} unfilled slot${unfilledSlots > 1 ? "s" : ""}`
  await createNotification({
    userId: task.created_by,
    network,
    type: "deadline_refund",
    category: "reward",
    title:
      trigger === "deadline" ? "Mission Deadline Reached" : "Mission Closed",
    message:
      trigger === "deadline"
        ? `Your mission "${task.title}" deadline passed. ${slotLabel} refunded.`
        : `You closed "${task.title}". ${slotLabel} refunded to your wallet.`,
    actionUrl: `/tasks/${taskId}`,
  })

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath("/missions")
  revalidatePath("/realm")

  return { success: true, refundAmount: refundLovelace }
}

/**
 * Poster pulls a live mission and takes back the ADA for slots nobody was paid
 * for. Without this the money is stranded: rejecting a submission reopens the
 * slot but nothing refunds it, and before this existed the only route to a
 * refund was waiting out the deadline — which a mission posted without one
 * never reaches.
 *
 * Submissions still awaiting review are rejected first, so their slots count as
 * unfilled and come back in the refund. Anything already approved is left
 * alone: that ADA has left the wallet and is not ours to reclaim.
 */
export async function closeMission(taskId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return { error: "not_authenticated", message: "You must be signed in." }

  const network = await getActiveNetwork()
  const admin = createAdminClient(network)

  const { data: task } = await admin
    .from("tasks")
    .select(REFUND_TASK_COLUMNS)
    .eq("id", taskId)
    .single<RefundableTask>()

  if (!task) return { error: "not_found", message: "Mission not found." }
  if (task.created_by !== user.id)
    return {
      error: "not_poster",
      message: "Only the mission poster can close it.",
    }

  // An already-closed mission is only re-closable to retry a refund that failed
  // — pressing Close again is the poster's retry. Nothing else retries this:
  // the cron only refunds missions whose deadline has passed, so a mission
  // posted without one would strand its ADA on a single failure.
  const isClosed = task.status === "completed" || task.status === "cancelled"
  if (isClosed && task.refund_status !== "failed")
    return { error: "already_closed", message: "This mission is already closed." }

  // Reject anything still in review so its slot is refundable. Done before the
  // refund is priced, since closeAndRefundUnfilled counts approved claims to
  // decide what is owed back.
  const { data: pending } = await admin
    .from("task_claims")
    .select("id, user_id")
    .eq("task_id", taskId)
    .eq("status", "submitted")

  for (const claim of pending ?? []) {
    await admin
      .from("task_claims")
      .update({
        status: "rejected",
        rejection_reason: "The poster closed this mission before review.",
      })
      .eq("id", claim.id)

    if (claim.user_id) {
      await admin
        .from("task_proofs")
        .delete()
        .eq("task_id", taskId)
        .eq("submitted_by", claim.user_id)

      // They did the work and are getting nothing, so say so plainly rather
      // than letting the submission quietly vanish.
      await createNotification({
        userId: claim.user_id,
        actorId: user.id,
        network,
        type: "submission_rejected",
        category: "mission",
        title: "Mission Closed",
        message: `"${task.title}" was closed by the poster before your submission was reviewed.`,
        actionUrl: `/tasks/${taskId}`,
      })
    }
  }

  const result = await closeAndRefundUnfilled(admin, task, network, "poster")
  if (!result.success)
    return {
      error: result.error ?? "close_failed",
      message:
        "The mission is closed, but the refund did not go through. Press Close again to retry it.",
    }

  return { success: true as const, refundAmount: result.refundAmount ?? 0 }
}

export async function processDeadlineRefund(
  taskId: string,
  // Non-request context (cron): the caller passes the task's own network.
  network: Network = "Preprod"
): Promise<{ success: boolean; refundAmount?: number; error?: string }> {
  const adminClient = createAdminClient(network)

  const { data: task } = await adminClient
    .from("tasks")
    .select(REFUND_TASK_COLUMNS)
    .eq("id", taskId)
    .single<RefundableTask & { deadline: string | null }>()

  if (!task) return { success: false, error: "not_found" }
  if (!task.deadline || new Date(task.deadline) > new Date())
    return { success: false, error: "deadline_not_reached" }

  // Closed and either no refund was ever needed, or it already succeeded -
  // nothing left to do. A closed task with a pending/failed refund_status
  // still needs to be retried below.
  const isClosed = task.status === "completed" || task.status === "cancelled"
  if (isClosed && task.refund_status !== "pending" && task.refund_status !== "failed")
    return { success: false, error: "already_closed" }

  return closeAndRefundUnfilled(adminClient, task, network, "deadline")
}

async function sendAdaPayout(
  claimerWalletAddress: string,
  adaReward: number,
  network: Network
): Promise<{ txHash: string } | { error: string; message: string }> {
  return sendAdaPayoutViaService(claimerWalletAddress, adaReward, network)
}
