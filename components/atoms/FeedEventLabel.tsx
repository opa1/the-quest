import { cn } from '@/lib/utils'
import type { FeedEventType } from '@/lib/types/feed'

interface FeedEventLabelProps {
  type: FeedEventType
  className?: string
}

const labelMap: Record<FeedEventType, string> = {
  new_bounty: 'posted a new bounty',
  claimed:    'claimed a mission',
  completed:  'completed a quest',
}

const colorMap: Record<FeedEventType, string> = {
  new_bounty: 'text-primary',
  claimed:    'text-blue-400',
  completed:  'text-green-400',
}

export default function FeedEventLabel({ type, className }: FeedEventLabelProps) {
  return (
    <span className={cn('text-xs font-semibold uppercase tracking-wider', colorMap[type], className)}>
      {labelMap[type]}
    </span>
  )
}
