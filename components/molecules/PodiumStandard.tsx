import { Card } from '@/components/ui/card'
import { PodiumAvatar } from '@/components/atoms/PodiumAvatar'
import { RankBadge } from '@/components/atoms/RankBadge'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

interface PodiumStandardProps {
  rank: number
  username: string
  badge: 'LEGEND' | 'ELITE' | 'VETERAN'
  xp: number
  bounties: number
  avatar: string | null
  className?: string
}

type PodiumRank = keyof typeof QUEST_CONFIG.hallOfFame.podiumBorderConfig

export function PodiumStandard({
  rank,
  username,
  badge,
  avatar,
  className,
}: PodiumStandardProps) {
  const borderClasses = QUEST_CONFIG.hallOfFame.podiumBorderConfig[rank as PodiumRank]

  return (
    <Card
      className={cn(
        'flex flex-col items-center gap-3 rounded-[16px] border bg-card p-5',
        borderClasses,
        rank === 3 && 'shadow-[0_0_16px_rgb(194_65_12/0.2)]',
        className
      )}
    >
      <PodiumAvatar src={avatar} username={username} size="sm" />
      <RankBadge tier={badge} />
      <span className="text-base font-bold text-foreground">{username}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        RANK {String(rank).padStart(2, '0')}
      </span>
    </Card>
  )
}
