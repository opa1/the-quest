import Link from "next/link"
import { Link2, ExternalLink } from "lucide-react"
import UserAvatar from "@/components/atoms/UserAvatar"
import TimeAgo from "@/components/atoms/TimeAgo"
import { explorerTxUrl } from "@/lib/config/cardano.config"
import { formatAda } from "@/lib/utils/currency"
import type { Network } from "@/lib/config/network"
import { cn } from "@/lib/utils"

export type Payout = {
  id: string
  username: string | null
  avatarUrl: string | null
  txHash: string
  at: string
}

interface PayoutProofListProps {
  payouts: Payout[]
  /** Per-person reward — one payout of this leaves the wallet per approval. */
  adaReward: number
  maxClaimers: number
  network: Network
  className?: string
}

function truncate(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

/**
 * Every hunter this mission has actually paid, with the transaction to prove it.
 *
 * Shown whatever state the mission is in. Proof used to appear only once a task
 * reached 'completed', and only for the first transaction — so a mission that
 * had paid one of two people displayed nothing at all, despite the ADA having
 * left the wallet. Sourced from task_logs rather than task_claims because
 * completions that predate the claims table exist only in the log.
 */
export default function PayoutProofList({
  payouts,
  adaReward,
  maxClaimers,
  network,
  className,
}: PayoutProofListProps) {
  if (payouts.length === 0) return null

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[16px] border border-primary/40 bg-primary/10 p-5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
            Rewards Released
          </span>
        </div>
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          {payouts.length} of {maxClaimers} paid
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {payouts.map((payout) => (
          <div key={payout.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <UserAvatar
                  src={payout.avatarUrl}
                  username={payout.username ?? "Unknown"}
                  size="sm"
                />
                <span className="truncate text-sm font-semibold text-foreground">
                  @{payout.username ?? "Unknown"}
                </span>
              </div>
              <span className="shrink-0 text-sm font-bold text-primary">
                {formatAda(adaReward, network)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pl-8">
              <Link
                href={explorerTxUrl(network, payout.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {truncate(payout.txHash)}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </Link>
              <TimeAgo
                date={payout.at}
                className="shrink-0 text-[10px] text-muted-foreground"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
