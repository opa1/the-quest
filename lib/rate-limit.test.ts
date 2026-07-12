import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { checkRateLimit, __resetRateLimitStore } from "@/lib/rate-limit"

beforeEach(() => {
  __resetRateLimitStore()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("checkRateLimit", () => {
  it("allows requests up to the limit, then blocks", () => {
    const results = Array.from({ length: 4 }, () =>
      checkRateLimit("ip-1", 3, 10_000)
    )

    expect(results.slice(0, 3).every((r) => r.allowed)).toBe(true)
    expect(results[3].allowed).toBe(false)
    expect(results[3].retryAfterSec).toBeGreaterThan(0)
  })

  it("tracks each key independently", () => {
    expect(checkRateLimit("ip-a", 1, 10_000).allowed).toBe(true)
    expect(checkRateLimit("ip-a", 1, 10_000).allowed).toBe(false)
    // A different client still has its full budget.
    expect(checkRateLimit("ip-b", 1, 10_000).allowed).toBe(true)
  })

  it("starts a fresh window once the previous one elapses", () => {
    vi.useFakeTimers()

    expect(checkRateLimit("ip-1", 1, 10_000).allowed).toBe(true)
    expect(checkRateLimit("ip-1", 1, 10_000).allowed).toBe(false)

    vi.advanceTimersByTime(10_001)

    expect(checkRateLimit("ip-1", 1, 10_000).allowed).toBe(true)
  })
})
