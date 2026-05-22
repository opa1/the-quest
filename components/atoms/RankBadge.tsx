import { cn } from '@/lib/utils'

interface RankBadgeProps {
  rank: number
  className?: string
}

const rankStyle: Record<number, string> = {
  1: 'text-amber-400 font-black text-lg',
  2: 'text-slate-300 font-black text-lg',
  3: 'text-orange-400 font-black text-lg',
}

export default function RankBadge({ rank, className }: RankBadgeProps) {
  return (
    <span
      className={cn(
        'tabular-nums font-bold text-base text-muted-foreground',
        rankStyle[rank],
        className
      )}
    >
      #{rank}
    </span>
  )
}
