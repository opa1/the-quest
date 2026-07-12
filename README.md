# The Quest

> Complete missions. Earn ADA. Build your on-chain reputation.

## Live

**[https://thequesters.fun](https://thequesters.fun)**

## What is The Quest?

The Quest is a Cardano-powered bounty platform where anyone can post tasks, claim missions, and earn **real ADA** for completing work. Posters fund a mission's reward in escrow; the platform releases it on-chain when the work is approved. Every completed mission carries an explorer-verifiable transaction hash, giving contributors a portable, un-deletable reputation.

## How It Works

1. Sign in with **X (Twitter)** or by **signing a nonce with a Cardano wallet** (no password)
2. Onboard: claim a username and link your Cardano wallet
3. Browse open missions on the Realm / Missions page
4. Claim a mission, do the work, submit proof (URL, text, image, or any)
5. Poster reviews and approves → ADA is released on-chain to the claimer's wallet
6. The transaction hash is recorded on Cardano and reputation grows permanently

## Features

- **On-chain payouts** — approval triggers a real Cardano transaction; the tx hash is surfaced as verifiable proof
- **Escrow with on-chain verification** — deposits are confirmed on-chain before any payout, with idempotent, double-spend-safe release and **automatic deadline refunds** for unfilled slots
- **Wallet-native auth** — CIP-8 / COSE_Sign1 (Ed25519) signature verification; X OAuth also supported
- **Multi-claimer missions** — one bounty, up to 100 hunters, per-person rewards
- **AI mission calibration** — Groq (Llama 3.3 70B) suggests difficulty + a fair XP reward from the brief
- **XP, leaderboard, and a public on-chain ledger**

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, RSC, Server Actions) · React 19 |
| Styling | Tailwind CSS v4, shadcn/ui |
| Auth & DB | Supabase (Auth, Postgres, RLS) — one project per network |
| State | Zustand v5 |
| Blockchain | Cardano (Preprod + Mainnet) via Lucid Evolution + Blockfrost |
| Wallet | CIP-30 via @cardano-foundation/cardano-connect-with-wallet |
| Signer | standalone Express microservice (isolates Lucid WASM, holds the platform wallet) |
| Testing | Vitest |
| Language | TypeScript |

## Getting Started

### Prerequisites

- Node.js 20+, pnpm 11+
- A Supabase project (or two — see [Dual-network](#dual-network-testnet--mainnet))
- A Blockfrost project id (Preprod and/or Mainnet)
- A Cardano wallet with test ADA for Preprod ([Cardano Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet/))

### Installation

```bash
pnpm install
cd cardano-service && npm install && cd ..
```

### Environment

```bash
cp .env.example .env   # fill in the values (grouped by comment)
```
Env is organized per network with `*_TESTNET` / `*_MAINNET` pairs (Supabase, wallet-auth secret, platform address) plus server-side `BLOCKFROST_PROJECT_ID` / `BLOCKFROST_PROJECT_ID_MAINNET`. The signing microservice reads its own `cardano-service/.env`.

### Development

```bash
pnpm dev:all       # Next.js (:3000) + Cardano microservice (:3002)
# or separately:
pnpm dev           # app only
pnpm dev:cardano   # signer only
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm build` / `start` | production build / serve |
| `pnpm typecheck` · `lint` · `format` | tsc · eslint · prettier |
| `pnpm test` · `test:watch` · `test:coverage` | Vitest |
| `pnpm stats` | realm stats (`--mainnet` for mainnet) |
| `node scripts/backfill-wallet-key-hash.mjs` | backfill network-agnostic wallet identity (`--dry-run`, `--mainnet`) |
| `node scripts/derive-platform-address.mjs` | print the platform wallet address + balance (`--mainnet`) |

## Dual-network (testnet + mainnet)

One deployment serves both networks:

- **`NEXT_PUBLIC_DEFAULT_NETWORK`** sets the front-door network; an `active_network` cookie overrides it per user (toggle in Profile). Cutover to mainnet is a single env flip.
- Supabase, wallet-auth secret, Blockfrost, and the platform wallet address are all resolved **per network**. The platform wallet uses **one seed** — only the derived address differs per network.
- The signing microservice picks the network per payout request, so a single instance serves both.
- Users migrate their profile across networks (matched by X id or wallet key hash) with an idempotent, fail-closed copy and a one-time welcome bonus for active testnet users. See `app/actions/migration.ts`.

## Maintenance mode

Set `MAINTENANCE_MODE=true` to route all traffic to `/maintenance` during a migration/deploy. The page remembers where each user was and sends them back automatically once maintenance ends.

## Cardano microservice

`cardano-service/` is a standalone Express server that isolates Lucid Evolution's WASM from Next.js and holds the platform wallet seed (decrypted only in memory).

| Method | Path | Description |
|---|---|---|
| GET | `/health` | `{ status: "ok" }` |
| POST | `/payout` | send ADA from the platform wallet on the requested `network` |

`/payout` requires the `x-service-secret` header matching `CARDANO_SERVICE_SECRET`. It ships to Fly.io (`fly deploy` from `cardano-service/`); secrets are set via `fly secrets`, never baked into the image.

## License

MIT
