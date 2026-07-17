# The Quest: Final Presentation

## Piece of Pie Hackathon by Gimbalabs

---

## Slide 1: Title

- **Project name:** The Quest
- **Team name:** Solo
- **Presenter name:** Opa
- **Tracks pursued:**
  - Builder Pie
  - Cardano Pie
  - Real User Pie
  - Feedback Pie

---

## Slide 2: Project Identity

- **Project name:** The Quest
- **One-sentence description:** A Cardano-powered gamified community bounty platform where anyone can post missions, claim work, and earn real ADA, with every completion permanently recorded on-chain as portable reputation.
- **Official public repository:** [github.com/opa1/the-quest](https://github.com/opa1/the-quest)
- **Deployed public product:** [thequesters.fun](https://thequesters.fun)
- **Official project X account:** [@the_questgg](https://x.com/the_questgg)
- **Primary X posting account (weekly updates):** [@Opa007i](https://x.com/Opa007i)
- **Team members as registered:** Opa

---

## Slide 3: What the Product Does

**Who the user is**

Two sides of one market. Posters need work done across 26 categories (design, code, writing, research, marketing, and more). Hunters want to earn ADA by completing that work.

**What the user can do**

- Post a mission with an ADA bounty, funded upfront from their own Cardano wallet
- Open a mission to a single hunter or to as many as 100 hunters at once
- Claim open missions, complete the work, and submit proof (URL, text, or image)
- Review submissions and approve or reject with reasons
- Set deadlines, with automatic refunds for unfilled slots

**What value the user gets**

- Hunters are paid in real ADA, straight to their wallet, the moment work is approved
- Every completion is written to Cardano as a permanent, verifiable transaction
- Reputation (XP, rank, completion history) becomes a portable portfolio no platform can delete
- Posters get real work done with escrow protection, since funds only release on approval

**Where payment happens**

Payment is the product loop, not an add-on. Posters pay ADA from their connected wallet at mission creation. That is the payment gate. The platform escrows the bounty and releases it to hunters on approval through real Cardano transactions.

---

## Slide 4: Live Demo

Demo flow:

1. Landing page at [thequesters.fun](https://thequesters.fun), showing live missions on the Bounty Board
2. Sign in with a Cardano wallet (CIP-8 signature, no password) or with X
3. Onboarding: claim username, wallet connected
4. The Realm: recent missions, live activity log, leaderboard
5. **Core action plus payment gate:** post a mission. AI reads the brief and assigns difficulty and XP, the wallet prompts for the ADA deposit, the transaction signs and submits on-chain
6. Claim the mission as a hunter and submit proof
7. Approve as poster. ADA payout fires and the transaction hash is recorded
8. Open the completed mission and its on-chain proof block linking to Cardanoscan
9. The Public Ledger at [thequesters.fun/ledger](https://thequesters.fun/ledger): every completion, verifiable by anyone

**Backup demo video:** [TODO: record a 3 to 5 minute walkthrough of the flow above and paste the public link here]

---

## Slide 5: How a User Buys the Product

**What the user is buying:** mission slots. Posters fund ADA bounties upfront to get work done. That funding step is the payment gate.

**The payment flow**

1. Poster fills the mission form (title, brief, category, proof type)
2. AI assigns difficulty and XP automatically
3. Poster sets the ADA reward (minimum 2 ADA single claimer, minimum 5 ADA per person for multi-claimer)
4. On "Deploy Mission" the connected Cardano wallet prompts for a signature
5. ADA moves from the poster wallet to platform escrow and the deposit transaction hash is recorded
6. The mission goes live immediately

**What happens after payment**

The mission is live and claimable. When the poster approves submitted work, escrowed ADA is released to the hunter's wallet as a real on-chain transaction. If a deadline passes with unfilled slots, the remaining ADA is refunded to the poster automatically.

**Fulfillment evidence:** [TODO: screenshot of the post mission form with the wallet signature prompt visible]

---

## Slide 6: Public Repository Evidence

- **Repository URL:** [github.com/opa1/the-quest](https://github.com/opa1/the-quest)
- **Public:** confirmed public
- **Commit history:**
  - Main: [commits/main](https://github.com/opa1/the-quest/commits/main)
  - Staging (pre-release, before public rollout): [commits/staging](https://github.com/opa1/the-quest/commits/staging)
- **Key structure:**
  - `app/`: Next.js App Router pages and server actions
  - `components/`: atoms, molecules, sections (100+ components)
  - `lib/cardano/`: Lucid Evolution client, CIP-8 verification, deposit flow
  - `cardano-service/`: isolated Express signing microservice (Fly.io)
  - `supabase/functions/`: deadline refund edge function

Network is not tied to a branch. Preprod and Mainnet run in the same app, selected per request, so the same code path is what ran through 42 verified testnet completions and what runs on Mainnet today.

---

## Slides 7 to 18: Twelve Official Weekly Update Posts

All twelve posted from [@Opa007i](https://x.com/Opa007i).

- **Week 1** — May 1, 2026 — [View post](https://x.com/Opa007i/status/2050258483233309045)
  Initial build. Auth, landing page, core pages.

- **Week 2** — May 7, 2026 — [View post](https://x.com/Opa007i/status/2052391922216411320)
  Onboarding, realm feed, missions page.

- **Week 3** — May 13, 2026 — [View post](https://x.com/Opa007i/status/2054534255758225818)
  Task detail, claim flow, post mission form.

- **Week 4** — May 20, 2026 — [View post](https://x.com/Opa007i/status/2057213911145811968)
  Submit work flow, review system, proof types.

- **Week 5** — May 27, 2026 — [View post](https://x.com/Opa007i/status/2059431939073814791)
  Testnet v1 launch. Cardano deposits and payouts live via Lucid Evolution, WASM isolated into the signing microservice, RLS payout bug fixed.

- **Week 6** — June 4, 2026 — [View post](https://x.com/Opa007i/status/2062605941699469622)
  Wallet sign-in via CIP-8, AI difficulty and XP detection (Groq), Cloudinary image proofs, public ledger page, real-time notifications.

- **Week 7** — June 13, 2026 — [View post](https://x.com/Opa007i/status/2065797911875555741)
  Shared mission links fixed. Public SSR mission pages, share buttons, guest sign-in-to-claim flow.

- **Week 8** — June 18, 2026 — [View post](https://x.com/Opa007i/status/2067664179532550371)
  [TODO: fill from the week 8 post]

- **Week 9** — June 26, 2026 — [View post](https://x.com/Opa007i/status/2070500404622684568)
  Mission categories expanded from 6 to 26 with a searchable picker, community live session announced.

- **Week 10** — June 29, 2026 — [View post](https://x.com/Opa007i/status/2071592220570861704)
  [TODO: fill from the week 10 post, likely the live community session]

- **Week 11** — July 7, 2026 — [View post](https://x.com/Opa007i/status/2074445866744615343)
  Multi-claimer missions (up to 100 hunters per mission), deadlines with automatic ADA refunds, slot progress tracking.

- **Week 12** — July 13, 2026 — [View post](https://x.com/Opa007i/status/2076552915955671346)
  Final testnet stats (50 testers, 117 missions, 121,066 tADA distributed), mainnet countdown, launch on July 13.

**Additional build-in-public posts (not counted toward the twelve):**

- May 11, 2026 — [View post](https://x.com/Opa007i/status/2053882918510948380)
- June 2, 2026 — [View post](https://x.com/Opa007i/status/2061783171667034556)

---

## Slide 19: Builder Verification Summary

- Live demo completed: [thequesters.fun](https://thequesters.fun)
- Official public repository shown: [github.com/opa1/the-quest](https://github.com/opa1/the-quest)
- Deployed public product link shown: [thequesters.fun](https://thequesters.fun)
- All 12 official weekly update posts linked: confirmed
- Public evidence verifiable: the public ledger at [thequesters.fun/ledger](https://thequesters.fun/ledger) shows every completion with on-chain transaction links

---

# Cardano Pie Evidence

## Cardano Slide A: Mainnet Functionality

**Launched on Cardano Mainnet:** July 13, 2026 at 12:00 PM UTC

**Real mainnet functionality**

1. **ADA bounty deposits.** Posters fund missions from their own wallets via CIP-30, with transactions submitted to mainnet.
   - Mission: [SKYPIE Crypto World Cup Prediction Arena, Argentina vs England](https://thequesters.fun/tasks/e03d1f94-8df9-4edf-94aa-a18b1d7d7835)
   - Deposit tx: [`5a06c416...74ff70`](https://cardanoscan.io/transaction/5a06c416b50832a47ad68bba671fbbf306a931241505be0433551d079a74ff70)
2. **ADA payouts on approval.** The platform releases escrowed ADA to hunters through its isolated signing service.
   - Payout tx: [`a34b022b...cdcf4c6`](https://cardanoscan.io/transaction/a34b022b56b42b140a7e0905845119f6af728384d0740a9d5b12b7d52cdcf4c6)
3. **Wallet-native authentication.** CIP-8 / COSE_Sign1 signature verification for sign-in, no passwords.
4. **On-chain proof records.** Every completed mission carries a real transaction hash, publicly verifiable.
   - Public ledger: [thequesters.fun/ledger](https://thequesters.fun/ledger)
5. **Automatic deadline refunds.** Unfilled multi-claimer slots are refunded to posters as real transactions.

**Testnet track record before mainnet**

- 50 testers, 117 missions posted, 48 completed
- 42 completions verified on-chain (Preprod)
- 121,066 tADA distributed through real transactions

---

# Real User Pie Evidence

## Real User Slide A: Paying User Evidence

**What counts as payment:** posters pay real ADA from their own wallets to fund missions. Each deposit is a blockchain payment record.

| Poster                                   | Mission                                                                                                                | ADA funded | Mainnet deposit tx                                                                                                    |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| @skypiedao                        | [SKYPIE CRYPTO WORLD CUP PREDICTION ARENA ARGENTINA VS ENGLAND](https://thequesters.fun/tasks/e03d1f94-8df9-4edf-94aa-a18b1d7d7835) | 30 ADA     | [`5a06c416...74ff70`](https://cardanoscan.io/transaction/5a06c416b50832a47ad68bba671fbbf306a931241505be0433551d079a74ff70) |
| [@opa007i](https://x.com/Opa007i) | [⚔️ WELCOME ONBOARD TO THE QUEST ⚔️ TAKE THE CHALLENGE TO X](https://thequesters.fun/tasks/66727ad2-b881-4862-a826-90bc3e1923b8)    | 39.99 ADA  | [`e4249d12...e2e576`](https://cardanoscan.io/transaction/e4249d1224999f0c12e8dca3be3e714a5c2cb02524787f7519918bd8a4e2e576) |

## Real User Slide B: Customer Acquisition Story

**Who the user is:** Skypie DAO — a Cardano community organisation. We partnered directly with their admin, who posted a funded bounty on The Quest.

**How they found the product:** We built a community around The Quest throughout the 12 weeks of the hackathon, shipping in public with weekly updates, an active [Discord](https://discord.gg/tXSnBVqFp), and a live testnet anyone could join. That consistent public presence is what put us on Skypie DAO's radar. They were already watching before we ever reached out.

**Why they decided to pay:** Skypie DAO had real work they needed done and a community of contributors who could do it. The Quest gave them a way to fund that work in ADA with escrow protection and on-chain proof of every completion, instead of coordinating payouts manually.

**What they paid for:** A multi-claimer mission titled ["Skypie Crypto World Cup Prediction Arena: Argentina vs England"](https://thequesters.fun/tasks/e03d1f94-8df9-4edf-94aa-a18b1d7d7835) — a community prediction contest opened to 2 hunters at 15 ADA each. Skypie DAO funded the full 30 ADA bounty on-chain at the moment the mission was posted.

Deposit transaction: [`5a06c416...74ff70`](https://cardanoscan.io/transaction/5a06c416b50832a47ad68bba671fbbf306a931241505be0433551d079a74ff70)

**What happened after purchase:** The full 30 ADA was locked in escrow on-chain when the mission went live. Hunters claimed the open slots, submitted their predictions, and Skypie DAO reviewed each submission independently. On approval, ADA was released directly to the hunter's wallet as a real Cardano transaction — no manual transfers, no chasing payment.

First payout: @gabimax received 15 ADA
Payout transaction: [`2a712f64...81f668`](https://cardanoscan.io/transaction/2a712f64a5269ad2a3218c3543b633ed40f4f52fa83e9b286b87396e0781f668)

The remaining slot stays open and funded until claimed and approved, or until the poster cancels or the deadline triggers an automatic refund of the unspent 15 ADA back to Skypie DAO. The full loop — fund, claim, submit, approve, pay, prove — ran on Cardano Mainnet with every step publicly verifiable.

---

# Feedback Pie Evidence

## Feedback Slide A: Recorded Feedback Sessions

| Project | Builder | Recorded session                                                                                          |
| ------- | ------- | --------------------------------------------------------------------------------------------------------- |
| Haulink | Ayzed   | [Opa's Review on Haulink](https://drive.google.com/file/d/1c6pYfl7Q7MGaLHFqMsWbGgtfkjEj8hR9/view?usp=sharing) |

---

# One-Slide Summary

**Project name:** The Quest
**Repo:** [github.com/opa1/the-quest](https://github.com/opa1/the-quest)
**Live product:** [thequesters.fun](https://thequesters.fun)
**Demo video link:** [TODO]
**X account:** [@the_questgg](https://x.com/the_questgg) (weekly updates posted from [@Opa007i](https://x.com/Opa007i))

**Weekly update posts:**

- [Week 1](https://x.com/Opa007i/status/2050258483233309045) · [Week 2](https://x.com/Opa007i/status/2052391922216411320) · [Week 3](https://x.com/Opa007i/status/2054534255758225818) · [Week 4](https://x.com/Opa007i/status/2057213911145811968)
- [Week 5](https://x.com/Opa007i/status/2059431939073814791) · [Week 6](https://x.com/Opa007i/status/2062605941699469622) · [Week 7](https://x.com/Opa007i/status/2065797911875555741) · [Week 8](https://x.com/Opa007i/status/2067664179532550371)
- [Week 9](https://x.com/Opa007i/status/2070500404622684568) · [Week 10](https://x.com/Opa007i/status/2071592220570861704) · [Week 11](https://x.com/Opa007i/status/2074445866744615343) · [Week 12](https://x.com/Opa007i/status/2076552915955671346)

**Optional track evidence**
Cardano: Mainnet live since July 13, 2026. Deposits, payouts, on-chain proof, public ledger at [thequesters.fun/ledger](https://thequesters.fun/ledger).
Feedback: recorded review of Haulink by Ayzed — [Opa's Review on Haulink](https://drive.google.com/file/d/1c6pYfl7Q7MGaLHFqMsWbGgtfkjEj8hR9/view?usp=sharing).

---
