// Tiny in-memory fixed-window rate limiter. Each check is a Map lookup plus
// integer arithmetic — no I/O — so it adds no meaningful latency.
//
// Caveat: state is per server instance and resets on cold start, so on a
// multi-instance / serverless deploy the effective global ceiling is
// (instances × limit). That's the right tradeoff for blunt quota-abuse
// protection (e.g. the Blockfrost proxy) where zero latency matters more than a
// precise global cap. Reach for a shared store (Redis/Upstash) only if you ever
// need a hard, cluster-wide limit.

type Window = { count: number; resetAt: number }

const buckets = new Map<string, Window>()

// Once the map grows past this, sweep expired buckets so a churn of unique
// keys can't grow memory without bound.
const SWEEP_THRESHOLD = 10_000

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const existing = buckets.get(key)

  // No bucket, or the previous window has elapsed → start a fresh window.
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    if (buckets.size > SWEEP_THRESHOLD) sweep(now)
    return { allowed: true, retryAfterSec: 0 }
  }

  if (existing.count < limit) {
    existing.count += 1
    return { allowed: true, retryAfterSec: 0 }
  }

  return {
    allowed: false,
    retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  }
}

function sweep(now: number) {
  for (const [key, win] of buckets) {
    if (win.resetAt <= now) buckets.delete(key)
  }
}

// Exposed for tests.
export function __resetRateLimitStore() {
  buckets.clear()
}
