# The Quest

> Complete missions. Earn ADA. Build your on-chain reputation.

## Live Demo

**[https://thequestgg.vercel.app](https://thequestgg.vercel.app)**

## What is The Quest?

The Quest is a Cardano-powered community bounty platform where anyone can post tasks, claim missions, and earn real ADA for completing work. Every completed task is permanently recorded on the Cardano blockchain, giving contributors a verifiable, portable reputation that no platform can delete.

## How It Works

1. Sign in with X (Twitter)
2. Complete onboarding: claim your username and link your Cardano wallet
3. Browse open missions on the Realm or Missions page
4. Claim a mission, complete the work, and submit proof
5. Poster reviews and approves: ADA released to your wallet instantly
6. Transaction hash recorded on Cardano and your reputation grows permanently

## Features

- **Post Missions**: Fund missions with real ADA directly from your Cardano wallet via CIP-30
- **Claim and Complete**: Claim open missions and submit proof of work (URL, text, image, or any combination)
- **On-chain Payouts**: Approved work triggers a real Cardano transaction to the claimer's wallet
- **Proof System**: Posters define what proof they accept per mission
- **Poster Controls**: Approve, reject, or ban users from specific missions
- **XP and Leaderboard**: Earn XP for completing missions and compete on the global leaderboard
- **Realm Feed**: See recent missions and live activity from the community
- **Dark RPG Theme**: Fully responsive UI with a dark fantasy aesthetic

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4, shadcn/ui |
| Auth and DB | Supabase (Auth, Postgres, Realtime, RLS) |
| State | Zustand v5 |
| Blockchain | Cardano (Preprod / Mainnet) |
| Wallet | CIP-30 via @cardano-foundation/cardano-connect-with-wallet |
| Lucid (client) | @lucid-evolution/lucid (WASM bundled client-side) |
| Lucid (server) | Express microservice (WASM isolated from Next.js) |
| Language | TypeScript |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- A Supabase project
- A Blockfrost account (Preprod or Mainnet)
- A Cardano wallet set to Preprod with test ADA. Get free tADA from the [Cardano Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet/) (select network: Preprod)

### Installation

```bash
# Install Next.js dependencies
pnpm install

# Install Cardano microservice dependencies
cd cardano-service && npm install && cd ..
```

### Environment Setup

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_SECRET_KEY` | Supabase service role secret key |
| `NEXT_PUBLIC_CARDANO_NETWORK` | Preprod or Mainnet |
| `NEXT_PUBLIC_BLOCKFROST_PROJECT_ID` | Blockfrost project ID (client-side) |
| `BLOCKFROST_PROJECT_ID` | Blockfrost project ID (server-side) |
| `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS` | Platform wallet address (receives bounty deposits) |
| `PLATFORM_WALLET_SEED` | AES-256-CBC encrypted platform wallet seed |
| `PLATFORM_WALLET_ENCRYPTION_KEY` | 32-byte hex key used to decrypt the seed |
| `CARDANO_SERVICE_URL` | URL of the Cardano microservice (default: http://localhost:3002) |
| `CARDANO_SERVICE_SECRET` | Shared secret for Next.js to microservice auth |

The Cardano microservice reads its own environment from `cardano-service/.env` (same variables minus the NEXT_PUBLIC ones).

### Development

```bash
# Start both Next.js and the Cardano microservice
pnpm dev:all

# Or start them separately
pnpm dev           # Next.js on port 3000
pnpm dev:cardano   # Cardano microservice on port 3002
```

### Build

```bash
pnpm build
```

## Cardano Microservice

The `cardano-service/` directory is a standalone Express server that isolates Lucid Evolution's WASM from Next.js's server runtime.

**Why it exists:** `@lucid-evolution/lucid` bundles `@anastasia-labs/cardano-multiplatform-lib-nodejs` which uses native WASM. This cannot be resolved by Next.js's Node.js server on all platforms. The microservice handles all server-side Lucid operations and Next.js calls it over HTTP.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | /health | Returns status ok and current network |
| POST | /payout | Sends ADA from platform wallet to a given address |

All requests must include the `x-service-secret` header matching `CARDANO_SERVICE_SECRET`.

## License

MIT
