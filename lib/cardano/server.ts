import "server-only"
import { type Network } from "@/lib/config/network"

const SERVICE_URL = process.env.CARDANO_SERVICE_URL ?? "http://localhost:3002"
const SERVICE_SECRET = process.env.CARDANO_SERVICE_SECRET ?? ""

export async function sendAdaPayoutViaService(
  toAddress: string,
  lovelace: number,
  network: Network
): Promise<{ txHash: string } | { error: string; message: string }> {
  try {
    const res = await fetch(`${SERVICE_URL}/payout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-service-secret": SERVICE_SECRET,
      },
      body: JSON.stringify({ toAddress, lovelace, network }),
    })

    const text = await res.text()
    let data: Record<string, string> = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      // Response body was not valid JSON — treat as opaque error
    }

    if (!res.ok) {
      return {
        error: data.error ?? "payout_failed",
        message: data.message ?? `Failed to send ADA. (HTTP ${res.status})`,
      }
    }
    return { txHash: data.txHash }
  } catch (err) {
    console.error("Cardano service call failed:", err)
    return {
      error: "service_unavailable",
      message: "Cardano service is unavailable. Please try again.",
    }
  }
}
