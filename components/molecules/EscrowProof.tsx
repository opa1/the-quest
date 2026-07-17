import Link from "next/link"
import { Lock, ExternalLink } from "lucide-react"
import { explorerTxUrl } from "@/lib/config/cardano.config"
import { formatAda } from "@/lib/utils/currency"
import type { Network } from "@/lib/config/network"
import { cn } from "@/lib/utils"

interface EscrowProofProps {
  depositTxHash: string | null
  /** Total locked up front — mirrors the sum verifyDepositCoversBounty checks. */
  totalEscrow: number
  network: Network
  className?: string
}

function truncate(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

/**
 * The poster's escrow deposit, with the transaction to prove it.
 *
 * We have always recorded this — every payout and refund is gated on
 * verifyDepositCoversBounty re-checking it on-chain — but nothing ever showed
 * it. It is the answer to the only question a hunter really has before starting
 * work: is the money actually there? Missions predating escrow have no hash and
 * render nothing rather than implying they were funded.
 */
export default function EscrowProof({
  depositTxHash,
  totalEscrow,
  network,
  className,
}: EscrowProofProps) {
  if (!depositTxHash || totalEscrow <= 0) return null

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[16px] border border-border/50 bg-card p-5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-green-400" />
          <span className="text-[10px] font-bold tracking-widest text-green-400 uppercase">
            Mission Funded
          </span>
        </div>
        <span className="shrink-0 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          {formatAda(totalEscrow, network)} escrowed
        </span>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The full bounty was locked on-chain when this mission was posted.
      </p>

      <Link
        href={explorerTxUrl(network, depositTxHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-[8px] border border-border/40 bg-background/60 px-3 py-2 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="break-all">{truncate(depositTxHash)}</span>
        <ExternalLink className="h-3 w-3 shrink-0" />
      </Link>
    </div>
  )
}
