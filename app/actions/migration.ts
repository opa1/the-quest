"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getActiveNetwork } from "@/lib/config/network.server"
import { type Network } from "@/lib/config/network"
import {
  TESTNET_ACTIVITY_CUTOFF,
  MIGRATION_ELIGIBILITY_MIN_MISSIONS,
  WELCOME_BONUS_MULTIPLIER,
} from "@/lib/config/migration"

type AdminClient = ReturnType<typeof createAdminClient>

function otherNetwork(n: Network): Network {
  return n === "Mainnet" ? "Preprod" : "Mainnet"
}

// Identity fields copied across networks. NEVER wallet_address — it is
// network-specific, and copying a testnet address would later send real ADA to
// a dead mainnet address. The migrated profile keeps a null wallet_address so
// the payout guard forces a fresh mainnet wallet link.
// `onboarded` is carried too: an already-set-up source user skips re-onboarding
// on the new network and lands straight in the realm.
const IDENTITY_FIELDS = [
  "username",
  "avatar_url",
  "x_handle",
  "x_id",
  "bio",
  "wallet_key_hash",
  "onboarded",
] as const

type SourceProfile = {
  id: string
  username: string | null
  avatar_url: string | null
  x_handle: string | null
  x_id: string | null
  bio: string | null
  wallet_key_hash: string | null
  onboarded: boolean | null
  credits: number | null
}

const SOURCE_COLUMNS =
  "id, username, avatar_url, x_handle, x_id, bio, wallet_key_hash, onboarded, credits"

// Match a person to their profile on the other network. Only ever match on a
// non-null, exact identifier — matching on a null key would collide unrelated
// accounts.
async function findSourceProfile(
  sourceAdmin: AdminClient,
  key: { xId: string | null; walletKeyHash: string | null }
): Promise<SourceProfile | null> {
  if (key.xId) {
    const { data } = await sourceAdmin
      .from("profiles")
      .select(SOURCE_COLUMNS)
      .eq("x_id", key.xId)
      .maybeSingle()
    if (data) return data as SourceProfile
  }
  if (key.walletKeyHash) {
    const { data } = await sourceAdmin
      .from("profiles")
      .select(SOURCE_COLUMNS)
      .eq("wallet_key_hash", key.walletKeyHash)
      .maybeSingle()
    if (data) return data as SourceProfile
  }
  return null
}

// (missions posted) + (missions claimed & completed) on the source network,
// counting only activity on/before the frozen cutoff.
async function countQualifyingMissions(
  sourceAdmin: AdminClient,
  sourceId: string
): Promise<number> {
  const { count: posted } = await sourceAdmin
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("created_by", sourceId)
    .lte("created_at", TESTNET_ACTIVITY_CUTOFF)

  const { count: completed } = await sourceAdmin
    .from("task_claims")
    .select("id", { count: "exact", head: true })
    .eq("user_id", sourceId)
    .eq("status", "approved")
    .lte("completed_at", TESTNET_ACTIVITY_CUTOFF)

  return (posted ?? 0) + (completed ?? 0)
}

// The welcome bonus only applies when migrating INTO mainnet.
async function computeBonus(
  active: Network,
  sourceAdmin: AdminClient,
  sourceProfile: SourceProfile
): Promise<{ eligible: boolean; bonusAmount: number }> {
  if (active !== "Mainnet") return { eligible: false, bonusAmount: 0 }
  const missions = await countQualifyingMissions(sourceAdmin, sourceProfile.id)
  const eligible = missions >= MIGRATION_ELIGIBILITY_MIN_MISSIONS
  return {
    eligible,
    bonusAmount: eligible
      ? (sourceProfile.credits ?? 0) * WELCOME_BONUS_MULTIPLIER
      : 0,
  }
}

// Does the signed-in user have a matching profile on the other network that
// they haven't migrated or dismissed yet? Drives the "we found your profile"
// prompt. Read-only.
export async function getMigrationOffer() {
  const active = await getActiveNetwork()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { available: false as const }

  const activeAdmin = createAdminClient(active)
  const { data: profile } = await activeAdmin
    .from("profiles")
    .select("id, x_id, wallet_key_hash, migrated_at, migration_dismissed")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || profile.migrated_at || profile.migration_dismissed) {
    return { available: false as const }
  }

  const sourceAdmin = createAdminClient(otherNetwork(active))
  const sourceProfile = await findSourceProfile(sourceAdmin, {
    xId: profile.x_id,
    walletKeyHash: profile.wallet_key_hash,
  })
  if (!sourceProfile) return { available: false as const }

  const { eligible, bonusAmount } = await computeBonus(
    active,
    sourceAdmin,
    sourceProfile
  )

  return {
    available: true as const,
    network: active, // target network — drives the dialog copy/direction
    source: {
      username: sourceProfile.username,
      avatar_url: sourceProfile.avatar_url,
    },
    eligible,
    bonusAmount,
  }
}

// Copy the user's identity from the other network onto their current-network
// profile, granting the welcome bonus if eligible. Idempotent and fail-closed:
// a matching source must exist before anything is written, the bonus is granted
// under a one-time guard, and migrated_at gates re-runs.
export async function migrateProfile() {
  const active = await getActiveNetwork()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "not_authenticated" as const }

  const activeAdmin = createAdminClient(active)
  const { data: profile } = await activeAdmin
    .from("profiles")
    .select("id, x_id, wallet_key_hash, migrated_at, welcome_bonus_granted")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) return { error: "no_profile" as const }
  if (profile.migrated_at) {
    return { success: true as const, alreadyMigrated: true }
  }

  const sourceAdmin = createAdminClient(otherNetwork(active))
  const sourceProfile = await findSourceProfile(sourceAdmin, {
    xId: profile.x_id,
    walletKeyHash: profile.wallet_key_hash,
  })
  if (!sourceProfile) {
    return {
      error: "no_source" as const,
      message: "No account found on the other network to migrate from.",
    }
  }

  const { eligible, bonusAmount } = await computeBonus(
    active,
    sourceAdmin,
    sourceProfile
  )

  // Grant the bonus once. The conditional guard means a retry or concurrent
  // call can never double it.
  if (bonusAmount > 0) {
    await activeAdmin
      .from("profiles")
      .update({ credits: bonusAmount, welcome_bonus_granted: true })
      .eq("id", profile.id)
      .eq("welcome_bonus_granted", false)
  }

  // Copy identity (never wallet_address) and stamp the migration. Don't
  // overwrite an existing active value with a null from the source.
  const now = new Date().toISOString()
  const patch: Record<string, unknown> = {
    migrated_from: sourceProfile.id,
    migrated_at: now,
    updated_at: now,
  }
  for (const field of IDENTITY_FIELDS) {
    const value = sourceProfile[field]
    if (value !== null && value !== undefined) patch[field] = value
  }

  const { error: updateError } = await activeAdmin
    .from("profiles")
    .update(patch)
    .eq("id", profile.id)

  if (updateError) {
    return {
      error: "migrate_failed" as const,
      message: "Could not complete migration. Please retry.",
    }
  }

  return { success: true as const, eligible, bonusAmount }
}

// User declined the prompt — stop offering.
export async function dismissMigration() {
  const active = await getActiveNetwork()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "not_authenticated" as const }

  await createAdminClient(active)
    .from("profiles")
    .update({ migration_dismissed: true })
    .eq("id", user.id)

  return { success: true as const }
}
