# Appendix A - Target DAO Pipeline + Full 12-Week Roadmap

This document is the full readable version of Milestones. The form version is limited to 1,000 characters and is a summary. This file provides full context for curators.

## Part 1: Full 12-Week Roadmap - Readable Version

**W1 D1-7: USDCx Funding Live on Preview Testnet**
- Deploy asset-parameterised Aiken validator to preview testnet
- Mission creation form now shows USDCx + ADA options
- DexHunter aggregator live in-app for ADA-to-USDCx swaps (routes across 15+ Cardano DEXs)
- Min-ADA buffer logic for token UTXOs handled in Lucid Evolution tx builder
- Target: 5 users successfully fund a test USDCx mission
- Evidence: preview testnet tx hashes will be logged here

**W2 D8-14: Full Claim-Submit-Approve Cycle Live**
- All 8 redeemers live: Cancel, Accept, Submit, Approve, Reject, ResolveDispute, ClaimTimeout, ReclaimExpired
- Hunter can claim mission, submit work, poster approves and escrow pays out USDCx automatically
- Outreach to 13 existing mainnet hunters to test preview flow
- Target: 5 full cycles (deposit to claim to submit to approve to payout) completed on preview
- Evidence: preview ledger

**W3-4: Validator Hardening and UI Complete**
- Critical timeout paths tested:
  - ClaimTimeout: hunter can auto-collect if poster ghosts after submission
  - ReclaimExpired: poster can reclaim if hunter claims and disappears
- These two paths are why a smart contract is required, cannot be enforced with custodial escrow
- Validator finalised, UI for USDCx flow complete
- Target: all property tests passing, no funds locked in edge cases

**W5-6: Quality and Off-chain Builder**
- Internal testing across all 8 state transitions
- Property-based tests for datum handling and double-spend protection
- Lucid Evolution builder complete for all tx types
- Target: 100 percent test coverage for escrow paths

**W7-8: Security Review and Mainnet Deploy Prep**
- Internal security review: manual audit of validator logic, datum validation, and min-ADA handling
- Fixes from review applied
- Mainnet deploy with 1 real USDCx mission funded by team to prove live escrow
- Anastasia Labs quote obtained for pilot: 15 percent 7.5k ADA, M3 W7-8, audit locked to pilot scope, not scaling phase
- Infrastructure: Supabase + Fly.io signing service, 3 months only
- Target: 1 real USDCx mission on mainnet with on-chain proof

**W9-10: Mainnet Launch Execution - Start of 90-day target**

This is not 90 days post-launch. This is Day 57-70 of the 90-day pilot window (W1-W12 = 84 days rounded to 90). Fixed to address curator concern about timeline contradiction.

*W9 D1-7 Post-Mainnet Day 57-63:*
- Announce USDCx bounties live on X (@the_questgg), Discord (https://discord.gg/tXSnBVqFp), Gimbalabs community
- Onboard 13 existing hunters to USDCx flow
- Post first 3 real USDCx missions (team and Skypie DAO)
- Target: 5 USDCx missions funded by real users

*W10 D8-14 Post-Mainnet Day 64-70:*
- Skypie DAO AMA + 4 bounty drop (existing poster partnership, proof at https://thequesters.fun/ledger)
- Outreach to Gimbalabs alumni from Piece of Pie hackathon
- Target: 18 missions active or completed, 81 tx labeled (18 x 4.5 avg)
- Evidence: https://thequesters.fun/ledger with tx hashes, every completion is Cardanoscan-verifiable

**W11-12 Day 77-84: Complete 90-day Pilot Target to 120 Missions**

- Pilot timeline: W1-W8 = 56 days build, W9-W10 = 14 days first 18 missions, W11-W12 = 14 days scale to 120. Total W1-W12 = 84 days, reported as 90-day pilot window.
- Scale from 18 to 120 missions via target DAO pipeline (see Part 2)
- 120 missions x 4.5 avg tx per mission (4 base: deposit, Accept, Submit, Approve + 0.5 avg DexHunter swap) = 540 transactions
- 540 x 0.35 ADA avg network fee = 189 ADA fees, clears program floor of 180 ADA
- Platform fee 2.5 percent capped at 25 ADA goes to treasury, excluded from fee target
- Deliverables: testimonials from hunters, final report, video demo of USDCx flow
- Note: Previous targets of 700 tx and 250 missions were forecasting errors and have been removed. All numbers are now corrected and aligned. Timeline contradiction fixed: 120 missions is for 90-day pilot window, not 90 days post-mainnet plus 4 weeks.

---

## Part 2: Target DAO Pipeline to Reach 120 Missions

This is a TARGET pipeline. Outreach starts Day 1 post-funding. No prior contacts are claimed. This explains how we go from 18 missions at W10 Day 70 to 120 at W12 Day 84 within the same 90-day pilot window.

Total needed: 120 missions in 90-day pilot window (W1-W12 = 84 days). Base we already have 18 by W10 Day 70. Need 102 more via partners in W11-W12 Day 77-84.

| # | DAO / Community | Why Relevant | Missions Planned | Contact Plan |
|---|---|---|---|---|
| 1 | Skypie DAO | Existing poster, 3 missions done, warm relationship | 12 | Direct X DM @SkypieDAO, already engaged |
| 2 | Gimbalabs | Builder community, 150 builders, Pie track winner | 12 | Discord + Gimbalabs alumni channel |
| 3 | MeshJS | Dev tooling DAO, needs example integrations | 12 | X + Discord |
| 4 | NMKR | NFT tooling, needs community content bounties | 15 | X + email via NMKR site |
| 5 | FluidTokens | DeFi on Cardano, needs research bounties | 12 | Discord |
| 6 | TxPipe | Infra, needs docs bounties | 12 | Discord + GitHub |
| 7 | Cardano Atlantic Council | Governance, needs research | 15 | X |
| 8 | Cardano Foundation bounties channel + small DAOs | Pool of small bounties | 30 | Open bounty board |

Math: 12+12+12+15+12+12+15+30 = 120 total missions

Outreach plan Day 1-14 post-funding:
- Day 1-3: Prepare bounty templates for each DAO type
- Day 4-7: Contact all 8, share The Quest ledger proof (4 missions, 166 ADA, 13 hunters)
- Day 8-14: Follow up, schedule AMAs, drop first bounties

Funnel to justify 120:
- Base: 30 users, 4 missions, 166 ADA, 13 hunters, 3 posters, verifiable at /ledger
- 13 hunters x 80 percent retention x 3 missions avg = 30
- Skypie DAO 30 members x 20 percent conversion x 3 = 18
- Gimbalabs 150 builders x 5 percent as posters x 2 missions = 16
- X drove 30 users in 12 weeks, next 12 weeks expect 60 new x 30 percent hunters x 2 = 36
- Discord 40 active x 25 percent activation x 2 = 20
- Total: 30+18+16+36+20 = 120

No paid promotion, no ADA incentives, no airdrops.

## Part 3: Evidence Links

- Live product: https://thequesters.fun
- Ledger with tx hashes: https://thequesters.fun/ledger
- GitHub: https://github.com/opa1/the-quest
- X: https://x.com/the_questgg
- Skypie DAO partnership proof: https://x.com/the_questgg/status/2078027501960384675

## Part 4: Why This Appendix Exists

The Pilot form Milestones field is limited to 1,000 characters and cannot include full context. This file provides the full readable roadmap and the DAO pipeline that backs the 120 mission target. Milestones in the form mentions pipeline in Appendix A and links here via Supporting Links.
