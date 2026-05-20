import { cn } from '@/lib/utils'
import type { FeedFilter } from '@/lib/types/feed'

interface FeedFilterTabProps {
  label: string
  value: FeedFilter
  isActive: boolean
  onClick: () => void
  className?: string
}

export default function FeedFilterTab({ label, isActive, onClick, className }: FeedFilterTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground font-bold'
          : 'bg-muted/40 border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30',
        className
      )}
    >
      {label}
    </button>
  )
}
