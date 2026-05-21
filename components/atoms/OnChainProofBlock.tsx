import { Link2 } from 'lucide-react'
import { TxHashBlock } from '@/components/atoms/TxHashBlock'
import { TxStatusBadge } from '@/components/atoms/TxStatusBadge'
import TimeAgo from '@/components/atoms/TimeAgo'
import { TextLink } from '@/components/atoms/TextLink'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

interface OnChainProofBlockProps {
  txHash: string
  completedAt: string
  className?: string
}

export default function OnChainProofBlock({ txHash, completedAt, className }: OnChainProofBlockProps) {
  return (
    <div className={cn('bg-primary/10 border border-primary/40 rounded-[14px] p-6 flex flex-col gap-4', className)}>
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-primary" />
        <span className="text-xs uppercase tracking-widest font-bold text-primary">
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
      <TextLink label="VIEW ON CARDANOSCAN" href={`https://cardanoscan.io/transaction/${txHash}`} />
    </div>
  )
}
