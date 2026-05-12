import { Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StepIcon } from '@/components/atoms/StepIcon'
import { TxStatusBadge } from '@/components/atoms/TxStatusBadge'
import { TxHashBlock } from '@/components/atoms/TxHashBlock'
import { RepMinted } from '@/components/atoms/RepMinted'
import { cn } from '@/lib/utils'

interface TransactionCardProps {
  id: string
  icon: string
  title: string
  timestamp: string
  status: 'CONFIRMED' | 'ARCHIVED'
  blockHash: string
  txId: string
  repMinted: number | null
  className?: string
}

export function TransactionCard({
  icon,
  title,
  timestamp,
  status,
  blockHash,
  txId,
  repMinted,
  className,
}: TransactionCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col gap-4 rounded-[14px] border border-border/50 bg-card p-5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <StepIcon iconName={icon} />
          <div className="flex flex-col gap-1">
            <span className="text-base font-bold text-foreground">{title}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timestamp}
            </span>
          </div>
        </div>
        <TxStatusBadge status={status} />
      </div>

      <Separator className="bg-border/50" />

      <TxHashBlock blockHash={blockHash} txId={txId} compact={status === 'ARCHIVED'} />

      {repMinted !== null && <RepMinted amount={repMinted} />}
    </Card>
  )
}
