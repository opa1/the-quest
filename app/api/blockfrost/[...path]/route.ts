import { NextRequest, NextResponse } from "next/server"
import { blockfrostUrl, blockfrostProjectId } from "@/lib/config/cardano.config"
import { ACTIVE_NETWORK_COOKIE, normalizeNetwork } from "@/lib/config/network"
import { checkRateLimit } from "@/lib/rate-limit"

// Server-side reverse proxy for Blockfrost. The client Lucid provider points at
// this route with an empty project id, so the real key never ships to the
// browser — it is injected here, server-side only. Routes to the mainnet or
// testnet Blockfrost per the active_network cookie. See lib/cardano/client.ts.

// Only the mission-deposit flow needs write access, and only via tx submission.
// Everything else Blockfrost exposes stays read-only through this proxy.
const ALLOWED_POST_PATH = "tx/submit"

// Per-client budget. A legitimate deposit session is a short burst of well under
// this; the cap just stops a single client from hammering our Blockfrost quota.
const RATE_LIMIT = 60
const RATE_WINDOW_MS = 15_000

function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0].trim()
  return req.headers.get("x-real-ip") ?? "unknown"
}

async function proxy(
  req: NextRequest,
  path: string[]
): Promise<NextResponse> {
  const network = normalizeNetwork(
    req.cookies.get(ACTIVE_NETWORK_COOKIE)?.value
  )
  const projectId = blockfrostProjectId(network)
  if (!projectId) {
    return NextResponse.json(
      { error: "blockfrost_not_configured" },
      { status: 500 }
    )
  }

  const { allowed, retryAfterSec } = checkRateLimit(
    clientKey(req),
    RATE_LIMIT,
    RATE_WINDOW_MS
  )
  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(retryAfterSec) } }
    )
  }

  const joined = path.join("/")

  if (req.method === "POST" && joined !== ALLOWED_POST_PATH) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const target = `${blockfrostUrl(network)}/${joined}${req.nextUrl.search}`
  const headers: Record<string, string> = { project_id: projectId }
  const init: RequestInit = { method: req.method, headers, cache: "no-store" }

  if (req.method === "POST") {
    headers["Content-Type"] =
      req.headers.get("content-type") ?? "application/cbor"
    init.body = Buffer.from(await req.arrayBuffer())
  }

  try {
    const res = await fetch(target, init)
    const body = await res.arrayBuffer()
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    })
  } catch (err) {
    console.error("[blockfrost-proxy] upstream request failed:", err)
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 502 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxy(req, path)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxy(req, path)
}
