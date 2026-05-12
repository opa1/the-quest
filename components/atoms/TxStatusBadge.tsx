import { Badge } from '@/components/ui/badge'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

type TxStatus = 'CONFIRMED' | 'ARCHIVED'

interface TxStatusBadgeProps {
  status: TxStatus
  className?: string
}

export function TxStatusBadge({ status, className }: TxStatusBadgeProps) {
  const config = QUEST_CONFIG.ledger.txStatusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider',
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', config.dotClass)} />
      <span className={config.textClass}>{config.label}</span>
    </Badge>
  )
}
