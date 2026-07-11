// Backfill profiles.wallet_key_hash for wallet users created before the column
// existed, so they can be matched across networks during migration. Idempotent:
// only touches rows where wallet_address is set and wallet_key_hash is null.
//
//   node scripts/backfill-wallet-key-hash.mjs            # testnet (default)
//   node scripts/backfill-wallet-key-hash.mjs --mainnet  # mainnet
//   node scripts/backfill-wallet-key-hash.mjs --dry-run  # report only

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import { getAddressDetails } from "@lucid-evolution/utils"

// Minimal .env loader (no dotenv dependency).
const root = join(dirname(fileURLToPath(import.meta.url)), "..")
for (const line of readFileSync(join(root, ".env"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/\s+#.*$/, "").trim()
}

const isMainnet = process.argv.includes("--mainnet")
const dryRun = process.argv.includes("--dry-run")
const suffix = isMainnet ? "_MAINNET" : "_TESTNET"

const url =
  process.env[`NEXT_PUBLIC_SUPABASE_URL${suffix}`] ??
  process.env.NEXT_PUBLIC_SUPABASE_URL
const secret =
  process.env[`SUPABASE_SECRET_KEY${suffix}`] ?? process.env.SUPABASE_SECRET_KEY

if (!url || !secret) {
  console.error(`Missing Supabase env for ${isMainnet ? "mainnet" : "testnet"}.`)
  process.exit(1)
}

function walletKeyHash(address) {
  try {
    const d = getAddressDetails(address)
    return d.stakeCredential?.hash ?? d.paymentCredential?.hash ?? null
  } catch {
    return null
  }
}

const db = createClient(url, secret, { auth: { persistSession: false } })

const { data: profiles, error } = await db
  .from("profiles")
  .select("id, wallet_address")
  .not("wallet_address", "is", null)
  .is("wallet_key_hash", null)

if (error) {
  console.error("Failed to read profiles:", error.message)
  process.exit(1)
}

console.log(
  `${isMainnet ? "MAINNET" : "TESTNET"}: ${profiles.length} profile(s) need a wallet_key_hash.${dryRun ? " (dry run)" : ""}`
)

let updated = 0
let skipped = 0
for (const p of profiles) {
  const hash = walletKeyHash(p.wallet_address)
  if (!hash) {
    console.warn(`  skip ${p.id}: could not derive hash from ${p.wallet_address}`)
    skipped++
    continue
  }
  if (dryRun) {
    updated++
    continue
  }
  const { error: upErr } = await db
    .from("profiles")
    .update({ wallet_key_hash: hash })
    .eq("id", p.id)
  if (upErr) {
    console.error(`  fail ${p.id}: ${upErr.message}`)
    skipped++
  } else {
    updated++
  }
}

console.log(`Done. ${updated} ${dryRun ? "would be " : ""}updated, ${skipped} skipped.`)
