// Rules for testnet -> mainnet account migration and the one-time welcome bonus.
// See the phased migration plan; these values are intentionally frozen.

// Only testnet activity on or before this instant counts toward eligibility, so
// post-launch testnet farming can never earn a welcome bonus.
export const TESTNET_ACTIVITY_CUTOFF = "2026-07-11T23:59:59.999Z"

// Eligible when (missions posted) + (missions claimed & completed) meets this
// threshold, counting only activity on/before TESTNET_ACTIVITY_CUTOFF.
// Examples that qualify: post 2; complete 2; post 1 + complete 1.
export const MIGRATION_ELIGIBILITY_MIN_MISSIONS = 2

// Welcome bonus (points/XP) = testnet credits * this multiplier.
export const WELCOME_BONUS_MULTIPLIER = 2
