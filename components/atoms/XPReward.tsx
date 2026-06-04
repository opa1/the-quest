import { cn } from '@/lib/utils'

interface XPRewardProps {
  xp: number
  className?: string
}

export function XPReward({ xp, className }: XPRewardProps) {
  return (
    <span
      className={cn(
        'text-xs font-semibold text-muted-foreground uppercase tracking-widest',
        className
      )}
    >
      +{xp.toLocaleString()} XP
    </span>
  )
}
