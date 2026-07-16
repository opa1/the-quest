# The Quest — Final Presentation

## Piece of Pie Hackathon by Gimbalabs

---

## Slide 1: Title

- **Project name:** The Quest
- **Team name:** "Solo"
- **Presenter name:** Opa
- **Tracks pursued:**
  - Builder Pie
  - Cardano Pie
  - Real User Pie
  - Feedback Pie

---

## Slide 2: Project Identity

- **Project name:** The Quest
- **One-sentence description:** A Cardano-powered community bounty platform where anyone can post missions, claim work, and earn real ADA, with every completion permanently recorded on-chain as portable reputation.
- **Official public repository:** [https://github.com/opa1/the-quest](https://github.com/opa1/the-quest)
- **Deployed public product:** https://thequesters.fun
- **Official X account:** @the_questgg
- **Team members as registered:** Opa

---

## Slide 3: What the Product Does

**Who the user is:**
Two types of users. Posters: individuals or teams who need work done (design, code, writing, research, marketing, and 21 more categories). Hunters: people who want to earn ADA by completing that work.

**What the user can do:**

- Post a mission with an ADA bounty, funded upfront from their own Cardano wallet
- Open a mission to a single hunter or up to 100 hunters at once
- Claim open missions, complete the work, and submit proof (URL, text, or image)
- Review submissions and approve or reject with reasons
- Set deadlines with automatic refunds for unfilled slots

**What value the user gets:**

- Hunters get paid in real ADA, directly to their wallet, the moment work is approved
- Every completion is recorded on Cardano as a permanent, verifiable transaction
- Reputation (XP, rank, completion history) builds a portable portfolio no platform can delete
- Posters get real work done with escrow protection; funds only release on approval

**Where payment happens:**
Payment is core to the product loop. Posters pay ADA from their connected wallet when creating a mission (the payment gate). The platform escrows the bounty and releases it to hunters on approval via real Cardano transactions.

---

## Slide 4: Live Demo

Recommended live demo flow:

1. Landing page at https://thequesters.fun — show real missions on the Bounty Board
2. Sign in with Cardano wallet (CIP-8 signature, no password) or X account
3. Onboarding — claim username, wallet connected
4. The Realm — recent missions, live activity log, leaderboard
5. **Core action + payment gate:** Post a mission — AI detects difficulty and XP from the brief, wallet prompts for ADA deposit, transaction signs and submits on-chain
6. Claim a mission as a hunter, submit proof
7. Approve as poster — ADA payout fires, transaction hash recorded
8. Show the completed mission with its on-chain proof block linking to Cardanoscan
9. The Public Ledger at /ledger — every completion, verifiable by anyone

[Demo video link — record a 3-5 minute walkthrough of the above flow as backup]

---

## Slide 5: How a User Buys the Product

**What the user is buying:** Posters purchase mission slots — they fund ADA bounties upfront to get work done. This is the payment gate.

**The payment flow:**

1. Poster fills the mission form (title, brief, category, proof type)
2. AI assigns difficulty and XP automatically
3. Poster sets ADA reward (minimum 2 ADA single, minimum 5 ADA per person for multi-claimer)
4. On "Deploy Mission" their connected Cardano wallet prompts for signature
5. ADA moves from poster wallet to platform escrow — deposit transaction hash recorded
6. Mission goes live immediately

**What happens after payment:**
The mission is live and claimable. When the poster approves submitted work, escrowed ADA is released to the hunter's wallet as a real on-chain transaction. If a deadline passes with unfilled slots, remaining ADA is automatically refunded to the poster.

[Screenshot of the post mission form with the wallet signature prompt visible]

---

## Slide 6: Public Repository Evidence

- **Repository URL:** [https://github.com/opa1/the-quest](https://github.com/opa1/the-quest)
- **Public:** Confirmed public
- **Commit history:**
  - Main: [https://github.com/opa1/the-quest/commits/main](https://github.com/opa1/the-quest/commits/main)
  - Testnet: [https://github.com/opa1/the-quest/commits/staging](https://github.com/opa1/the-quest/commits/staging)
- **Key structure:**
  - `app/` — Next.js App Router pages and server actions
  - `components/` — atoms, molecules, sections (100+ components)
  - `lib/cardano/` — Lucid Evolution client, CIP-8 verification, deposit flow
  - `cardano-service/` — isolated Express signing microservice (Fly.io)
  - `supabase/functions/` — deadline refund edge function

---

## Slides 7–18: Twelve Official Weekly Update Posts

```md
Week 1:
Date: May 1, 2026
Post URL: https://x.com/Opa007i/status/2050258483233309045?s=20
Progress: [Initial build — auth, landing page, core pages]

Week 2:
Date: May 7, 2026
Post URL: https://x.com/Opa007i/status/2052391922216411320?s=20
Progress: [Onboarding, realm feed, missions page]

Week 3:
Date: May 13, 2026
Post URL: https://x.com/Opa007i/status/2054534255758225818?s=20
Date:May 11, 2026
Post URL: https://x.com/Opa007i/status/2053882918510948380?s=20
Progress: [Task detail, claim flow, post mission form]

Week 4:
Date: May 20, 2026
Post URL: https://x.com/Opa007i/status/2057213911145811968?s=20
Progress: [Submit work flow, review system, proof types]

Week 5:
Date: May 27, 2026
Post URL: https://x.com/Opa007i/status/2059431939073814791?s=20
Progress: Testnet v1 launch — Cardano deposits and payouts live via Lucid Evolution, WASM isolated into signing microservice, RLS payout bug fixed

Week 6:
Date: Jun 4, 2026
Post URL: https://x.com/Opa007i/status/2062605941699469622?s=20
Date: Jun 2, 2026
Post URL: https://x.com/Opa007i/status/2061783171667034556?s=20
Progress: Wallet sign-in via CIP-8, AI difficulty + XP detection (Groq), Cloudinary image proofs, public ledger page, real-time notifications

Week 7:
Date: Jun 13, 2026
Post URL: https://x.com/Opa007i/status/2065797911875555741?s=20
Progress: Shared mission links fixed — public SSR mission pages, share buttons, guest sign-in-to-claim flow

Week 8:
Date: Jun 18, 2026
Post URL: https://x.com/Opa007i/status/2067664179532550371?s=20
Progress: [Fill from your week 8 post]

Week 9:
Date: Jun 26, 2026
Post URL: https://x.com/Opa007i/status/2070500404622684568?s=20
Progress: Mission categories expanded from 6 to 26 with searchable picker, community live session announced

Week 10:
Date: Jun 29, 2026
Post URL: https://x.com/Opa007i/status/2071592220570861704?s=20
Progress: [Fill from your week 10 post — likely the live community session]

Week 11:
Date: Jul 7, 2026
Post URL: https://x.com/Opa007i/status/2074445866744615343?s=20
Progress: Multi-claimer missions (up to 100 hunters per mission), deadlines with automatic ADA refunds, slot progress tracking

Week 12:
Date: Jul 13, 2026
Post URL: https://x.com/Opa007i/status/2076552915955671346?s=20
Progress: Final testnet stats (50 testers, 117 missions, 121,066 tADA distributed), mainnet countdown, launch July 13
```

---

## Slide 19: Builder Verification Summary

- ✅ Live demo completed — https://thequesters.fun
- ✅ Official public repository shown — [https://github.com/opa1/the-quest](https://github.com/opa1/the-quest)
- ✅ Deployed public product link shown — https://thequesters.fun
- ✅ All 12 official weekly update posts linked — Confirmed
- ✅ Public evidence verifiable — public ledger at https://thequesters.fun/ledger shows every completion with on-chain transaction links

---

# Cardano Pie Evidence

## Cardano Slide A: Mainnet Functionality

**Launched on Cardano Mainnet:** July 13, 2026 at 12:00 PM UTC

**Real mainnet functionality:**

1. **ADA bounty deposits** — posters fund missions from their own wallets via CIP-30, transactions submitted to mainnet
   - [Mainnet deposit transaction link from Cardanoscan](https://cardanoscan.io/transaction/2a712f64a5269ad2a3218c3543b633ed40f4f52fa83e9b286b87396e0781f668)

2. **ADA payouts on approval** — platform releases escrowed ADA to hunters via its isolated signing service
   - [Mainnet payout transaction link from Cardanoscan]

3. **Wallet-native authentication** — CIP-8 / COSE_Sign1 signature verification for sign-in, no passwords

4. **On-chain proof records** — every completed mission carries a real transaction hash, publicly verifiable
   - Public ledger: https://thequesters.fun/ledger

5. **Automatic deadline refunds** — unfilled multi-claimer slots refunded to posters as real transactions

**Testnet track record before mainnet:**

- 50 testers, 117 missions posted, 48 completed
- 42 completions verified on-chain (Preprod)
- 121,066 tADA distributed through real transactions

Some missions and their transaction proof:
 - [SKYPIE CRYPTO WORLD CUP PREDICTION ARENA ARGENTINA VS ENGLAND](https://thequesters.fun/tasks/e03d1f94-8df9-4edf-94aa-a18b1d7d7835): [https://cardanoscan.io/transaction/2a712f64a5269ad2a3218c3543b633ed40f4f52fa83e9b286b87396e0781f668](https://cardanoscan.io/transaction/2a712f64a5269ad2a3218c3543b633ed40f4f52fa83e9b286b87396e0781f668)
  - [SKYPIE CRYPTO WORLD CUP PREDICTION ARENA ARGENTINA VS ENGLAND](https://thequesters.fun/tasks/e03d1f94-8df9-4edf-94aa-a18b1d7d7835): [https://cardanoscan.io/transaction/2a712f64a5269ad2a3218c3543b633ed40f4f52fa83e9b286b87396e0781f668](https://cardanoscan.io/transaction/2a712f64a5269ad2a3218c3543b633ed40f4f52fa83e9b286b87396e0781f668)

---

# Real User Pie Evidence

## Real User Slide A: Paying User Evidence

**What counts as payment:** Posters pay real ADA from their own wallets to fund missions. Each deposit is a blockchain payment record.

[Mainnet deposit transaction link showing a real user funding a mission with ADA — include the Cardanoscan link, the mission it funded, and the user context]

[If you have multiple paying posters, list 2-3 transactions]

## Real User Slide B: Customer Acquisition Story

**Who the user is:** [Name/username of your first real mainnet poster]

**How they found the product:** [e.g. Through the testnet community on Discord / X posts / word of mouth during the 12-week public build]

**Why they decided to pay:** [e.g. They needed real work done — describe the mission they posted]

**What they paid for:** [Mission title, ADA amount funded]

**What happened after purchase:** [e.g. Mission was claimed within X hours, work submitted and approved, hunter paid — full loop completed on mainnet]

---

# Feedback Pie Evidence

[Include this section ONLY if you completed recorded feedback sessions for other hackathon projects]

## Feedback Slide A: Recorded Session Evidence

```md
Session 1:

- Product name: [Project you gave feedback to]
- Recorded session link: [Google Drive / YouTube link]
- Session date: [date]
- Participants: [names]
- Duration: [20-30 minutes]
- Why this session counts: [Live recorded one-on-one feedback session per Feedback Pie rules]
```

**Total completed recorded sessions:** [number]

---

# One-Slide Summary

```md
Project name: The Quest
Repo: [GitHub URL]
Live product: https://thequesters.fun
Demo video link: [video URL]
X account: @the_questgg

Weekly update posts:

- Week 1: [URL]
- Week 2: [URL]
- Week 3: [URL]
- Week 4: [URL]
- Week 5: [URL]
- Week 6: [URL]
- Week 7: [URL]
- Week 8: [URL]
- Week 9: [URL]
- Week 10: [URL]
- Week 11: [URL]
- Week 12: [URL]

Optional track evidence:
Cardano: Mainnet live since July 13, 2026 — deposits, payouts, on-chain proof, public ledger at /ledger
Real User: [Mainnet deposit tx link + acquisition story]
Feedback: [Session links if applicable]
```

---

## Presenter Notes

- Open https://thequesters.fun/ledger during the demo — it is the strongest single piece of evidence: public, verifiable, on-chain
- Lead with the full loop demo: post → pay ADA → claim → submit → approve → payout → on-chain proof
- The payment gate is native to the product, not bolted on — emphasize that posting a mission IS the purchase
- Testnet numbers (50 testers, 121k tADA) prove real usage before mainnet — mainnet transactions prove real economic activity now
- Keep all links public and clickable in the deck
