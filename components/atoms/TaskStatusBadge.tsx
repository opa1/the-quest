import { Badge } from '@/components/ui/badge'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

type TaskStatus = 'open' | 'claimed' | 'completed' | 'cancelled'

interface TaskStatusBadgeProps {
  status: TaskStatus
  className?: string
}

export default function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const { statusLabels, statusColors } = QUEST_CONFIG.taskDetail

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[11px] font-bold uppercase tracking-widest',
        statusColors[status],
        className
      )}
    >
      {statusLabels[status]}
    </Badge>
  )
}
