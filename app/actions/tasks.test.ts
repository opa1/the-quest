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
vi.mock("@/lib/cardano/verify-deposit", () => ({
  verifyDepositCoversBounty: vi.fn(),
}))
vi.mock("@/lib/config/network.server", () => ({
  getActiveNetwork: vi.fn().mockResolvedValue("Preprod"),
}))
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { sendAdaPayoutViaService } from "@/lib/cardano/server"
import { verifyDepositCoversBounty } from "@/lib/cardano/verify-deposit"
import {
  submitWork,
  approveWork,
  rejectWork,
  banUser,
  createMission,
  processDeadlineRefund,
  closeMission,
} from "@/app/actions/tasks"

let db: FakeDb

beforeEach(() => {
  db = createFakeDb()
  vi.mocked(createAdminClient).mockReturnValue(createFakeClient(db) as never)
  vi.mocked(sendAdaPayoutViaService).mockReset()
  // Default: escrow deposit is valid and covers the bounty. Individual tests
  // override this to prove payouts/refunds fail closed when it doesn't.
  vi.mocked(verifyDepositCoversBounty).mockReset()
  vi.mocked(verifyDepositCoversBounty).mockResolvedValue({
    ok: true,
    paidLovelace: Number.MAX_SAFE_INTEGER,
  })
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

describe("closeMission — untouched missions are deleted", () => {
  it("deletes a mission nobody paid or submitted to, after refunding it", async () => {
    asUser("poster-1")
    seedTask({
      id: "t1",
      status: "open",
      max_claimers: 2,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-refund" })

    const result = await closeMission("t1")

    expect(result).toMatchObject({ success: true, deleted: true, refundAmount: 20_000_000 })
    expect(findRow("tasks", "t1")).toBeUndefined()
  })

  // "Unpaid" is not "untouched" — someone awaiting review has done the work.
  it("keeps a mission that has a submission, even with nobody paid", async () => {
    asUser("poster-1")
    seedTask({
      id: "t1",
      status: "open",
      max_claimers: 2,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedClaim({ id: "c1", task_id: "t1", status: "submitted", user_id: "hunter-1" })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-refund" })

    const result = await closeMission("t1")

    expect(result).toMatchObject({ success: true })
    expect(result).not.toHaveProperty("deleted", true)
    expect(findRow("tasks", "t1")?.status).toBe("cancelled")
    expect(findRow("task_claims", "c1")?.status).toBe("rejected")
  })

  it("keeps a mission that has already paid someone", async () => {
    asUser("poster-1")
    seedTask({
      id: "t1",
      status: "open",
      max_claimers: 2,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedClaim({ id: "c1", task_id: "t1", status: "approved" })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-refund" })

    await closeMission("t1")

    expect(findRow("tasks", "t1")?.status).toBe("cancelled")
    expect(findRow("tasks", "t1")).toBeDefined()
  })

  // Deleting before the refund lands would strand the ADA: the row carrying
  // deposit_tx_hash and the retry lock would be gone.
  it("does not delete when the refund fails, so the retry stays possible", async () => {
    asUser("poster-1")
    seedTask({
      id: "t1",
      status: "open",
      max_claimers: 2,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockRejectedValueOnce(new Error("network down"))

    const result = await closeMission("t1")

    expect(result).toMatchObject({ error: "refund_failed" })
    const task = findRow("tasks", "t1")
    expect(task).toBeDefined()
    expect(task?.refund_status).toBe("failed")

    // ...and pressing Close again still finishes the job, then removes it.
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-retry" })
    const retry = await closeMission("t1")
    expect(retry).toMatchObject({ success: true, deleted: true })
    expect(findRow("tasks", "t1")).toBeUndefined()
  })

  it("clears the mission's child rows so nothing is orphaned", async () => {
    asUser("poster-1")
    seedTask({ id: "t1", status: "open", max_claimers: 1, ada_reward: 0, reward_per_claimer: 0, created_by: "poster-1" })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    db.task_logs = [{ id: "l1", task_id: "t1", user_id: "poster-1", action: "created" }]
    db.task_bans = [{ id: "b1", task_id: "t1", user_id: "hunter-9" }]

    const result = await closeMission("t1")

    expect(result).toMatchObject({ success: true, deleted: true })
    expect(findRow("tasks", "t1")).toBeUndefined()
    expect(db.task_logs?.filter((l) => l.task_id === "t1").length).toBe(0)
    expect(db.task_bans?.filter((b) => b.task_id === "t1").length).toBe(0)
  })
})

describe("closeMission", () => {
  // A claim exists, so the mission is kept and cancelled rather than deleted.
  it("refunds unfilled slots and closes the mission", async () => {
    asUser("poster-1")
    seedTask({
      id: "t1",
      status: "open",
      max_claimers: 3,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedClaim({ id: "c1", task_id: "t1", status: "submitted", user_id: "hunter-1" })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-close" })

    const result = await closeMission("t1")

    expect(result).toEqual({ success: true, refundAmount: 30_000_000 })
    const task = findRow("tasks", "t1")
    expect(task?.status).toBe("cancelled")
    expect(task?.refund_status).toBe("succeeded")
  })

  // The bug this action exists for: 3 slots, 1 approved, 1 rejected. The two
  // unpaid slots must come back without waiting for a deadline the mission
  // may not even have.
  it("refunds only the slots nobody was paid for", async () => {
    asUser("poster-1")
    seedTask({
      id: "t1",
      status: "open",
      deadline: null,
      max_claimers: 3,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedClaim({ id: "c1", task_id: "t1", status: "approved" })
    seedClaim({ id: "c2", task_id: "t1", status: "rejected", user_id: "hunter-2" })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-close" })

    const result = await closeMission("t1")

    expect(result).toEqual({ success: true, refundAmount: 20_000_000 })
    expect(sendAdaPayoutViaService).toHaveBeenCalledWith(
      "addr_test1poster",
      20_000_000,
      expect.anything()
    )
  })

  it("rejects submissions still in review, refunds their slots, and tells the hunter", async () => {
    asUser("poster-1")
    seedTask({
      id: "t1",
      status: "open",
      max_claimers: 2,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedClaim({ id: "c1", task_id: "t1", status: "submitted", user_id: "hunter-1" })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-close" })

    const result = await closeMission("t1")

    // Nothing was approved, so both slots refund.
    expect(result).toEqual({ success: true, refundAmount: 20_000_000 })
    expect(findRow("task_claims", "c1")?.status).toBe("rejected")
    expect(
      db.notifications?.some((n) => n.user_id === "hunter-1" && n.title === "Mission Closed")
    ).toBe(true)
  })

  it("never reclaims ADA already paid out", async () => {
    asUser("poster-1")
    seedTask({
      id: "t1",
      status: "open",
      max_claimers: 2,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedClaim({ id: "c1", task_id: "t1", status: "approved" })
    seedClaim({ id: "c2", task_id: "t1", status: "approved", user_id: "hunter-2" })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })

    const result = await closeMission("t1")

    expect(result).toEqual({ success: true, refundAmount: 0 })
    expect(findRow("tasks", "t1")?.status).toBe("completed")
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
  })

  it("only lets the poster close their own mission", async () => {
    asUser("someone-else")
    seedTask({ id: "t1", status: "open", created_by: "poster-1" })

    const result = await closeMission("t1")

    expect(result).toMatchObject({ error: "not_poster" })
    expect(findRow("tasks", "t1")?.status).toBe("open")
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
  })

  it("refuses to close an already-closed mission twice", async () => {
    asUser("poster-1")
    seedTask({ id: "t1", status: "cancelled", created_by: "poster-1" })

    const result = await closeMission("t1")

    expect(result).toMatchObject({ error: "already_closed" })
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
  })

  // Nothing else retries a poster-initiated refund: the cron only acts on
  // missions whose deadline has passed, and this one may not have a deadline at
  // all. Pressing Close again has to be able to finish the job.
  it("lets the poster retry a refund that failed, without paying twice", async () => {
    asUser("poster-1")
    seedTask({
      id: "t1",
      status: "open",
      deadline: null,
      max_claimers: 2,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    // A pending submission keeps the mission around, so the retry is observable
    // on the row itself rather than on a task that has been deleted.
    seedClaim({ id: "c1", task_id: "t1", status: "submitted", user_id: "hunter-1" })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })

    vi.mocked(sendAdaPayoutViaService).mockRejectedValueOnce(new Error("network down"))
    const first = await closeMission("t1")
    expect(first).toMatchObject({ error: "refund_failed" })
    expect(findRow("tasks", "t1")?.refund_status).toBe("failed")

    vi.mocked(sendAdaPayoutViaService).mockResolvedValueOnce({ txHash: "tx-retry" })
    const second = await closeMission("t1")

    expect(second).toEqual({ success: true, refundAmount: 20_000_000 })
    expect(findRow("tasks", "t1")?.refund_status).toBe("succeeded")
    expect(sendAdaPayoutViaService).toHaveBeenCalledTimes(2)
  })

  it("does not re-refund a mission whose refund already succeeded", async () => {
    asUser("poster-1")
    seedTask({
      id: "t1",
      status: "cancelled",
      refund_status: "succeeded",
      max_claimers: 2,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })

    const result = await closeMission("t1")

    expect(result).toMatchObject({ error: "already_closed" })
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
  })

  it("fails closed when the escrow deposit does not cover the bounty", async () => {
    asUser("poster-1")
    seedTask({
      id: "t1",
      status: "open",
      max_claimers: 2,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
    })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(verifyDepositCoversBounty).mockResolvedValue({
      ok: false,
      error: "deposit_too_small",
    } as never)

    const result = await closeMission("t1")

    expect(result).toMatchObject({ error: "deposit_too_small" })
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
  })
})

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

  it("blocks the refund when the escrow deposit fails on-chain verification", async () => {
    seedTask({
      id: "t1",
      status: "open",
      deadline: PAST_DEADLINE,
      max_claimers: 2,
      reward_per_claimer: 10_000_000,
      created_by: "poster-1",
      deposit_tx_hash: "bogus-tx",
    })
    seedProfile({ id: "poster-1", wallet_address: "addr_test1poster" })
    vi.mocked(verifyDepositCoversBounty).mockResolvedValueOnce({
      ok: false,
      error: "deposit_not_found",
      message: "Escrow deposit not found on-chain. Payout blocked.",
    })

    const result = await processDeadlineRefund("t1")

    expect(result).toEqual({ success: false, error: "deposit_not_found" })
    const task = findRow("tasks", "t1")
    expect(task?.refund_status).toBe("failed")
    expect(task?.refund_last_error).toBe("deposit_not_found")
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
  })
})

describe("createMission", () => {
  it("rejects a deposit tx hash already used by another mission", async () => {
    seedTask({ id: "t1", deposit_tx_hash: "reused-tx" })
    asUser("poster-1")

    const result = await createMission({
      title: "A brand new mission",
      description: "This description is definitely long enough to pass.",
      category: "general",
      difficulty: "easy",
      reward_credits: 500,
      ada_reward: 5,
      deposit_tx_hash: "reused-tx",
    })

    expect(result).toEqual({
      error: "deposit_reused",
      message: "This escrow deposit has already been used for another mission.",
    })
    // No second task created.
    expect((db.tasks ?? []).filter((t) => t.deposit_tx_hash === "reused-tx")).toHaveLength(1)
  })

  it("creates a mission when the deposit tx hash is unused", async () => {
    asUser("poster-1")

    const result = await createMission({
      title: "A brand new mission",
      description: "This description is definitely long enough to pass.",
      category: "general",
      difficulty: "easy",
      reward_credits: 500,
      ada_reward: 5,
      deposit_tx_hash: "fresh-tx",
    })

    expect("taskId" in result && result.taskId).toBeTruthy()
    expect((db.tasks ?? []).some((t) => t.deposit_tx_hash === "fresh-tx")).toBe(true)
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

  it("blocks the payout when the escrow deposit fails on-chain verification", async () => {
    seedTask({
      id: "t1",
      created_by: "poster-1",
      ada_reward: 5_000_000,
      reward_credits: 500,
      deposit_tx_hash: "bogus-tx",
    })
    seedClaim({ id: "c1", task_id: "t1", user_id: "claimer-1", status: "submitted" })
    seedProfile({ id: "claimer-1", credits: 100, wallet_address: "addr1" })
    asUser("poster-1")
    vi.mocked(verifyDepositCoversBounty).mockResolvedValueOnce({
      ok: false,
      error: "insufficient_deposit",
      message: "Escrow deposit does not cover the mission reward. Payout blocked.",
    })

    const result = await approveWork("t1", "c1")

    expect(result.error).toBe("insufficient_deposit")
    expect(sendAdaPayoutViaService).not.toHaveBeenCalled()
    const claim = findRow("task_claims", "c1")
    expect(claim?.status).toBe("submitted")
    expect(claim?.payout_status).toBeNull()
    expect(findRow("profiles", "claimer-1")?.credits).toBe(100)
  })
})

describe("submitWork", () => {
  // The point of the redesign: no claim step, so a first-time submitter has no
  // row yet and submitting creates one.
  it("submits with no prior claim and notifies the poster", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    asUser("hunter-1")

    const result = await submitWork("t1", { notes: "done" })

    expect(result).toEqual({ success: true })
    const claim = db.task_claims?.find((c) => c.user_id === "hunter-1")
    expect(claim?.status).toBe("submitted")
    expect(
      db.notifications?.some((n) => n.user_id === "poster-1" && n.type === "proof_submitted")
    ).toBe(true)
  })

  // Submitting reserves nothing — the mission stays claimable by everyone else
  // until the poster actually approves someone.
  it("leaves the mission open so others can still submit", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    asUser("hunter-1")
    await submitWork("t1", { notes: "first" })
    expect(findRow("tasks", "t1")?.status).toBe("open")

    asUser("hunter-2")
    const second = await submitWork("t1", { notes: "second" })

    expect(second).toEqual({ success: true })
    expect(findRow("tasks", "t1")?.status).toBe("open")
    expect(db.task_claims?.filter((c) => c.task_id === "t1").length).toBe(2)
  })

  it("lets any number of operatives compete for a multi-slot mission", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 2 })

    for (const hunter of ["h1", "h2", "h3", "h4", "h5"]) {
      asUser(hunter)
      expect(await submitWork("t1", { notes: hunter })).toEqual({ success: true })
    }

    expect(db.task_claims?.filter((c) => c.task_id === "t1").length).toBe(5)
    expect(findRow("tasks", "t1")?.status).toBe("open")
  })

  it("reuses the existing row when resubmitting after a rejection", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    seedClaim({
      id: "c1",
      task_id: "t1",
      user_id: "hunter-1",
      status: "rejected",
      rejection_reason: "not good enough",
    })
    asUser("hunter-1")

    const result = await submitWork("t1", { notes: "second attempt" })

    expect(result).toEqual({ success: true })
    expect(db.task_claims?.filter((c) => c.task_id === "t1").length).toBe(1)
    const claim = findRow("task_claims", "c1")
    expect(claim?.status).toBe("submitted")
    expect(claim?.rejection_reason).toBeNull()
  })

  // Rows left behind by the old claim step still work — the migration leaves
  // them in place rather than deleting them.
  it("reuses a legacy 'claimed' row from before the claim step was removed", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "hunter-1", status: "claimed" })
    asUser("hunter-1")

    const result = await submitWork("t1", { notes: "done" })

    expect(result).toEqual({ success: true })
    expect(db.task_claims?.filter((c) => c.task_id === "t1").length).toBe(1)
    expect(findRow("task_claims", "c1")?.status).toBe("submitted")
  })

  it("refuses a second submission while one is awaiting review", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    seedClaim({ id: "c1", task_id: "t1", user_id: "hunter-1", status: "submitted" })
    asUser("hunter-1")

    const result = await submitWork("t1", { notes: "again" })

    expect(result.error).toBe("already_submitted")
  })

  it("refuses to submit to a closed mission", async () => {
    seedTask({ id: "t1", status: "cancelled", created_by: "poster-1", max_claimers: 1 })
    asUser("hunter-1")

    const result = await submitWork("t1", { notes: "done" })

    expect(result.error).toBe("task_closed")
  })

  it("refuses the poster submitting to their own mission", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    asUser("poster-1")

    const result = await submitWork("t1", { notes: "done" })

    expect(result.error).toBe("cannot_submit_own_task")
  })

  it("refuses a banned user", async () => {
    seedTask({ id: "t1", status: "open", created_by: "poster-1", max_claimers: 1 })
    db.task_bans = [{ id: "ban-1", task_id: "t1", user_id: "hunter-1" }]
    asUser("hunter-1")

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
