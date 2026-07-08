import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  createFakeDb,
  createFakeClient,
  createFakeServerClient,
  injectFailure,
  type FakeDb,
  type FakeRow,
} from "@/test/support/fake-supabase"

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}))
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))
vi.mock("@/lib/cardano/server", () => ({
  sendAdaPayoutViaService: vi.fn(),
}))
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { sendAdaPayoutViaService } from "@/lib/cardano/server"
import {
  claimTask,
  dropTask,
  submitWork,
  approveWork,
  rejectWork,
  banUser,
  processDeadlineRefund,
} from "@/app/actions/tasks"

let db: FakeDb

beforeEach(() => {
  db = createFakeDb()
  vi.mocked(createAdminClient).mockReturnValue(createFakeClient(db) as never)
  vi.mocked(sendAdaPayoutViaService).mockReset()
})

function asUser(userId: string | null) {
  const user = userId ? { id: userId } : null
  vi.mocked(createClient).mockResolvedValue(createFakeServerClient(db, user) as never)
}

function seedTask(overrides: Partial<FakeRow> = {}): FakeRow {
  const now = new Date().toISOString()
  const row: FakeRow = {
    id: "task-1",
    title: "Test Mission",
    description: "desc",
    category: "general",
    difficulty: "easy",
    reward_credits: 500,
    ada_reward: 0,
    proof_type: "any",
    deposit_tx_hash: null,
    max_claimers: 1,
    reward_per_claimer: 0,
    deadline: null,
    status: "open",
    created_by: "poster-1",
    claimed_by: null,
    claimed_at: null,
    completed_at: null,
    proof_notes: null,
    proof_image_url: null,
    refund_status: null,
    refund_last_error: null,
    updated_at: now,
    created_at: now,
    ...overrides,
  }
  db.tasks = db.tasks ?? []
  db.tasks.push(row)
  return row
}

function seedClaim(overrides: Partial<FakeRow> = {}): FakeRow {
  const now = new Date().toISOString()
  const row: FakeRow = {
    id: "claim-1",
    task_id: "task-1",
    user_id: "claimer-1",
    status: "submitted",
    claimed_at: now,
    submitted_at: now,
    completed_at: null,
    proof_notes: null,
    proof_image_url: null,
    rejection_reason: null,
    cardano_tx_hash: null,
    payout_status: null,
    payout_last_error: null,
    ...overrides,
  }
  db.task_claims = db.task_claims ?? []
  db.task_claims.push(row)
  return row
}

function seedProfile(overrides: Partial<FakeRow> = {}): FakeRow {
  const row: FakeRow = {
    id: "claimer-1",
    username: "claimer",
    credits: 0,
    wallet_address: "addr_test1claimer",
    ...overrides,
  }
  db.profiles = db.profiles ?? []
  db.profiles.push(row)
  return row
}

function findRow(table: string, id: string): FakeRow | undefined {
  return (db[table] ?? []).find((r) => r.id === id)
}

const PAST_DEADLINE = new Date(Date.now() - 60_000).toISOString()

describe("processDeadlineRefund", () => {
  it("closes a fully-filled task without attempting a refund", async () => {
    seedTask({ id: "t1", status: "open", deadline: PAST_DEADLINE, max_claimers: 1 })
    seedClaim({ task_id: "t1", status: "approved" })

    const result = await processDeadlineRefund("t1")

    expect(result).toEqual({ success: true, refundAmount: 0 })
    expect(findRow("tasks", "t1")?.status).toBe("completed")
    expect(findRow("tasks", "t1")?.refund_status).toBeNull()
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
  })

  it("closes the task and refunds unfilled slots on success", async () => {
    seedTask({
      id: "t1",
      status: "open",
      deadline: PAST_DEADLINE,
      max_claimers: 2,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-123" })

    const result = await processDeadlineRefund("t1")

    expect(result).toEqual({ success: true, refundAmount: 20_000_000 })
    const task = findRow("tasks", "t1")
    expect(task?.status).toBe("cancelled")
    expect(task?.refund_status).toBe("succeeded")
    expect(db.task_logs?.some((l) => l.cardano_tx_hash === "tx-123")).toBe(true)
    expect(
      db.notifications?.some((n) => n.user_id === "poster-1" && n.type === "deadline_refund")
    ).toBe(true)
  })

  it("closes the task but does not send a false-positive notification when the payout service errors", async () => {
    seedTask({
      id: "t1",
      status: "open",
      deadline: PAST_DEADLINE,
      max_claimers: 1,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({
      error: "payout_failed",
      message: "insufficient balance",
    })

    const result = await processDeadlineRefund("t1")

    expect(result).toEqual({ success: false, error: "refund_failed" })
    const task = findRow("tasks", "t1")
    expect(task?.status).toBe("cancelled")
    expect(task?.refund_status).toBe("failed")
    expect(task?.refund_last_error).toBe("insufficient balance")
    expect((db.notifications ?? []).some((n) => n.type === "deadline_refund")).toBe(false)
  })

  it("records a failed refund_status when the payout service throws", async () => {
    seedTask({
      id: "t1",
      status: "open",
      deadline: PAST_DEADLINE,
      max_claimers: 1,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockRejectedValueOnce(new Error("network down"))

    const result = await processDeadlineRefund("t1")

    expect(result).toEqual({ success: false, error: "refund_failed" })
    const task = findRow("tasks", "t1")
    expect(task?.status).toBe("cancelled")
    expect(task?.refund_status).toBe("failed")
    expect(task?.refund_last_error).toBe("network down")
  })

  it("allows a retry after a failed refund to succeed", async () => {
    seedTask({
      id: "t1",
      status: "open",
      deadline: PAST_DEADLINE,
      max_claimers: 1,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockRejectedValueOnce(new Error("network down"))

    const first = await processDeadlineRefund("t1")
    expect(first).toEqual({ success: false, error: "refund_failed" })
    expect(findRow("tasks", "t1")?.refund_status).toBe("failed")

    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-retry" })
    const second = await processDeadlineRefund("t1")

    expect(second).toEqual({ success: true, refundAmount: 10_000_000 })
    expect(findRow("tasks", "t1")?.refund_status).toBe("succeeded")
    expect(
      db.notifications?.some((n) => n.type === "deadline_refund")
    ).toBe(true)
  })

  it("refuses to re-process an already-succeeded refund", async () => {
    seedTask({
      id: "t1",
      status: "open",
      deadline: PAST_DEADLINE,
      max_claimers: 1,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-1" })

    await processDeadlineRefund("t1")
    expect(sendAdaPayoutViaService).toHaveBeenCalledTimes(1)

    const second = await processDeadlineRefund("t1")

    expect(second).toEqual({ success: false, error: "already_closed" })
    expect(sendAdaPayoutViaService).toHaveBeenCalledTimes(1)
  })

  it("rejects a concurrent call while a refund attempt is already in flight", async () => {
    seedTask({
      id: "t1",
      status: "cancelled",
      refund_status: "pending",
      deadline: PAST_DEADLINE,
      max_claimers: 1,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })

    const result = await processDeadlineRefund("t1")

    expect(result).toEqual({ success: false, error: "refund_already_in_progress" })
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
  })

  it("fails the refund when the poster has no linked wallet", async () => {
    seedTask({
      id: "t1",
      status: "open",
      deadline: PAST_DEADLINE,
      max_claimers: 1,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedProfile({ id: "poster-1", wallet_address: null })

    const result = await processDeadlineRefund("t1")

    expect(result).toEqual({ success: false, error: "poster_no_wallet" })
    expect(findRow("tasks", "t1")?.refund_status).toBe("failed")
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
  })
})

describe("approveWork", () => {
  it("pays out, marks the claim approved, and credits the claimer", async () => {
    seedTask({ id: "t1", created_by: "poster-1", ada_reward: 5_000_000, reward_credits: 500 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "claimer-1", status: "submitted" })
    seedProfile({ id: "claimer-1", credits: 100, wallet_address: "addr1" })
    asUser("poster-1")
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-1" })

    const result = await approveWork("t1", "c1")

    expect(result).toEqual({ success: true })
    const claim = findRow("task_claims", "c1")
    expect(claim?.status).toBe("approved")
    expect(claim?.payout_status).toBe("succeeded")
    expect(claim?.cardano_tx_hash).toBe("tx-1")
    expect(findRow("profiles", "claimer-1")?.credits).toBe(600)
    expect(findRow("tasks", "t1")?.status).toBe("completed")
    expect(
      db.notifications?.some((n) => n.user_id === "claimer-1" && n.type === "submission_approved")
    ).toBe(true)
  })

  it("leaves the claim retryable and records the error when the payout fails", async () => {
    seedTask({ id: "t1", created_by: "poster-1", ada_reward: 5_000_000, reward_credits: 500 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "claimer-1", status: "submitted" })
    seedProfile({ id: "claimer-1", credits: 100, wallet_address: "addr1" })
    asUser("poster-1")
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({
      error: "payout_failed",
      message: "insufficient funds",
    })

    const result = await approveWork("t1", "c1")

    expect(result).toEqual({ error: "payout_failed", message: "insufficient funds" })
    const claim = findRow("task_claims", "c1")
    expect(claim?.status).toBe("submitted")
    expect(claim?.payout_status).toBe("failed")
    expect(claim?.payout_last_error).toBe("insufficient funds")
    expect(findRow("profiles", "claimer-1")?.credits).toBe(100)
  })

  it("rejects a concurrent approval while a payout is already in flight", async () => {
    seedTask({ id: "t1", created_by: "poster-1", ada_reward: 5_000_000, reward_credits: 500 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "claimer-1", status: "submitted", payout_status: "pending" })
    seedProfile({ id: "claimer-1", credits: 100, wallet_address: "addr1" })
    asUser("poster-1")

    const result = await approveWork("t1", "c1")

    expect(result).toEqual({
      error: "payout_in_progress",
      message: "A payout is already being processed for this submission.",
    })
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
  })

  it("keeps the persisted tx hash even if the final claim update fails", async () => {
    seedTask({ id: "t1", created_by: "poster-1", ada_reward: 5_000_000, reward_credits: 500 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "claimer-1", status: "submitted" })
    seedProfile({ id: "claimer-1", credits: 100, wallet_address: "addr1" })
    asUser("poster-1")
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-1" })
    injectFailure(db, {
      table: "task_claims",
      op: "update",
      match: (payload) =>
        !Array.isArray(payload) && (payload as FakeRow | undefined)?.status === "approved",
    })

    const result = await approveWork("t1", "c1")

    expect(result).toEqual({
      error: "update_failed",
      message: "Something went wrong. Please try again.",
    })
    const claim = findRow("task_claims", "c1")
    expect(claim?.payout_status).toBe("succeeded")
    expect(claim?.cardano_tx_hash).toBe("tx-1")
    expect(claim?.status).toBe("submitted")
  })

  it("awards credits directly with no payout call when there is no ADA reward", async () => {
    seedTask({ id: "t1", created_by: "poster-1", ada_reward: 0, reward_credits: 300 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "claimer-1", status: "submitted" })
    seedProfile({ id: "claimer-1", credits: 50, wallet_address: "addr1" })
    asUser("poster-1")

    const result = await approveWork("t1", "c1")

    expect(result).toEqual({ success: true })
    expect(findRow("profiles", "claimer-1")?.credits).toBe(350)
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
    expect(findRow("task_claims", "c1")?.cardano_tx_hash).toBeNull()
  })

  it("refuses to release payment when the claimer has no linked wallet", async () => {
    seedTask({ id: "t1", created_by: "poster-1", ada_reward: 5_000_000, reward_credits: 500 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "claimer-1", status: "submitted" })
    seedProfile({ id: "claimer-1", credits: 100, wallet_address: null })
    asUser("poster-1")

    const result = await approveWork("t1", "c1")

    expect(result.error).toBe("no_wallet")
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
    expect(findRow("task_claims", "c1")?.payout_status).toBeNull()
  })
})

describe("claimTask", () => {
  it("claims an open mission and notifies the poster", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    asUser("claimer-1")

    const result = await claimTask("t1")

    expect(result).toEqual({ success: true })
    expect(db.task_claims?.some((c) => c.user_id === "claimer-1" && c.status === "claimed")).toBe(
      true
    )
    expect(findRow("tasks", "t1")?.status).toBe("claimed")
    expect(
      db.notifications?.some((n) => n.user_id === "poster-1" && n.type === "mission_claimed")
    ).toBe(true)
  })

  it("refuses a banned user", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    db.task_bans = [{ id: "ban-1", task_id: "t1", user_id: "claimer-1" }]
    asUser("claimer-1")

    const result = await claimTask("t1")

    expect(result.error).toBe("banned")
  })

  it("refuses a duplicate claim", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    seedClaim({ task_id: "t1", user_id: "claimer-1", status: "claimed" })
    asUser("claimer-1")

    const result = await claimTask("t1")

    expect(result.error).toBe("already_claimed")
  })

  it("refuses to claim once all slots are filled", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    seedClaim({ task_id: "t1", user_id: "other-claimer", status: "claimed" })
    asUser("claimer-2")

    const result = await claimTask("t1")

    expect(result.error).toBe("task_full")
  })
})

describe("dropTask", () => {
  it("drops an active claim and reopens the mission", async () => {
    seedTask({ id: "t1", status: "claimed", created_by: "poster-1", max_claimers: 1 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "claimer-1", status: "claimed" })
    asUser("claimer-1")

    const result = await dropTask("t1")

    expect(result).toEqual({ success: true })
    expect(db.task_claims?.find((c) => c.id === "c1")).toBeUndefined()
    expect(findRow("tasks", "t1")?.status).toBe("open")
  })

  it("refuses to drop when there is no active claim", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    asUser("claimer-1")

    const result = await dropTask("t1")

    expect(result.error).toBe("not_claimer")
  })
})

describe("submitWork", () => {
  it("submits proof for a claimed mission and notifies the poster", async () => {
    seedTask({ id: "t1", status: "claimed", created_by: "poster-1", max_claimers: 1 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "claimer-1", status: "claimed" })
    asUser("claimer-1")

    const result = await submitWork("t1", { notes: "done" })

    expect(result).toEqual({ success: true })
    expect(findRow("task_claims", "c1")?.status).toBe("submitted")
    expect(findRow("tasks", "t1")?.status).toBe("submitted")
    expect(
      db.notifications?.some((n) => n.user_id === "poster-1" && n.type === "proof_submitted")
    ).toBe(true)
  })

  it("refuses a banned user", async () => {
    seedTask({ id: "t1", status: "claimed", created_by: "poster-1", max_claimers: 1 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "claimer-1", status: "claimed" })
    db.task_bans = [{ id: "ban-1", task_id: "t1", user_id: "claimer-1" }]
    asUser("claimer-1")

    const result = await submitWork("t1", { notes: "done" })

    expect(result.error).toBe("banned")
  })
})

describe("rejectWork", () => {
  it("rejects a submission and reopens the mission", async () => {
    seedTask({ id: "t1", status: "submitted", created_by: "poster-1", max_claimers: 1 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "claimer-1", status: "submitted" })
    asUser("poster-1")

    const result = await rejectWork("t1", "c1", "not good enough")

    expect(result).toEqual({ success: true })
    const claim = findRow("task_claims", "c1")
    expect(claim?.status).toBe("rejected")
    expect(claim?.rejection_reason).toBe("not good enough")
    expect(findRow("tasks", "t1")?.status).toBe("open")
    expect(
      db.notifications?.some((n) => n.user_id === "claimer-1" && n.type === "submission_rejected")
    ).toBe(true)
  })
})

describe("banUser", () => {
  it("lets the poster ban an operative", async () => {
    seedTask({ id: "t1", created_by: "poster-1" })
    asUser("poster-1")

    const result = await banUser("t1", "claimer-1", "spam")

    expect(result).toEqual({ success: true })
    expect(
      db.task_bans?.some((b) => b.task_id === "t1" && b.user_id === "claimer-1")
    ).toBe(true)
  })

  it("refuses to let the poster ban themself", async () => {
    seedTask({ id: "t1", created_by: "poster-1" })
    asUser("poster-1")

    const result = await banUser("t1", "poster-1")

    expect(result.error).toBe("cannot_self_ban")
  })
})
