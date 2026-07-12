import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  createFakeDb,
  createFakeClient,
  createFakeServerClient,
  type FakeDb,
  type FakeRow,
} from "@/test/support/fake-supabase"

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }))
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }))
vi.mock("@/lib/config/network.server", () => ({ getActiveNetwork: vi.fn() }))

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { getActiveNetwork } from "@/lib/config/network.server"
import {
  getMigrationOffer,
  migrateProfile,
  dismissMigration,
} from "@/app/actions/migration"

// Activity on/before the frozen cutoff (2026-07-11T23:59:59.999Z) counts.
const BEFORE = "2026-06-01T00:00:00.000Z"
const AFTER = "2026-08-01T00:00:00.000Z"

let testnetDb: FakeDb
let mainnetDb: FakeDb

beforeEach(() => {
  testnetDb = createFakeDb()
  mainnetDb = createFakeDb()
  vi.mocked(createAdminClient).mockImplementation(
    (network) =>
      createFakeClient(network === "Mainnet" ? mainnetDb : testnetDb) as never
  )
  vi.mocked(getActiveNetwork).mockResolvedValue("Mainnet")
})

function asUser(userId: string, db: FakeDb = mainnetDb) {
  vi.mocked(createClient).mockResolvedValue(
    createFakeServerClient(db, { id: userId }) as never
  )
}

function profileRow(overrides: Partial<FakeRow>): FakeRow {
  return {
    id: "p",
    username: null,
    avatar_url: null,
    x_handle: null,
    x_id: null,
    bio: null,
    wallet_key_hash: null,
    wallet_address: null,
    onboarded: false,
    credits: 0,
    migrated_from: null,
    migrated_at: null,
    migration_dismissed: false,
    welcome_bonus_granted: false,
    ...overrides,
  }
}

function seedProfile(db: FakeDb, overrides: Partial<FakeRow>): FakeRow {
  const row = profileRow(overrides)
  db.profiles = db.profiles ?? []
  db.profiles.push(row)
  return row
}

function seedTask(db: FakeDb, overrides: Partial<FakeRow> = {}) {
  const row: FakeRow = {
    id: `task-${(db.tasks?.length ?? 0) + 1}`,
    created_by: "testnet-user",
    created_at: BEFORE,
    ...overrides,
  }
  db.tasks = db.tasks ?? []
  db.tasks.push(row)
}

function seedClaim(db: FakeDb, overrides: Partial<FakeRow> = {}) {
  const row: FakeRow = {
    id: `claim-${(db.task_claims?.length ?? 0) + 1}`,
    user_id: "testnet-user",
    status: "approved",
    completed_at: BEFORE,
    ...overrides,
  }
  db.task_claims = db.task_claims ?? []
  db.task_claims.push(row)
}

// Source (testnet) profile matched by wallet_key_hash to the active (mainnet) one.
function seedTestnetSource(overrides: Partial<FakeRow> = {}) {
  return seedProfile(testnetDb, {
    id: "testnet-user",
    username: "opa",
    avatar_url: "a.png",
    x_handle: "opa_x",
    bio: "gm",
    wallet_key_hash: "keyhash-1",
    wallet_address: "addr_test1abc",
    onboarded: true,
    credits: 1000,
    ...overrides,
  })
}

function seedMainnetActive(overrides: Partial<FakeRow> = {}) {
  return seedProfile(mainnetDb, {
    id: "mainnet-user",
    wallet_key_hash: "keyhash-1",
    ...overrides,
  })
}

const active = () => mainnetDb.profiles?.find((p) => p.id === "mainnet-user")

describe("migrateProfile — eligibility & bonus", () => {
  it("migrates an eligible user (2 posted), grants credits x2, copies identity", async () => {
    seedTestnetSource({ credits: 1000 })
    seedMainnetActive()
    seedTask(testnetDb)
    seedTask(testnetDb)
    asUser("mainnet-user")

    const result = await migrateProfile()

    expect(result).toEqual({ success: true, eligible: true, bonusAmount: 2000 })
    const a = active()
    expect(a?.credits).toBe(2000)
    expect(a?.welcome_bonus_granted).toBe(true)
    expect(a?.username).toBe("opa")
    expect(a?.onboarded).toBe(true) // carried over — skips re-onboarding
    expect(a?.migrated_from).toBe("testnet-user")
    expect(a?.migrated_at).toBeTruthy()
  })

  it("counts 1 posted + 1 completed as eligible", async () => {
    seedTestnetSource({ credits: 500 })
    seedMainnetActive()
    seedTask(testnetDb)
    seedClaim(testnetDb)
    asUser("mainnet-user")

    const result = await migrateProfile()

    expect(result).toEqual({ success: true, eligible: true, bonusAmount: 1000 })
  })

  it("migrates but grants no bonus when under the threshold (1 mission)", async () => {
    seedTestnetSource({ credits: 1000 })
    seedMainnetActive()
    seedTask(testnetDb)
    asUser("mainnet-user")

    const result = await migrateProfile()

    expect(result).toEqual({ success: true, eligible: false, bonusAmount: 0 })
    const a = active()
    expect(a?.credits).toBe(0)
    expect(a?.welcome_bonus_granted).toBe(false)
    // Identity still copied even without a bonus.
    expect(a?.username).toBe("opa")
    expect(a?.migrated_at).toBeTruthy()
  })

  it("ignores activity after the cutoff", async () => {
    seedTestnetSource()
    seedMainnetActive()
    seedTask(testnetDb, { created_at: AFTER })
    seedTask(testnetDb, { created_at: AFTER })
    asUser("mainnet-user")

    const result = await migrateProfile()

    expect(result).toMatchObject({ success: true, eligible: false, bonusAmount: 0 })
  })

  it("never copies wallet_address (would send real ADA to a dead address)", async () => {
    seedTestnetSource()
    seedMainnetActive()
    seedTask(testnetDb)
    seedTask(testnetDb)
    asUser("mainnet-user")

    await migrateProfile()

    expect(active()?.wallet_address).toBeNull()
  })
})

describe("migrateProfile — safety & idempotency", () => {
  it("is a no-op on re-migration and never double-grants the bonus", async () => {
    seedTestnetSource({ credits: 1000 })
    seedMainnetActive()
    seedTask(testnetDb)
    seedTask(testnetDb)
    asUser("mainnet-user")

    await migrateProfile()
    const second = await migrateProfile()

    expect(second).toEqual({ success: true, alreadyMigrated: true })
    expect(active()?.credits).toBe(2000) // not 4000
  })

  it("does not re-grant if a prior partial run already set the bonus flag", async () => {
    seedTestnetSource({ credits: 1000 })
    // Simulate: bonus granted before, but migrated_at never got stamped.
    seedMainnetActive({ credits: 2000, welcome_bonus_granted: true })
    seedTask(testnetDb)
    seedTask(testnetDb)
    asUser("mainnet-user")

    await migrateProfile()

    expect(active()?.credits).toBe(2000) // conditional guard prevents doubling
    expect(active()?.migrated_at).toBeTruthy()
  })

  it("refuses when no matching source profile exists (null keys never match)", async () => {
    seedMainnetActive({ wallet_key_hash: null, x_id: null })
    asUser("mainnet-user")

    const result = await migrateProfile()

    expect(result).toEqual({
      error: "no_source",
      message: "No account found on the other network to migrate from.",
    })
  })

  it("matches by x_id when there is no wallet key", async () => {
    seedTestnetSource({ wallet_key_hash: null, x_id: "x-123", credits: 300 })
    seedMainnetActive({ wallet_key_hash: null, x_id: "x-123" })
    seedTask(testnetDb)
    seedTask(testnetDb)
    asUser("mainnet-user")

    const result = await migrateProfile()

    expect(result).toMatchObject({ success: true, bonusAmount: 600 })
  })
})

describe("migrateProfile — reverse (mainnet -> testnet)", () => {
  it("copies identity but grants no bonus when migrating into testnet", async () => {
    vi.mocked(getActiveNetwork).mockResolvedValue("Preprod")
    // Active side is now testnet; source is mainnet.
    seedProfile(mainnetDb, {
      id: "src",
      username: "explorer",
      wallet_key_hash: "kh-9",
      credits: 5000,
    })
    seedProfile(testnetDb, { id: "tn-user", wallet_key_hash: "kh-9" })
    // Even with qualifying mainnet activity, no bonus flows into testnet.
    seedTask(mainnetDb, { created_by: "src" })
    seedTask(mainnetDb, { created_by: "src" })
    asUser("tn-user", testnetDb)

    const result = await migrateProfile()

    expect(result).toEqual({ success: true, eligible: false, bonusAmount: 0 })
    const tn = testnetDb.profiles?.find((p) => p.id === "tn-user")
    expect(tn?.username).toBe("explorer")
    expect(tn?.credits).toBe(0)
  })
})

describe("getMigrationOffer", () => {
  it("offers migration with a bonus preview for an eligible match", async () => {
    seedTestnetSource({ credits: 1000 })
    seedMainnetActive()
    seedTask(testnetDb)
    seedTask(testnetDb)
    asUser("mainnet-user")

    const offer = await getMigrationOffer()

    expect(offer).toMatchObject({
      available: true,
      eligible: true,
      bonusAmount: 2000,
      source: { username: "opa" },
    })
  })

  it("does not offer once dismissed", async () => {
    seedTestnetSource()
    seedMainnetActive({ migration_dismissed: true })
    asUser("mainnet-user")

    expect(await getMigrationOffer()).toEqual({ available: false })
  })

  it("does not offer once already migrated", async () => {
    seedTestnetSource()
    seedMainnetActive({ migrated_at: "2026-07-11T00:00:00.000Z" })
    asUser("mainnet-user")

    expect(await getMigrationOffer()).toEqual({ available: false })
  })
})

describe("dismissMigration", () => {
  it("flags the active profile so it stops being offered", async () => {
    seedMainnetActive()
    asUser("mainnet-user")

    const result = await dismissMigration()

    expect(result).toEqual({ success: true })
    expect(active()?.migration_dismissed).toBe(true)
  })
})
