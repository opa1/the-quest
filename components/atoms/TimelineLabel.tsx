import { cn } from '@/lib/utils'

interface TimelineLabelProps {
  label: string
  side: 'left' | 'right'
  className?: string
}

export function TimelineLabel({ label, side, className }: TimelineLabelProps) {
  return (
    <span
      className={cn(
        'whitespace-nowrap font-mono text-xs uppercase tracking-wider text-muted-foreground',
        side === 'left' ? 'text-right' : 'text-left',
        className
      )}
    >
      {label}
    </span>
  )
}
