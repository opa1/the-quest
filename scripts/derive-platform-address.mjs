// Print the platform wallet address (and balance) for a network, derived from
// the SAME encrypted seed the cardano-service uses. Same wallet, network-
// specific address. Use the mainnet address as NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS_MAINNET,
// then fund it with real ADA.
//
//   node scripts/derive-platform-address.mjs            # testnet (default)
//   node scripts/derive-platform-address.mjs --mainnet  # mainnet

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import crypto from "node:crypto"
import { Lucid, Blockfrost } from "@lucid-evolution/lucid"

// Minimal .env loader (strips inline `# comments`).
const root = join(dirname(fileURLToPath(import.meta.url)), "..")
for (const line of readFileSync(join(root, ".env"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/\s+#.*$/, "").trim()
}

function decryptSeed() {
  const encryptedSeed = process.env.PLATFORM_WALLET_SEED
  const encryptionKey = process.env.PLATFORM_WALLET_ENCRYPTION_KEY
  if (!encryptedSeed || !encryptionKey) {
    throw new Error("PLATFORM_WALLET_SEED / PLATFORM_WALLET_ENCRYPTION_KEY not set.")
  }
  const [ivHex, encrypted] = encryptedSeed.split(":")
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "hex"),
    Buffer.from(ivHex, "hex")
  )
  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8")
}

const isMainnet = process.argv.includes("--mainnet")
const network = isMainnet ? "Mainnet" : "Preprod"
const url = isMainnet
  ? "https://cardano-mainnet.blockfrost.io/api/v0"
  : "https://cardano-preprod.blockfrost.io/api/v0"
const projectId = isMainnet
  ? process.env.BLOCKFROST_PROJECT_ID_MAINNET
  : process.env.BLOCKFROST_PROJECT_ID ?? process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID

if (!projectId) {
  console.error(
    `Missing Blockfrost project id for ${network} ` +
      `(${isMainnet ? "BLOCKFROST_PROJECT_ID_MAINNET" : "BLOCKFROST_PROJECT_ID"}).`
  )
  process.exit(1)
}

const lucid = await Lucid(new Blockfrost(url, projectId), network)
lucid.selectWallet.fromSeed(decryptSeed())

const address = await lucid.wallet().address()
const utxos = await lucid.wallet().getUtxos()
const lovelace = utxos.reduce((sum, u) => sum + (u.assets.lovelace ?? 0n), 0n)

console.log(`\n${network} platform wallet`)
console.log(`  address: ${address}`)
console.log(`  balance: ${Number(lovelace) / 1_000_000} ${isMainnet ? "ADA" : "tADA"}\n`)
