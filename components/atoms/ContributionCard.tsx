import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CategoryBadge } from '@/components/atoms/CategoryBadge'
import { DifficultyBadge } from '@/components/atoms/DifficultyBadge'
import { XPReward } from '@/components/atoms/XPReward'
import { AdaReward } from '@/components/atoms/AdaReward'
import { TxHashBlock } from '@/components/atoms/TxHashBlock'
import { TxStatusBadge } from '@/components/atoms/TxStatusBadge'
import TimeAgo from '@/components/atoms/TimeAgo'
import { cn } from '@/lib/utils'
import type { ContributionRecord } from '@/lib/types/missions'

interface ContributionCardProps {
  record: ContributionRecord
  className?: string
}

export default function ContributionCard({ record, className }: ContributionCardProps) {
  return (
    <Card
      className={cn(
        'bg-card border-border/40 rounded-[16px] p-5 flex flex-col gap-4 hover:border-primary/20 transition-colors duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CategoryBadge label={record.category} />
          <DifficultyBadge difficulty={record.difficulty as any} />
        </div>
        <TimeAgo date={record.completed_at} />
      </div>

      <p className="text-base font-bold text-foreground leading-snug">
        {record.task_title}
      </p>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        {record.cardano_tx_hash ? (
          <TxHashBlock
            blockHash={record.cardano_tx_hash}
            txId={record.cardano_tx_hash}
            compact
            className="flex-1 min-w-0"
          />
        ) : (
          <span className="text-xs text-muted-foreground italic">Proof pending</span>
        )}
        <div className="flex items-center gap-2 shrink-0">
          {record.ada_reward > 0 && <AdaReward lovelace={record.ada_reward} />}
          <XPReward xp={record.reward_credits} />
          <TxStatusBadge status={record.cardano_tx_hash ? 'CONFIRMED' : 'ARCHIVED'} />
        </div>
      </div>
    </Card>
  )
}
