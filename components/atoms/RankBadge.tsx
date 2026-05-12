import { Badge } from '@/components/ui/badge'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

type RankTier = 'LEGEND' | 'ELITE' | 'VETERAN'

interface RankBadgeProps {
  tier: RankTier
  className?: string
}

export function RankBadge({ tier, className }: RankBadgeProps) {
  const config = QUEST_CONFIG.hallOfFame.rankBadgeConfig[tier]

  return (
    <Badge
      variant="outline"
      className={cn(
        'px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
