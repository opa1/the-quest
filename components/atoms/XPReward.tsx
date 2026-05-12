import { cn } from '@/lib/utils'

interface XPRewardProps {
  xp: number
  className?: string
}

const formatXP = (xp: number) => `+${xp.toLocaleString()} XP`
const isLegendary = (xp: number) => xp >= 10000

export function XPReward({ xp, className }: XPRewardProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        REWARD
      </span>
      <span
        className={cn(
          'font-black text-primary',
          isLegendary(xp) ? 'text-3xl' : 'text-2xl'
        )}
      >
        {formatXP(xp)}
      </span>
    </div>
  )
}
