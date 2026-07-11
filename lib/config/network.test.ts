import { describe, it, expect } from "vitest"
import { normalizeNetwork } from "@/lib/config/network"

describe("normalizeNetwork", () => {
  it("recognizes both networks explicitly", () => {
    expect(normalizeNetwork("Mainnet")).toBe("Mainnet")
    expect(normalizeNetwork("Preprod")).toBe("Preprod")
  })

  it("falls back to the default for absent or unknown values", () => {
    // Regression guard: an explicit "Mainnet" must never collapse to the
    // default (that bug made mainnet unreachable via the cookie).
    expect(normalizeNetwork(undefined)).toBe("Preprod")
    expect(normalizeNetwork(null)).toBe("Preprod")
    expect(normalizeNetwork("nonsense")).toBe("Preprod")
  })
})
