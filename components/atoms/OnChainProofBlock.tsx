import { Link2 } from "lucide-react"
import { TxHashBlock } from "@/components/atoms/TxHashBlock"
import { TxStatusBadge } from "@/components/atoms/TxStatusBadge"
import TimeAgo from "@/components/atoms/TimeAgo"
import { TextLink } from "@/components/atoms/TextLink"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import { CARDANO_NETWORK } from "@/lib/config/cardano.config"
import { cn } from "@/lib/utils"

interface OnChainProofBlockProps {
  txHash: string
  completedAt: string
  className?: string
}

export default function OnChainProofBlock({
  txHash,
  completedAt,
  className,
}: OnChainProofBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[14px] border border-primary/40 bg-primary/10 p-6",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold tracking-widest text-primary uppercase">
          {QUEST_CONFIG.taskDetail.onChainTitle}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {QUEST_CONFIG.taskDetail.onChainSubtext}
      </p>
      <TxHashBlock blockHash={txHash} txId={txHash} compact={false} />
      <div className="flex items-center justify-between">
        <TxStatusBadge status="CONFIRMED" />
        <TimeAgo date={completedAt} />
      </div>
      <TextLink
        label="VIEW ON CARDANOSCAN"
        href={
          CARDANO_NETWORK === "Mainnet"
            ? `https://cardanoscan.io/transaction/${txHash}`
            : `https://preprod.cardanoscan.io/transaction/${txHash}`
        }
      />
    </div>
  )
}
