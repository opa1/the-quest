import "server-only"
import {
  blockfrostUrl,
  blockfrostProjectId,
  platformWalletAddress,
} from "@/lib/config/cardano.config"
import { type Network } from "@/lib/config/network"

type VerifyResult =
  | { ok: true; paidLovelace: number }
  | { ok: false; error: string; message: string }

/**
 * Confirms, on-chain, that a poster's escrow deposit actually reached the
 * platform wallet and covers the mission's full bounty before the platform
 * releases any ADA. This is the guard that keeps a fabricated, under-funded, or
 * unconfirmed `deposit_tx_hash` from draining the treasury at payout/refund time.
 *
 * Fails closed: any uncertainty (tx not found yet, Blockfrost down, misconfig)
 * blocks the money movement rather than allowing it.
 *
 * Note: Blockfrost's `/txs/{hash}/utxos` returns 404 until the tx is on-chain,
 * so a successful response also doubles as a confirmation check.
 */
export async function verifyDepositCoversBounty(
  depositTxHash: string | null | undefined,
  requiredLovelace: number,
  network: Network
): Promise<VerifyResult> {
  if (requiredLovelace <= 0) return { ok: true, paidLovelace: 0 }

  const platformAddress = platformWalletAddress(network)
  const projectId = blockfrostProjectId(network)

  if (!depositTxHash)
    return {
      ok: false,
      error: "no_deposit",
      message: "No escrow deposit is on record for this mission.",
    }
  if (!platformAddress)
    return {
      ok: false,
      error: "no_platform_wallet",
      message: "Platform wallet is not configured.",
    }
  if (!projectId)
    return {
      ok: false,
      error: "no_blockfrost",
      message: "Deposit verification is not configured.",
    }

  try {
    const res = await fetch(
      `${blockfrostUrl(network)}/txs/${depositTxHash}/utxos`,
      {
        headers: { project_id: projectId },
        cache: "no-store",
      }
    )

    if (res.status === 404)
      return {
        ok: false,
        error: "deposit_not_found",
        message: "Escrow deposit not found on-chain. Payout blocked.",
      }
    if (!res.ok)
      return {
        ok: false,
        error: "verify_unavailable",
        message: `Could not verify escrow deposit (HTTP ${res.status}). Please retry.`,
      }

    const data = (await res.json()) as {
      outputs?: Array<{
        address: string
        amount: Array<{ unit: string; quantity: string }>
      }>
    }

    const paidLovelace = (data.outputs ?? [])
      .filter((o) => o.address === platformAddress)
      .reduce(
        (sum, o) =>
          sum +
          o.amount
            .filter((a) => a.unit === "lovelace")
            .reduce((s, a) => s + Number(a.quantity), 0),
        0
      )

    if (paidLovelace < requiredLovelace)
      return {
        ok: false,
        error: "insufficient_deposit",
        message: "Escrow deposit does not cover the mission reward. Payout blocked.",
      }

    return { ok: true, paidLovelace }
  } catch (err) {
    console.error("[verifyDepositCoversBounty] failed:", err)
    return {
      ok: false,
      error: "verify_failed",
      message: "Could not verify escrow deposit. Please retry.",
    }
  }
}
