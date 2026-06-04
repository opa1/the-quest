import "dotenv/config"
import express from "express"
import cors from "cors"
import crypto from "crypto"
import { Lucid, Blockfrost } from "@lucid-evolution/lucid"

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT ?? 3000
const CARDANO_NETWORK = process.env.CARDANO_NETWORK ?? "Preprod"
const BLOCKFROST_URL =
  CARDANO_NETWORK === "Mainnet"
    ? "https://cardano-mainnet.blockfrost.io/api/v0"
    : "https://cardano-preprod.blockfrost.io/api/v0"

function requireSecret(req, res, next) {
  const secret = process.env.CARDANO_SERVICE_SECRET
  if (!secret || req.headers["x-service-secret"] !== secret) {
    return res
      .status(401)
      .json({ error: "unauthorized", message: "Invalid service secret." })
  }
  next()
}

function decryptSeed() {
  const encryptedSeed = process.env.PLATFORM_WALLET_SEED
  const encryptionKey = process.env.PLATFORM_WALLET_ENCRYPTION_KEY

  if (!encryptedSeed || !encryptionKey) {
    throw new Error("Platform wallet credentials not configured.")
  }

  const [ivHex, encrypted] = encryptedSeed.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const key = Buffer.from(encryptionKey, "hex")
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

async function getPlatformLucid() {
  const projectId = process.env.BLOCKFROST_PROJECT_ID
  if (!projectId) throw new Error("Blockfrost project ID not configured.")

  const lucid = await Lucid(
    new Blockfrost(BLOCKFROST_URL, projectId),
    CARDANO_NETWORK
  )

  const seed = decryptSeed()
  lucid.selectWallet.fromSeed(seed)
  return lucid
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", network: CARDANO_NETWORK })
})

app.post("/payout", requireSecret, async (req, res) => {
  const { toAddress, lovelace } = req.body

  if (!toAddress || typeof toAddress !== "string") {
    return res
      .status(400)
      .json({ error: "invalid_request", message: "toAddress is required." })
  }
  if (!lovelace || typeof lovelace !== "number" || lovelace <= 0) {
    return res
      .status(400)
      .json({
        error: "invalid_request",
        message: "lovelace must be a positive number.",
      })
  }

  try {
    const lucid = await getPlatformLucid()

    const tx = await lucid
      .newTx()
      .pay.ToAddress(toAddress, { lovelace: BigInt(lovelace) })
      .complete()

    const signedTx = await tx.sign.withWallet().complete()
    const txHash = await signedTx.submit()

    console.log(
      `[payout] sent ${lovelace} lovelace to ${toAddress} — tx: ${txHash}`
    )
    return res.json({ txHash })
  } catch (err) {
    console.error("[payout] failed:", err)
    return res.status(500).json({
      error: "payout_failed",
      message: err?.message ?? "Failed to send ADA.",
    })
  }
})

app.listen(PORT, () => {
  console.log(`Cardano service running on port ${PORT} (${CARDANO_NETWORK})`)
})
