#!/usr/bin/env node
/**
 * Realm stats — a quick snapshot of activity on The Quest.
 *
 * Prints, for example:
 *   30 testers in the Realm.
 *   29 missions posted.
 *   10 completed — 2 verified on-chain.
 *   7,906 tADA distributed to mission hunters.
 *
 * Usage:
 *   node scripts/realm-stats.mjs            # pretty summary
 *   node scripts/realm-stats.mjs --json     # machine-readable JSON
 *
 * Reads SUPABASE creds from the project .env (service-role key, so it
 * bypasses RLS and sees every row). Read-only — it never writes.
 */

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { createClient } from "@supabase/supabase-js"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

// --- load .env into process.env (without clobbering anything already set) ---
function loadEnv() {
  let raw
  try {
    raw = readFileSync(join(ROOT, ".env"), "utf8")
  } catch {
    return
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    if (process.env[key] !== undefined) continue
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY
const NETWORK = process.env.NEXT_PUBLIC_CARDANO_NETWORK ?? "Preprod"
const ADA_LABEL = NETWORK === "Mainnet" ? "ADA" : "tADA"

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and " +
      "SUPABASE_SECRET_KEY are set in .env"
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

/** Exact row count for a table with optional filters. */
async function countRows(table, applyFilters = (q) => q) {
  let query = supabase.from(table).select("*", { count: "exact", head: true })
  query = applyFilters(query)
  const { count, error } = await query
  if (error) throw new Error(`count(${table}): ${error.message}`)
  return count ?? 0
}

async function gatherStats() {
  const [
    testers,
    missionsPosted,
    completed,
    verifiedOnChain,
    completedRewards,
  ] = await Promise.all([
    // Testers who have made it into the Realm (finished onboarding).
    countRows("profiles", (q) => q.eq("onboarded", true)),
    // Every mission ever posted.
    countRows("tasks"),
    // Missions that reached the completed state.
    countRows("tasks", (q) => q.eq("status", "completed")),
    // Completions that carry a Cardano tx hash = sealed on-chain.
    countRows("task_logs", (q) =>
      q.eq("action", "completed").not("cardano_tx_hash", "is", null)
    ),
    // ada_reward (lovelace) for completed missions — what got paid out.
    supabase.from("tasks").select("ada_reward").eq("status", "completed"),
  ])

  if (completedRewards.error) {
    throw new Error(`tasks.ada_reward: ${completedRewards.error.message}`)
  }

  const lovelaceDistributed = (completedRewards.data ?? []).reduce(
    (sum, t) => sum + (t.ada_reward ?? 0),
    0
  )
  const adaDistributed = lovelaceDistributed / 1_000_000

  return {
    testers,
    missionsPosted,
    completed,
    verifiedOnChain,
    adaDistributed,
    adaLabel: ADA_LABEL,
  }
}

function formatAda(ada) {
  const opts =
    ada % 1 === 0
      ? { maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  return ada.toLocaleString("en-US", opts)
}

function render(s) {
  const n = (v) => v.toLocaleString("en-US")
  return [
    `${n(s.testers)} testers in the Realm.`,
    `${n(s.missionsPosted)} missions posted.`,
    `${n(s.completed)} completed — ${n(s.verifiedOnChain)} verified on-chain.`,
    `${formatAda(s.adaDistributed)} ${s.adaLabel} distributed to mission hunters.`,
  ].join("\n")
}

try {
  const stats = await gatherStats()
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(stats, null, 2))
  } else {
    console.log(render(stats))
  }
} catch (err) {
  console.error("Failed to gather realm stats:", err.message)
  process.exit(1)
}
